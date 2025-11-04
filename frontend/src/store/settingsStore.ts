/**
 * 设置状态管理
 */
import { create } from 'zustand';
import { THEMES, STORAGE_KEYS } from '@/utils/constants';
import { getLocalStorage, setLocalStorage } from '@/utils/helpers';

type Theme = (typeof THEMES)[keyof typeof THEMES];

interface SettingsState {
  // 主题
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // 选中的模型
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // 侧边栏折叠状态
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // 初始化设置
  initSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // 主题
  theme: getLocalStorage<Theme>(STORAGE_KEYS.THEME, THEMES.LIGHT),
  setTheme: (theme) => {
    setLocalStorage(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
    set({ theme });
  },

  // 选中的模型
  selectedModel: getLocalStorage<string>(
    STORAGE_KEYS.SELECTED_MODEL,
    'gpt-3.5-turbo'
  ),
  setSelectedModel: (model) => {
    setLocalStorage(STORAGE_KEYS.SELECTED_MODEL, model);
    set({ selectedModel: model });
  },

  // 侧边栏折叠状态
  sidebarCollapsed: getLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    false
  ),
  setSidebarCollapsed: (collapsed) => {
    setLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebar: () => {
    const collapsed = !get().sidebarCollapsed;
    setLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    set({ sidebarCollapsed: collapsed });
  },

  // 初始化设置
  initSettings: () => {
    const theme = get().theme;
    applyTheme(theme);
  },
}));

/**
 * 应用主题
 */
function applyTheme(theme: Theme) {
  const root = window.document.documentElement;

  // 移除所有主题类
  root.classList.remove('light', 'dark');

  if (theme === THEMES.SYSTEM) {
    // 系统主题
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    root.classList.add(systemTheme);
  } else {
    // 手动设置的主题
    root.classList.add(theme);
  }
}
