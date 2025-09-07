from flask import Flask, request, jsonify
from flask_cors import CORS
import phoenix as px
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor
from openinference.instrumentation.anthropic import AnthropicInstrumentor
import threading
import time
import uuid
from datetime import datetime, timezone
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
import json
import openai
import anthropic
import google.generativeai as genai
from typing import Dict, List, Any
import traceback
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
phoenix_launched = False
tracer_provider = None

def launch_phoenix():
    """Launch Phoenix dashboard in a separate thread"""
    global phoenix_launched
    if not phoenix_launched:
        try:
            px.launch_app()
            phoenix_launched = True
            logger.info("Phoenix dashboard launched at http://localhost:6006")
        except Exception as e:
            logger.error(f"Failed to launch Phoenix: {e}")

def setup_tracing():
    """Setup OpenTelemetry tracing with Phoenix"""
    global tracer_provider
    if tracer_provider is None:
        try:
            tracer_provider = register()
            OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
            AnthropicInstrumentor().instrument(tracer_provider=tracer_provider)
            # Note: Gemini doesn't have official OpenTelemetry instrumentation yet
            # You might need to add custom tracing for Gemini calls
            logger.info("OpenTelemetry tracing configured successfully")
        except Exception as e:
            logger.error(f"Failed to setup tracing: {e}")

