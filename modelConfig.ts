
import { AiProvider } from './types';

export type BadgeColor = 'green' | 'yellow' | 'blue' | 'purple' | 'red';

export type ModelBadge = {
  label: string;
  color: BadgeColor;
};

export type ModelOption = {
  label: string;
  value: string;
};

export type ModelFamily = {
  id: string;
  name: string;
  provider: AiProvider;
  description: string;
  badge?: ModelBadge;
  options: {
    id: string;
    label?: string;
    choices: ModelOption[];
    default: string;
  }[];
  getModelId: (selections: Record<string, string>) => string;
};

export const MODEL_FAMILIES: ModelFamily[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'gemini',
    description: 'Native Multimodal',
    badge: { label: 'Recommended', color: 'green' },
    options: [
      {
        id: 'model',
        choices: [
          { label: 'Gemini 2.5 Flash Lite (Fastest)', value: 'gemini-2.5-flash-lite' },
          { label: 'Gemini 3 Flash (Recommended)', value: 'gemini-3-flash-preview' },
          { label: 'Gemini 3 Pro (Best)', value: 'gemini-3-pro-preview' }
        ],
        default: 'gemini-3-flash-preview'
      }
    ],
    getModelId: (s) => s.model
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-5',
    provider: 'openrouter',
    description: 'The classic SOTA AI',
    options: [
      {
        id: 'variant',
        choices: [
          { label: 'Nano (Faster)', value: '5-nano' },
          { label: 'Mini (Recommended)', value: '5-mini' },
          { label: '5.1 Chat (High Accuracy)', value: '5.1-Chat' },
          { label: '5.2 Chat (Highest Accuracy, higher cost)', value: '5.2-Chat' }
        ],
        default: '5-mini'
      }
    ],
    getModelId: (s) => `openai/gpt-${s.variant}`
  },
  {
    id: 'glm',
    name: 'Z.ai GLM',
    provider: 'openrouter',
    description: 'High-performance reasoning models',
    options: [
      {
        id: 'version',
        choices: [
          { label: '4.6v (Accuracy)', value: 'z-ai/glm-4.6v' },
          { label: '4.1v 9B (Speed)', value: 'thudm/glm-4.1v-9b-thinking' }
        ],
        default: 'z-ai/glm-4.6v'
      }
    ],
    getModelId: (s) => s.version
  },
  {
    id: 'mistral_3',
    name: 'Mistral 3',
    provider: 'openrouter',
    description: 'European SOTA Models',
    options: [
      {
        id: 'model',
        choices: [
          { label: 'Mini 3b', value: 'mistralai/ministral-3b-2512' },
          { label: 'Mini 8b', value: 'mistralai/ministral-8b-2512' },
          { label: 'Mini 14b', value: 'mistralai/ministral-14b-2512' },
          { label: 'Small', value: 'mistralai/mistral-small-3.2-24b-instruct' },
          { label: 'Medium', value: 'mistralai/mistral-medium-3.1' },
          { label: 'Large', value: 'mistralai/mistral-large-2512' }
        ],
        default: 'mistralai/mistral-medium-3.1'
      }
    ],
    getModelId: (s) => s.model
  },
  {
    id: 'qwen',
    name: 'Qwen 3 VL',
    provider: 'openrouter',
    description: 'Open Weight SOTA',
    options: [
      {
        id: 'size',
        choices: [
          { label: '8B (Efficient)', value: '8b' },
          { label: '30B (Balanced)', value: '30b' },
          { label: '32B (Instruct)', value: '32b' },
          { label: '235B (Max)', value: '235b' }
        ],
        default: '32b'
      },
      {
        id: 'variant',
        choices: [
          { label: 'Instruct', value: 'instruct' },
          { label: 'Thinking', value: 'thinking' }
        ],
        default: 'thinking'
      }
    ],
    getModelId: (s) => {
       if (s.size === '32b') return 'qwen/qwen3-vl-32b-instruct';
       const base = 'qwen/qwen3-vl';
       let sizeStr = '';
       if (s.size === '8b') sizeStr = '-8b';
       if (s.size === '30b') sizeStr = '-30b-a3b';
       if (s.size === '235b') sizeStr = '-235b-a22b';
       return `${base}${sizeStr}-${s.variant}`;
    }
  },
  {
    id: 'grok',
    name: 'xAI Grok 4.1',
    provider: 'openrouter',
    description: 'High Speed Grok Reasoning',
    options: [],
    getModelId: () => 'x-ai/grok-4.1-fast'
  },
  {
    id: 'llama4',
    name: 'Meta Llama 4',
    provider: 'openrouter',
    description: 'Open source, fast, non-thinking models. Use for instant processing.',
    badge: { label: 'Instant', color: 'yellow' },
    options: [
      {
        id: 'variant',
        choices: [
          { label: 'Scout (speed)', value: 'scout' },
          { label: 'Maverick', value: 'maverick' }
        ],
        default: 'maverick'
      }
    ],
    getModelId: (s) => `meta-llama/llama-4-${s.variant}`
  },
  {
    id: 'nemotron',
    name: 'Nvidia Nemotron',
    provider: 'openrouter',
    description: 'Small, fast model',
    options: [],
    getModelId: () => 'nvidia/nemotron-nano-12b-v2-vl'
  }
];
