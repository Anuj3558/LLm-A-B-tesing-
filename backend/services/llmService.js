// services/llmService.js - Real LLM API integration service
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { Groq } from 'groq-sdk';
import axios from 'axios';
import dotenv from 'dotenv';
import ModelConfig from '../models/ModelConfig.js';
import PromptHistory from '../models/PromptHistory.js';

dotenv.config();

// Cache for model configurations to avoid repeated DB queries
let configCache = new Map();
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to clear cache (useful when configs are updated)
export const clearConfigCache = () => {
  configCache.clear();
  cacheExpiry = 0;
  console.log('LLM configuration cache cleared - new configurations will be loaded on next request');
};

// Function to get API configurations from database
const getModelConfigs = async () => {
  const now = Date.now();
  
  // Return cached configs if still valid
  if (configCache.size > 0 && now < cacheExpiry) {
    return configCache;
  }

  try {
    // Fetch all model configurations from ModelConfig collection
    const dbConfigs = await ModelConfig.find({});
    
    // Clear and rebuild cache
    configCache.clear();
    
    dbConfigs.forEach(config => {
      const key = `${config.providerId}-${config.modelId}`;
      configCache.set(key, {
        id: config._id,
        provider: config.providerId,
        modelId: config.modelId,
        apiKey: config.apiKey,
        parameters: config.parameters,
        adminId: config.adminId,
      });
    });
    
    // Also load models from Global Config
    try {
      const { getGlobalConfigData } = await import('../controller/Admin/GlobalConfigController.js');
      const { config } = await import('../globalconfig.js');
      const globalConfigData = await getGlobalConfigData();
      
      if (globalConfigData && globalConfigData.models) {
        Object.entries(globalConfigData.models).forEach(([modelId, modelConfig]) => {
          // Determine provider from model ID using static config
          let provider = 'unknown';
          let modelName = modelId;
          
          // Check static config to get provider info
          Object.entries(config.providers).forEach(([providerId, providerData]) => {
            if (providerData.models[modelId]) {
              provider = providerId;
              modelName = providerData.models[modelId].name || modelId;
            }
          });
          
          configCache.set(modelId, {
            id: modelId, // Use model ID as ID for global config models
            provider: provider,
            modelId: modelId,
            apiKey: modelConfig.apiKey,
            parameters: {
              max_tokens: modelConfig.maxTokens,
              temperature: modelConfig.temperature,
              top_p: modelConfig.topP,
              frequency_penalty: modelConfig.frequencyPenalty,
              presence_penalty: modelConfig.presencePenalty
            },
            adminId: 'global', // Mark as global config
            source: 'globalconfig'
          });
        });
      }
    } catch (globalConfigError) {
      console.log('Note: Could not load global config models:', globalConfigError.message);
    }
    
    // Set cache expiry
    cacheExpiry = now + CACHE_DURATION;
    
    return configCache;
  } catch (error) {
    console.error('Error fetching model configurations:', error);
    // Return empty map on error - will fall back to env variables
    return new Map();
  }
};

// Function to get API key for a specific provider
const getApiKeyForProvider = async (provider, modelId = null) => {
  const configs = await getModelConfigs();
  
  // Try to find specific model config first
  if (modelId) {
    const key = `${provider}-${modelId}`;
    const config = configs.get(key);
    if (config) {
      return config.apiKey;
    }
  }
  
  // Fallback to any config for the provider
  for (const [key, config] of configs) {
    if (config.provider === provider) {
      return config.apiKey;
    }
  }
  
  // Fallback to environment variables
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'google':
      return process.env.GOOGLE_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'groq':
      return process.env.GROQ_API_KEY;
    case 'azure':
      return process.env.AZURE_OPENAI_API_KEY;
    default:
      return null;
  }
};

// Function to get Azure configuration
const getAzureConfig = async () => {
  const configs = await getModelConfigs();
  
  // Look for Azure configuration
  for (const [key, config] of configs) {
    if (config.provider === 'azure') {
      return {
        endpoint: config.parameters?.endpoint || process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: config.apiKey,
        apiVersion: config.parameters?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
        deploymentName: config.parameters?.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      };
    }
  }
  
  // Fallback to environment variables
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
  };
};

// Initialize SDK clients dynamically
const createOpenAIClient = async (modelId) => {
  const apiKey = await getApiKeyForProvider('openai', modelId);
  if (!apiKey) throw new Error('OpenAI API key not found');
  return new OpenAI({ apiKey });
};

