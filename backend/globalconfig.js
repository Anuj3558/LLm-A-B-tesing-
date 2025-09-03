export const config = {
  adminSecretKey: 'YOUR_ADMIN_SECRET_KEY_HERE',

  providers: {
    openai: {
      name: 'OpenAI',
      models: {
        'gpt-4': { 
          name: 'GPT-4', 
          route: '/v1/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        },
        'gpt-3.5-turbo': { 
          name: 'GPT-3.5 Turbo', 
          route: '/v1/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        },
        'text-davinci-003': { 
          name: 'Text Davinci 003', 
          route: '/v1/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        },
      },
    },
    anthropic: {
      name: 'Anthropic',
      models: {
        'claude-3-opus-20240229': { 
          name: 'Claude 3 Opus', 
          route: '/v1/messages',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
        'claude-3-sonnet-20240229': { 
          name: 'Claude 3 Sonnet', 
          route: '/v1/messages',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
        'claude-3-haiku-20240307': { 
          name: 'Claude 3 Haiku', 
          route: '/v1/messages',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
        'claude-v1': { 
          name: 'Claude v1', 
          route: '/v1/complete',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
        'claude-instant-v1': { 
          name: 'Claude Instant v1', 
          route: '/v1/complete',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
      },
    },
    huggingface: {
      name: 'Hugging Face',
      models: {
        'gpt2': { 
          name: 'GPT-2', 
          route: '/models/gpt2/generate',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1
          }
        },
        'bert-base': { 
          name: 'BERT Base', 
          route: '/models/bert-base',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 512,
            top_p: 1
          }
        },
      },
    },
    cohere: {
      name: 'Cohere',
      models: {
        'command-xlarge': { 
          name: 'Command XLarge', 
          route: '/generate',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
          }
        },
        'command-large': { 
          name: 'Command Large', 
          route: '/generate',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
          }
        },
      },
    },
    groq: {
      name: 'Groq',
      models: {
        'llama2-70b-4096': { 
          name: 'LLaMA 2 70B', 
          route: '/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1
          }
        },
        'mixtral-8x7b-32768': { 
          name: 'Mixtral 8x7B', 
          route: '/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 8192,
            top_p: 1
          }
        },
        'gemma-7b-it': { 
          name: 'Gemma 7B Instruct', 
          route: '/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
          }
        },
      },
    },
    google: {
      name: 'Google',
      models: {
        'gemini-pro': { 
          name: 'Gemini Pro', 
          route: '/v1beta/models/gemini-pro:generateContent',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
          }
        },
        'gemini-pro-vision': { 
          name: 'Gemini Pro Vision', 
          route: '/v1beta/models/gemini-pro-vision:generateContent',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
          }
        },
      },
    },
    azure: {
      name: 'Azure OpenAI',
      models: {
        'gpt-4': { 
          name: 'Azure GPT-4', 
          route: '/openai/deployments/{deployment}/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        },
        'gpt-35-turbo': { 
          name: 'Azure GPT-3.5 Turbo', 
          route: '/openai/deployments/{deployment}/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          }
        },
      },
    },
  },

  defaultProviderId: 'openai',
  defaultModelId: 'gpt-4',
};
