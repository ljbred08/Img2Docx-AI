
import { AiProvider } from './types';

export type BadgeColor = 'green' | 'yellow' | 'blue' | 'purple' | 'red';

export type ModelBadge = {
  label: string;
  color: BadgeColor;
};

export type ModelOption = {
  label: string;
  value: string;
  badge?: ModelBadge;
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
          { label: 'Gemini 2.5 Flash Lite (Fastest)', value: 'gemini-2.5-flash-lite-latest' },
          { label: 'Gemini 3 Flash', value: 'gemini-3-flash-preview', badge: { label: 'Recommended', color: 'green' } },
          { label: 'Gemini 3 Pro (Best)', value: 'gemini-3-pro-preview' }
        ],
        default: 'gemini-3-flash-preview'
      }
    ],
    getModelId: (s) => s.model
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    provider: 'openrouter',
    description: 'Top-tier frontier intelligence',
    badge: { label: 'Recommended', color: 'green' },
    options: [
      {
        id: 'variant',
        choices: [
          { label: '3 Haiku (Oldest/much cheaper)', value: '3-haiku' },
          { label: '3.5 Haiku (Older/less expensive)', value: '3.5-haiku' },
          { label: '4.5 Haiku (Best performance)', value: 'haiku-4.5' , badge: { label: 'Recommended', color: 'green' } }
        ],
        default: 'haiku-4.5'
      }
    ],
    getModelId: (s) => `anthropic/claude-${s.variant}`
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-5',
    provider: 'openrouter',
    description: 'The classic SOTA AI',
    badge: { label: 'Recommended', color: 'green' },
    options: [
      {
        id: 'variant',
        choices: [
          { label: '4.1 Nano (Fastest, non-reasoning)', value: '4.1-nano' },
          { label: '4.1 Mini (Non-reasoning)', value: '4.1-mini' },
          { label: '4.1 (Non-reasoning, high accuracy)', value: '4.1', badge: { label: 'Recommended', color: 'green' } },
          { label: '5 Nano (Faster)', value: '5-nano' },
          { label: '5 Mini (Fast reasoning)', value: '5-mini' },
          { label: '5.1 Chat (Similar performance to 5.2, lower cost)', value: '5.1-Chat', badge: { label: 'Recommended', color: 'green' } },
          { label: '5.2 Chat (Highest Accuracy)', value: '5.2-Chat', badge: { label: 'Recommended', color: 'green' } }
        ],
        default: '5.2-Chat'
      }
    ],
    getModelId: (s) => `openai/gpt-${s.variant}`
  },
  {
    id: 'glm',
    name: 'Z.ai GLM',
    provider: 'openrouter',
    description: 'High-performance open reasoning models',
    options: [
      {
        id: 'version',
        choices: [
          { label: '4.6v (Accuracy)', value: 'z-ai/glm-4.6v', badge: { label: 'Recommended', color: 'green' } },
          { label: '4.1v 9B (Speed)', value: 'thudm/glm-4.1v-9b-thinking' }
        ],
        default: 'z-ai/glm-4.6v'
      }
    ],
    getModelId: (s) => s.version
  },
  {
    id: 'internvl',
    name: 'InternVL 3',
    provider: 'openrouter',
    description: 'Open Vision Model',
    options: [
      {
        id: 'model',
        choices: [
          { label: 'InternVL3-78B', value: 'opengvlab/internvl3-78b' }
        ],
        default: 'opengvlab/internvl3-78b'
      }
    ],
    getModelId: (s) => s.model
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
          { label: '32B (Instruct)', value: '32b', badge: { label: 'Recommended', color: 'green' } },
          { label: '235B (Max)', value: '235b', badge: { label: 'Recommended', color: 'green' } }
        ],
        default: '32b'
      },
      {
        id: 'variant',
        choices: [
          { label: 'Instruct', value: 'instruct' },
          { label: 'Thinking', value: 'thinking' , badge: { label: 'Recommended', color: 'green' } }
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
          { label: 'Maverick', value: 'maverick', badge: { label: 'Recommended', color: 'green' } }
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