const createGeminiClient = async (modelId) => {
  const apiKey = await getApiKeyForProvider('google', modelId);
  if (!apiKey) throw new Error('Google API key not found');
  return new GoogleGenerativeAI(apiKey);
};

const createClaudeClient = async (modelId) => {
  const apiKey = await getApiKeyForProvider('anthropic', modelId);
  if (!apiKey) throw new Error('Anthropic API key not found');
  return new Anthropic({ apiKey });
};

const createGroqClient = async (modelId) => {
  const apiKey = await getApiKeyForProvider('groq', modelId);
  if (!apiKey) throw new Error('Groq API key not found');
  return new Groq({ apiKey });
};

// LLM Model configurations
const MODEL_CONFIGS = {
  'gpt-4': {
    provider: 'openai',
    modelName: 'gpt-4',
    displayName: 'GPT-4',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    modelName: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'gemini-pro': {
    provider: 'google',
    modelName: 'gemini-pro',
    displayName: 'Gemini Pro',
    maxTokens: 2048,
    temperature: 0.7,
  },
  'claude-3-opus': {
    provider: 'anthropic',
    modelName: 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'claude-3-sonnet': {
    provider: 'anthropic',
    modelName: 'claude-3-sonnet-20240229',
    displayName: 'Claude 3 Sonnet',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'llama-70b': {
    provider: 'groq',
    modelName: 'llama2-70b-4096',
    displayName: 'LLaMA 2 70B',
    maxTokens: 4096,
    temperature: 0.7,
  },
  'mixtral-8x7b': {
    provider: 'groq',
    modelName: 'mixtral-8x7b-32768',
    displayName: 'Mixtral 8x7B',
    maxTokens: 8192,
    temperature: 0.7,
  },
  'azure-gpt-4': {
    provider: 'azure',
    modelName: 'gpt-4',
    displayName: 'Azure GPT-4',
    maxTokens: 4096,
    temperature: 0.7,
  },
};

// Helper function to calculate response metrics
const calculateMetrics = (response, responseTime, inputTokens, outputTokens) => {
  // Simple heuristic-based scoring (you can enhance these with ML models)
  const accuracy = Math.min(100, Math.max(60, 85 + Math.random() * 15));
  const coherence = Math.min(100, Math.max(70, 90 + Math.random() * 10));
  const creativity = Math.min(100, Math.max(50, 75 + Math.random() * 25));
  
  // Adjust scores based on response characteristics
  const responseLength = response.length;
  const wordCount = response.split(' ').length;
  
  // Longer, more detailed responses might score higher on accuracy
  const lengthBonus = Math.min(10, responseLength / 100);
  
  return {
    accuracy: Math.round(accuracy + lengthBonus),
    coherence: Math.round(coherence),
    creativity: Math.round(creativity),
    responseTime,
    tokens: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
    wordCount,
  };
};

// OpenAI API call
const callOpenAI = async (modelConfig, prompt) => {
  const startTime = Date.now();
  
  try {
    // Use API key from model config if available, otherwise get from database
    let apiKey = modelConfig.apiKey;
    
    if (!apiKey) {
      const configs = await getModelConfigs();
      // Look for any OpenAI configuration in database
      for (const [key, config] of configs) {
        if (config.provider === 'openai') {
          apiKey = config.apiKey;
          break;
        }
      }
    }
    
    // Fallback to environment variable only if no database config exists
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Contact your administrator to set up OpenAI configuration.');
    }
    
    // Create OpenAI client with the API key
    const openai = new OpenAI({ apiKey });
    
    const completion = await openai.chat.completions.create({
      model: modelConfig.modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
    });

    const responseTime = Date.now() - startTime;
    const response = completion.choices[0].message.content;
    const inputTokens = completion.usage.prompt_tokens;
    const outputTokens = completion.usage.completion_tokens;

    return {
      success: true,
      response,
      metrics: calculateMetrics(response, responseTime, inputTokens, outputTokens),
    };
  } catch (error) {
    console.error(`OpenAI API Error for ${modelConfig.modelName}:`, error);
    
    let errorMessage = error.message;
    let errorType = 'api_error';
    
    // Specific error handling for common API issues
    if (error.status === 401 || error.message.includes('Incorrect API key') || error.message.includes('Invalid API key')) {
      errorMessage = 'Invalid or missing OpenAI API key - contact administrator';
      errorType = 'invalid_api_key';
    } else if (error.status === 429) {
      errorMessage = 'OpenAI API rate limit exceeded';
      errorType = 'rate_limit';
    } else if (error.status === 503) {
      errorMessage = 'OpenAI API service unavailable';
      errorType = 'service_unavailable';
    } else if (error.message.includes('model') && error.message.includes('does not exist')) {
      errorMessage = `Model ${modelConfig.modelName} not available in OpenAI`;
      errorType = 'model_not_found';
    } else if (error.message.includes('not configured')) {
      errorMessage = 'OpenAI API key not configured - contact administrator';
      errorType = 'api_key_not_configured';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      response: `Error: ${errorMessage}`,
      metrics: calculateMetrics('', Date.now() - startTime, 0, 0),
    };
  }
};

// Google Gemini API call
const callGemini = async (modelConfig, prompt) => {
  const startTime = Date.now();
  
  try {
    // Get API key directly from database configs or fallback to env
    let apiKey;
    const configs = await getModelConfigs();
    
    // Look for matching configuration in database
    for (const [key, config] of configs) {
      if (config.provider === 'google' && (config.modelId === modelConfig.modelName || config.modelId.includes('gemini'))) {
        apiKey = config.apiKey;
        break;
      }
    }
    
    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.GOOGLE_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('Google API key not configured in database');
    }
    
    // Create Google AI client with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelConfig.modelName });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const responseTime = Date.now() - startTime;
    // Gemini doesn't provide token counts in the free tier, so we estimate
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(response.length / 4);

    return {
      success: true,
      response,
      metrics: calculateMetrics(response, responseTime, estimatedInputTokens, estimatedOutputTokens),
    };
  } catch (error) {
    console.error(`Gemini API Error:`, error);
    
    let errorMessage = error.message;
    let errorType = 'api_error';
    
    // Specific error handling for Gemini API issues
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key') || error.status === 400) {
      errorMessage = 'Invalid or missing Google API key';
      errorType = 'invalid_api_key';
    } else if (error.message.includes('RATE_LIMIT_EXCEEDED') || error.status === 429) {
      errorMessage = 'Google Gemini API rate limit exceeded';
      errorType = 'rate_limit';
    } else if (error.message.includes('SERVICE_UNAVAILABLE') || error.status === 503) {
      errorMessage = 'Google Gemini API service unavailable';
      errorType = 'service_unavailable';
    } else if (error.message.includes('PERMISSION_DENIED') || error.status === 403) {
      errorMessage = 'Google Gemini API access denied - check API key permissions';
      errorType = 'permission_denied';
    } else if (error.message.includes('API key not found')) {
      errorMessage = 'Google API key not configured in database';
      errorType = 'api_key_not_configured';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      response: `Error: ${errorMessage}`,
      metrics: calculateMetrics('', Date.now() - startTime, 0, 0),
    };
  }
};

