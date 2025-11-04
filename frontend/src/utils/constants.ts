/**
 * 应用常量配置
 */

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Token存储键
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// 支持的模型列表
export const AVAILABLE_MODELS = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: '快速且经济的模型，适合大多数对话场景',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: '更强大的推理能力，适合复杂任务',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'GPT-4的优化版本，性价比更高',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Claude系列最强模型，适合复杂任务',
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: '平衡性能和成本的中端模型',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: '快速且经济的模型',
  },
];

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  THEME: 'theme',
  SELECTED_MODEL: 'selected_model',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// 消息角色
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
