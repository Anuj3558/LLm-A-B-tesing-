// globalconfig.js

export const config = {
  adminSecretKey: 'YOUR_ADMIN_SECRET_KEY_HERE',

  // Providers supported by your app
  providers: [
    {
      id: 'openai',
      name: 'OpenAI',
      apiKeyEnvVar: 'OPENAI_API_KEY', 
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          route: '/v1/chat/completions',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          route: '/v1/chat/completions',
          defaultParams: {
            temperature: 0.6,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
        {
          id: 'text-davinci-003',
          name: 'Text Davinci 003',
          route: '/v1/completions',
          defaultParams: {
            temperature: 0.8,
            max_tokens: 1500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
      ],
    },

    {
      id: 'anthropic',
      name: 'Anthropic',
      apiKeyEnvVar: 'ANTHROPIC_API_KEY',
      models: [
        {
          id: 'claude-v1',
          name: 'Claude v1',
          route: '/v1/complete',
          defaultParams: {
            temperature: 0.5,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
        {
          id: 'claude-instant-v1',
          name: 'Claude Instant v1',
          route: '/v1/complete',
          defaultParams: {
            temperature: 0.3,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
      ],
    },

    {
      id: 'huggingface',
      name: 'Hugging Face',
      apiKeyEnvVar: 'HUGGINGFACE_API_KEY',
      models: [
        {
          id: 'gpt2',
          name: 'GPT-2',
          route: '/models/gpt2/generate',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
        {
          id: 'bert-base',
          name: 'BERT Base',
          route: '/models/bert-base',
          defaultParams: {
            temperature: 0,
            max_tokens: 256,
          },
        },
      ],
    },

    {
      id: 'cohere',
      name: 'Cohere',
      apiKeyEnvVar: 'COHERE_API_KEY',
      models: [
        {
          id: 'command-xlarge',
          name: 'Command XLarge',
          route: '/generate',
          defaultParams: {
            temperature: 0.75,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
        {
          id: 'command-large',
          name: 'Command Large',
          route: '/generate',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          },
        },
      ],
    },
  ],

  defaultProviderId: 'openai',
  defaultModelId: 'gpt-4',
};