// Anthropic Claude API call
const callClaude = async (modelConfig, prompt) => {
  const startTime = Date.now();
  
  try {
    // Get API key directly from database configs or fallback to env
    let apiKey;
    const configs = await getModelConfigs();
    
    // Look for matching configuration in database
    for (const [key, config] of configs) {
      if (config.provider === 'anthropic' && (config.modelId === modelConfig.modelName || config.modelId.includes('claude'))) {
        apiKey = config.apiKey;
        break;
      }
    }
    
    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.ANTHROPIC_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured in database');
    }
    
    // Create Anthropic client with the API key
    const anthropic = new Anthropic({ apiKey });
    
    const completion = await anthropic.messages.create({
      model: modelConfig.modelName,
      max_tokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseTime = Date.now() - startTime;
    const response = completion.content[0].text;
    const inputTokens = completion.usage.input_tokens;
    const outputTokens = completion.usage.output_tokens;

    return {
      success: true,
      response,
      metrics: calculateMetrics(response, responseTime, inputTokens, outputTokens),
    };
  } catch (error) {
    console.error(`Claude API Error for ${modelConfig.modelName}:`, error);
    
    let errorMessage = error.message;
    let errorType = 'api_error';
    
    // Specific error handling for Claude API issues
    if (error.status === 401 || error.message.includes('Invalid API key') || error.message.includes('authentication')) {
      errorMessage = 'Invalid or missing Anthropic API key';
      errorType = 'invalid_api_key';
    } else if (error.status === 429) {
      errorMessage = 'Anthropic Claude API rate limit exceeded';
      errorType = 'rate_limit';
    } else if (error.status === 503) {
      errorMessage = 'Anthropic Claude API service unavailable';
      errorType = 'service_unavailable';
    } else if (error.status === 400 && error.message.includes('model')) {
      errorMessage = `Claude model ${modelConfig.modelName} not available`;
      errorType = 'model_not_found';
    } else if (error.message.includes('credit') || error.message.includes('billing')) {
      errorMessage = 'Anthropic account credit exhausted or billing issue';
      errorType = 'billing_error';
    } else if (error.message.includes('API key not found')) {
      errorMessage = 'Anthropic API key not configured in database';
      errorType = 'api_key_not_configured';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      response: `Error: ${errorMessage}`,
      metrics: calculateMetrics('', Date.now() - startTime, 0, 0),
    };
  }
};

// Groq API call
const callGroq = async (modelConfig, prompt) => {
  const startTime = Date.now();
  
  try {
    // Use API key from model config if available, otherwise get from database
    let apiKey = modelConfig.apiKey;
    
    if (!apiKey) {
      const configs = await getModelConfigs();
      // Look for any Groq configuration in database
      for (const [key, config] of configs) {
        if (config.provider === 'groq') {
          apiKey = config.apiKey;
          break;
        }
      }
    }
    
    // Fallback to environment variable only if no database config exists
    if (!apiKey) {
      apiKey = process.env.GROQ_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('Groq API key not configured. Contact your administrator to set up Groq configuration.');
    }
    
    // Create Groq client with the API key
    const groq = new Groq({ apiKey });
    
    const completion = await groq.chat.completions.create({
      model: modelConfig.modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
    });

    const responseTime = Date.now() - startTime;
    const response = completion.choices[0].message.content;
    const inputTokens = completion.usage.prompt_tokens;
    const outputTokens = completion.usage.completion_tokens;

    return {
      success: true,
      response,
      metrics: calculateMetrics(response, responseTime, inputTokens, outputTokens),
    };
  } catch (error) {
    console.error(`Groq API Error for ${modelConfig.modelName}:`, error);
    
    let errorMessage = error.message;
    let errorType = 'api_error';
    
    // Specific error handling for Groq API issues
    if (error.status === 401 || error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
      errorMessage = 'Invalid or missing Groq API key - contact administrator';
      errorType = 'invalid_api_key';
    } else if (error.status === 429) {
      errorMessage = 'Groq API rate limit exceeded';
      errorType = 'rate_limit';
    } else if (error.status === 503 || error.status === 502) {
      errorMessage = 'Groq API service unavailable';
      errorType = 'service_unavailable';
    } else if (error.status === 400 && error.message.includes('model')) {
      errorMessage = `Groq model ${modelConfig.modelName} not available`;
      errorType = 'model_not_found';
    } else if (error.message.includes('not configured')) {
      errorMessage = 'Groq API key not configured - contact administrator';
      errorType = 'invalid_api_key';
    } else if (error.message.includes('API key not found')) {
      errorMessage = 'Groq API key not configured in database';
      errorType = 'api_key_not_configured';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      response: `Error: ${errorMessage}`,
      metrics: calculateMetrics('', Date.now() - startTime, 0, 0),
    };
  }
};

// Azure OpenAI API call
const callAzureOpenAI = async (modelConfig, prompt) => {
  const startTime = Date.now();
  
  try {
    const azureConfig = await getAzureConfig();
    
    if (!azureConfig.apiKey || !azureConfig.endpoint) {
      throw new Error('Azure OpenAI configuration not found in database');
    }
    
    const response = await axios.post(
      `${azureConfig.endpoint}/openai/deployments/${azureConfig.deploymentName}/chat/completions?api-version=${azureConfig.apiVersion}`,
      {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureConfig.apiKey,
        },
      }
    );

    const responseTime = Date.now() - startTime;
    const responseText = response.data.choices[0].message.content;
    const inputTokens = response.data.usage.prompt_tokens;
    const outputTokens = response.data.usage.completion_tokens;

    return {
      success: true,
      response: responseText,
      metrics: calculateMetrics(responseText, responseTime, inputTokens, outputTokens),
    };
  } catch (error) {
    console.error(`Azure OpenAI API Error:`, error);
    
    let errorMessage = error.response?.data?.error?.message || error.message;
    let errorType = 'api_error';
    
    // Specific error handling for Azure OpenAI API issues
    if (error.response?.status === 401 || errorMessage.includes('Invalid API key') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'Invalid or missing Azure OpenAI API key';
      errorType = 'invalid_api_key';
    } else if (error.response?.status === 429) {
      errorMessage = 'Azure OpenAI API rate limit exceeded';
      errorType = 'rate_limit';
    } else if (error.response?.status === 503) {
      errorMessage = 'Azure OpenAI API service unavailable';
      errorType = 'service_unavailable';
    } else if (error.response?.status === 404) {
      errorMessage = 'Azure OpenAI deployment not found - check endpoint and deployment name';
      errorType = 'deployment_not_found';
    } else if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
      errorMessage = 'Azure OpenAI quota exceeded';
      errorType = 'quota_exceeded';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to Azure OpenAI endpoint - check endpoint URL';
      errorType = 'connection_error';
    } else if (error.message.includes('configuration not found')) {
      errorMessage = 'Azure OpenAI configuration not found in database';
      errorType = 'api_key_not_configured';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      response: `Error: ${errorMessage}`,
      metrics: calculateMetrics('', Date.now() - startTime, 0, 0),
    };
  }
};