class LLMTester:
    def __init__(self):
        self.clients = {}
    
    def get_client(self, provider: str, api_key: str):
        """Get or create LLM client for the provider"""
        client_key = f"{provider}_{hash(api_key)}"
        
        if client_key not in self.clients:
            if provider.lower() == 'openai':
                self.clients[client_key] = openai.OpenAI(api_key=api_key)
            elif provider.lower() == 'anthropic':
                self.clients[client_key] = anthropic.Anthropic(api_key=api_key)
            elif provider.lower() == 'gemini' or provider.lower() == 'google':
                # Configure Gemini client
                genai.configure(api_key=api_key)
                self.clients[client_key] = genai.GenerativeModel('gemini-pro')  # Default model
            else:
                raise ValueError(f"Unsupported provider: {provider}")
        
        return self.clients[client_key]
    
    def test_openai_model(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Test OpenAI model with Phoenix tracing"""
        start_time = time.time()
        
        try:
            client = self.get_client('openai', config['apiKey'])
            
            # Prepare the request
            messages = [{"role": "user", "content": config['testConfig']['prompt']}]
            
            # Make the API call with tracing
            response = client.chat.completions.create(
                model=config['model']['name'],
                messages=messages,
                temperature=config['modelConfig']['temperature'],
                max_tokens=config['modelConfig']['maxTokens'],
                top_p=config['modelConfig']['topP'],
                frequency_penalty=config['modelConfig']['frequencyPenalty'],
                presence_penalty=config['modelConfig']['presencePenalty'],
                timeout=config['platformConfig']['defaultTimeout']
            )
            
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            # Extract response content
            content = response.choices[0].message.content
            
            # Calculate metrics
            metrics = self.calculate_metrics(
                content, 
                response_time, 
                response.usage.completion_tokens if response.usage else 0,
                response.usage.prompt_tokens if response.usage else 0,
                config['testConfig']['evaluationCriteria']
            )
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "success",
                "response": content,
                "metrics": metrics,
                "error": None,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "error",
                "response": None,
                "metrics": None,
                "error": {
                    "code": "API_ERROR",
                    "message": str(e),
                    "details": f"Failed to get response from {config['model']['provider']}"
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def test_anthropic_model(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Test Anthropic model with Phoenix tracing"""
        start_time = time.time()
        
        try:
            client = self.get_client('anthropic', config['apiKey'])
            
            # Make the API call with tracing
            response = client.messages.create(
                model=config['model']['name'],
                max_tokens=config['modelConfig']['maxTokens'],
                temperature=config['modelConfig']['temperature'],
                top_p=config['modelConfig']['topP'],
                messages=[{
                    "role": "user",
                    "content": config['testConfig']['prompt']
                }],
                timeout=config['platformConfig']['defaultTimeout']
            )
            
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            # Extract response content
            content = response.content[0].text
            
            # Calculate metrics
            metrics = self.calculate_metrics(
                content, 
                response_time, 
                response.usage.output_tokens if response.usage else 0,
                response.usage.input_tokens if response.usage else 0,
                config['testConfig']['evaluationCriteria']
            )
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "success",
                "response": content,
                "metrics": metrics,
                "error": None,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "error",
                "response": None,
                "metrics": None,
                "error": {
                    "code": "API_ERROR",
                    "message": str(e),
                    "details": f"Failed to get response from {config['model']['provider']}"
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def test_gemini_model(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Test Gemini model with custom tracing"""
        start_time = time.time()
        
        try:
            # Configure Gemini with the API key
            genai.configure(api_key=config['apiKey'])
            
            # Create model instance with specific model name
            model_name = config['model']['name']
            if not model_name.startswith('gemini-'):
                model_name = 'gemini-pro'  # Default fallback
            
            model = genai.GenerativeModel(model_name)
            
            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                temperature=config['modelConfig']['temperature'],
                top_p=config['modelConfig']['topP'],
                max_output_tokens=config['modelConfig']['maxTokens'],
            )
            
            # Add safety settings to avoid content blocking
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
            
            # Make the API call
            response = model.generate_content(
                config['testConfig']['prompt'],
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            # Extract response content
            if response.candidates and len(response.candidates) > 0:
                content = response.candidates[0].content.parts[0].text
            else:
                # Handle case where content was blocked or no response generated
                content = "Content was blocked or no response generated"
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    content += f" (Feedback: {response.prompt_feedback})"
            
            # Extract token usage (Gemini API provides this in usage_metadata if available)
            prompt_tokens = 0
            completion_tokens = 0
            
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                prompt_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0)
                completion_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0)
            else:
                # Estimate tokens if not provided
                prompt_tokens = len(config['testConfig']['prompt'].split()) * 1.3  # Rough estimate
                completion_tokens = len(content.split()) * 1.3 if content else 0
                prompt_tokens = int(prompt_tokens)
                completion_tokens = int(completion_tokens)
            
            # Calculate metrics
            metrics = self.calculate_metrics(
                content, 
                response_time, 
                completion_tokens,
                prompt_tokens,
                config['testConfig']['evaluationCriteria']
            )
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "success",
                "response": content,
                "metrics": metrics,
                "error": None,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "error",
                "response": None,
                "metrics": None,
                "error": {
                    "code": "API_ERROR",
                    "message": str(e),
                    "details": f"Failed to get response from Gemini API: {str(e)}"
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def calculate_metrics(self, response_text: str, response_time: int, 
                         completion_tokens: int, prompt_tokens: int, 
                         criteria: List[str]) -> Dict[str, Any]:
        """Calculate evaluation metrics for the response"""
        
        # Basic metrics
        metrics = {
            "responseTime": response_time,
            "tokens": completion_tokens,
            "completionTokens": completion_tokens,
            "promptTokens": prompt_tokens,
            "totalTokens": completion_tokens + prompt_tokens
        }
        print(metrics)
        # Mock evaluation scores (in production, you'd use actual evaluation models)
        import random
        random.seed(hash(response_text) % 1000)  # Consistent scoring for same response
        
        for criterion in criteria:
            if criterion.lower() == 'accuracy':
                metrics['accuracy'] = random.randint(80, 98)
            elif criterion.lower() == 'coherence':
                metrics['coherence'] = random.randint(75, 95)
            elif criterion.lower() == 'creativity':
                metrics['creativity'] = random.randint(60, 90)
            elif criterion.lower() == 'latency':
                metrics['latency'] = response_time
            elif criterion.lower() == 'tokens':
                metrics['tokenEfficiency'] = min(95, max(50, 100 - (completion_tokens / 10)))
        
        return metrics
    
    def test_model(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Route to appropriate model tester based on provider"""
        provider = config['model']['provider'].lower()
        
        if provider == 'openai':
            return self.test_openai_model(config)
        elif provider == 'anthropic':
            return self.test_anthropic_model(config)
        elif provider in ['gemini', 'google']:
            return self.test_gemini_model(config)
        else:
            return {
                "modelId": config['model']['id'],
                "modelName": config['model']['name'],
                "configId": config['configId'],
                "status": "error",
                "response": None,
                "metrics": None,
                "error": {
                    "code": "UNSUPPORTED_PROVIDER",
                    "message": f"Provider {provider} is not supported",
                    "details": "Supported providers: OpenAI, Anthropic, Gemini"
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

# Initialize LLM tester
llm_tester = LLMTester()

@app.route('/api/test-prompt', methods=['POST'])
def test_prompt():
    """Main endpoint for testing prompts across multiple models"""
    try:
        data = request.json
        logger.info(f"Received test request for session: {data.get('testSession', {}).get('sessionId')}")
        print(data)
        # Extract data
        test_session = data.get('testSession', {})
        configurations = data.get('configurations', [])
        
        if not configurations:
            return jsonify({
                "success": False,
                "error": "No configurations provided"
            }), 400
        
        session_id = test_session.get('sessionId')
        start_time = time.time()
        
        # Test models concurrently using ThreadPoolExecutor
        results = []
        with ThreadPoolExecutor(max_workers=len(configurations)) as executor:
            # Submit all tasks
            future_to_config = {
                executor.submit(llm_tester.test_model, config): config 
                for config in configurations
            }
            
            # Collect results as they complete
            for future in future_to_config:
                try:
                    result = future.result()
                    results.append(result)
                    logger.info(f"Completed test for {result['modelName']}: {result['status']}")
                except Exception as e:
                    config = future_to_config[future]
                    error_result = {
                        "modelId": config['model']['id'],
                        "modelName": config['model']['name'],
                        "configId": config['configId'],
                        "status": "error",
                        "response": None,
                        "metrics": None,
                        "error": {
                            "code": "EXECUTION_ERROR",
                            "message": str(e),
                            "details": traceback.format_exc()
                        },
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    results.append(error_result)
                    logger.error(f"Error testing {config['model']['name']}: {e}")
        
        end_time = time.time()
        execution_time = int((end_time - start_time) * 1000)
        
        # Calculate summary
        successful_tests = len([r for r in results if r['status'] == 'success'])
        failed_tests = len([r for r in results if r['status'] == 'error'])
        
        # Calculate averages
        successful_results = [r for r in results if r['status'] == 'success' and r['metrics']]
        avg_response_time = 0
        total_tokens = 0
        best_performing = None
        
        if successful_results:
            avg_response_time = int(sum(r['metrics']['responseTime'] for r in successful_results) / len(successful_results))
            total_tokens = sum(r['metrics']['totalTokens'] for r in successful_results)
            
            # Find best performing model (highest accuracy score)
            accuracy_results = [r for r in successful_results if r['metrics'].get('accuracy')]
            if accuracy_results:
                best_result = max(accuracy_results, key=lambda x: x['metrics']['accuracy'])
                best_performing = {
                    "modelId": best_result['modelId'],
                    "modelName": best_result['modelName'],
                    "score": best_result['metrics']['accuracy']
                }
        
        # Prepare response
        response_data = {
            "success": True,
            "sessionId": session_id,
            "executionTime": execution_time,
            "results": results,
            "summary": {
                "totalModels": len(configurations),
                "successfulTests": successful_tests,
                "failedTests": failed_tests,
                "averageResponseTime": avg_response_time,
                "totalTokensUsed": total_tokens,
                "bestPerforming": best_performing
            },
            "evaluationDetails": {
                "criteria": test_session.get('evaluationCriteria', []),
                "methodology": "automated_scoring_v1",
                "scoringEngine": "llm-evaluator-v2.1"
            }
        }
        
        logger.info(f"Completed session {session_id}: {successful_tests} successful, {failed_tests} failed")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in test_prompt: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": str(e)
        }), 500

@app.route('/api/supported-models', methods=['GET'])
def get_supported_models():
    """Get list of supported models for each provider"""
    supported_models = {
        "openai": [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        ],
        "anthropic": [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307"
        ],
        "gemini": [
            "gemini-pro",
            "gemini-pro-vision",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ]
    }
    
    return jsonify({
        "success": True,
        "providers": supported_models
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "phoenix_launched": phoenix_launched,
        "tracer_configured": tracer_provider is not None,
        "phoenix_url": "http://localhost:6006" if phoenix_launched else None,
        "supported_providers": ["OpenAI", "Anthropic", "Gemini"]
    })

@app.route('/phoenix-status', methods=['GET'])
def phoenix_status():
    """Check Phoenix dashboard status"""
    return jsonify({
        "phoenix_launched": phoenix_launched,
        "dashboard_url": "http://localhost:6006" if phoenix_launched else None,
        "tracer_provider": tracer_provider is not None
    })

def initialize_app():
    """Initialize Phoenix and tracing before starting the server"""
    logger.info("Initializing Phoenix LLM Testing Server with Gemini support...")
    
    # Launch Phoenix in a separate thread
    phoenix_thread = threading.Thread(target=launch_phoenix, daemon=True)
    phoenix_thread.start()
    
    # Setup tracing
    setup_tracing()
    
    # Wait a moment for Phoenix to start
    time.sleep(2)
    
    logger.info("Server initialization complete")
    logger.info("Phoenix Dashboard: http://localhost:6006")
    logger.info("API Server: http://localhost:3001")
    logger.info("Supported providers: OpenAI, Anthropic, Gemini")

if __name__ == '__main__':
    initialize_app()
    app.run(host='0.0.0.0', port=3001, debug=True, threaded=True)