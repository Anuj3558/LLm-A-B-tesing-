export const config = {
  adminSecretKey: 'YOUR_ADMIN_SECRET_KEY_HERE',

  providers: {
    openai: {
      name: 'OpenAI',
      models: {
        'gpt-4': { name: 'GPT-4', route: '/v1/chat/completions' },
        'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', route: '/v1/chat/completions' },
        'text-davinci-003': { name: 'Text Davinci 003', route: '/v1/completions' },
      },
    },
    anthropic: {
      name: 'Anthropic',
      models: {
        'claude-v1': { name: 'Claude v1', route: '/v1/complete' },
        'claude-instant-v1': { name: 'Claude Instant v1', route: '/v1/complete' },
      },
    },
    huggingface: {
      name: 'Hugging Face',
      models: {
        'gpt2': { name: 'GPT-2', route: '/models/gpt2/generate' },
        'bert-base': { name: 'BERT Base', route: '/models/bert-base' },
      },
    },
    cohere: {
      name: 'Cohere',
      models: {
        'command-xlarge': { name: 'Command XLarge', route: '/generate' },
        'command-large': { name: 'Command Large', route: '/generate' },
      },
    },
  },

  defaultProviderId: 'openai',
  defaultModelId: 'gpt-4',
};