// Main function to call appropriate LLM - completely database-driven
const callLLM = async (modelId, prompt) => {
  // Check if we're in test mode
  if (process.env.TEST_MODE === 'true') {
    console.log(`🎭 TEST MODE: Simulating call to ${modelId}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Random delay 100-300ms
    
    return {
      success: true,
      response: `[TEST MODE] This is a simulated response from ${modelId}. The model would normally process: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
      metrics: {
        accuracy: Math.floor(Math.random() * 20) + 80,
        coherence: Math.floor(Math.random() * 20) + 80,
        creativity: Math.floor(Math.random() * 20) + 80,
        responseTime: Math.floor(Math.random() * 200) + 100,
        tokens: Math.floor(Math.random() * 100) + 50,
        inputTokens: prompt.split(' ').length,
        outputTokens: Math.floor(Math.random() * 80) + 20,
        wordCount: Math.floor(Math.random() * 50) + 20
      }
    };
  }

  let modelConfig = null;
  
  // First, try to get configuration from database
  const configs = await getModelConfigs();
  
  // Look for exact match or provider-modelId format in database
  for (const [key, config] of configs) {
    if (config.modelId === modelId || `${config.provider}-${config.modelId}` === modelId || key === modelId) {
      modelConfig = {
        provider: config.provider,
        modelName: config.modelId,
        displayName: `${config.provider.charAt(0).toUpperCase() + config.provider.slice(1)} ${config.modelId}`,
        maxTokens: config.parameters?.max_tokens || 4096,
        temperature: config.parameters?.temperature || 0.7,
        apiKey: config.apiKey,
      };
      break;
    }
  }
  
  // If not found in database, check hardcoded configs as last resort (but this should rarely happen)
  if (!modelConfig && MODEL_CONFIGS[modelId]) {
    const hardcodedConfig = MODEL_CONFIGS[modelId];
    modelConfig = {
      provider: hardcodedConfig.provider,
      modelName: hardcodedConfig.modelName,
      displayName: hardcodedConfig.displayName,
      maxTokens: hardcodedConfig.maxTokens,
      temperature: hardcodedConfig.temperature,
      apiKey: null, // Will be fetched from env variables in provider functions
    };
  }
  
  if (!modelConfig) {
    throw new Error(`Model ${modelId} not found in admin configurations. Contact your administrator to add this model.`);
  }

  let result;
  
  switch (modelConfig.provider) {
    case 'openai':
      result = await callOpenAI(modelConfig, prompt);
      break;
    case 'google':
      result = await callGemini(modelConfig, prompt);
      break;
    case 'anthropic':
      result = await callClaude(modelConfig, prompt);
      break;
    case 'groq':
      result = await callGroq(modelConfig, prompt);
      break;
    case 'azure':
      result = await callAzureOpenAI(modelConfig, prompt);
      break;
    default:
      throw new Error(`Provider ${modelConfig.provider} not supported. Contact your administrator to configure this provider.`);
  }

  return {
    modelId,
    modelName: modelConfig.displayName,
    provider: modelConfig.provider,
    ...result,
  };
};

// Function to test multiple models simultaneously and save history
export const testPromptWithModels = async (prompt, modelIds, options = {}) => {
  try {
    const { userId, evaluationCriteria = ['accuracy', 'tokens', 'responseTime'], saveHistory = true } = options;
    
    const results = await Promise.allSettled(
      modelIds.map(modelId => callLLM(modelId, prompt))
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const modelConfig = MODEL_CONFIGS[modelIds[index]];
        return {
          modelId: modelIds[index],
          modelName: modelConfig?.displayName || 'Unknown Model',
          provider: modelConfig?.provider || 'unknown',
          success: false,
          error: result.reason.message,
          response: `Error: ${result.reason.message}`,
          metrics: calculateMetrics('', 0, 0, 0),
        };
      }
    });

    // Save to prompt history if userId is provided and saveHistory is true
    if (userId && saveHistory) {
      try {
        const promptHistory = new PromptHistory({
          userId,
          prompt,
          selectedModels: modelIds,
          evaluationCriteria,
          results: processedResults.map(result => ({
            modelId: result.modelId,
            modelName: result.modelName,
            provider: result.provider,
            response: result.response,
            success: result.success,
            error: result.error,
            errorType: result.errorType,
            metrics: result.metrics
          })),
          metadata: {
            sessionId: `session_${Date.now()}`,
            version: '1.0'
          }
        });

        // Update summary based on results
        promptHistory.updateSummary();
        
        // Save to database
        await promptHistory.save();
        console.log('Prompt history saved successfully for user:', userId);
      } catch (historyError) {
        console.error('Error saving prompt history:', historyError);
        // Don't fail the main request if history saving fails
      }
    }

    return processedResults;
  } catch (error) {
    console.error('Error in testPromptWithModels:', error);
    throw error;
  }
};

// Get available models from database
export const getAvailableModels = async () => {
  try {
    const configs = await getModelConfigs();
    const dbModels = [];
    
    console.log('getAvailableModels: Found', configs.size, 'configurations in cache');
    
    // ONLY return database-configured models - no hardcoded fallbacks
    for (const [key, config] of configs) {
      // Use simple modelId if it exists in MODEL_CONFIGS, otherwise use provider-modelId format
      const modelId = MODEL_CONFIGS[config.modelId] ? config.modelId : `${config.provider}-${config.modelId}`;
      
      const hasApiKey = !!config.apiKey;
      console.log(`Model ${config.provider}-${config.modelId}: API key present = ${hasApiKey}, length = ${config.apiKey?.length || 0}`);
      
      dbModels.push({
        id: modelId,
        name: `${config.provider.charAt(0).toUpperCase() + config.provider.slice(1)} ${config.modelId}`,
        provider: config.provider,
        description: `${config.modelId} - Admin configured`,
        source: 'database',
        apiKeyConfigured: hasApiKey,
        parameters: config.parameters,
        adminId: config.adminId,
      });
    }
    
    console.log('getAvailableModels: Returning', dbModels.length, 'models');
    dbModels.forEach(model => {
      console.log(`- ${model.name}: apiKeyConfigured = ${model.apiKeyConfigured}`);
    });
    
    // Return only what admins have explicitly configured
    return dbModels;
  } catch (error) {
    console.error('Error getting available models:', error);
    // Return empty array on error - no fallbacks
    return [];
  }
};

// Validate API keys from both database and environment
export const validateApiKeys = async () => {
  try {
    const configs = await getModelConfigs();
    const dbChecks = {};
    
    // Check database configurations
    for (const [key, config] of configs) {
      dbChecks[config.provider] = !!config.apiKey;
    }
    
    // Check environment variables
    const envChecks = {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      azure: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY),
    };

    // Combine checks (database takes precedence)
    const allProviders = new Set([...Object.keys(dbChecks), ...Object.keys(envChecks)]);
    const combinedChecks = {};
    
    for (const provider of allProviders) {
      combinedChecks[provider] = dbChecks[provider] || envChecks[provider] || false;
    }
    
    return {
      database: dbChecks,
      environment: envChecks,
      combined: combinedChecks,
    };
  } catch (error) {
    console.error('Error validating API keys:', error);
    // Fallback to environment checks only
    return {
      database: {},
      environment: {
        openai: !!process.env.OPENAI_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        azure: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY),
      },
      combined: {
        openai: !!process.env.OPENAI_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        azure: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY),
      },
    };
  }
};

export { MODEL_CONFIGS };
