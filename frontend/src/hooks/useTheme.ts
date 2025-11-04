/**
 * 主题相关Hook
 */
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { THEMES } from '@/utils/constants';

export function useTheme() {
  const { theme, setTheme, initSettings } = useSettingsStore();

  // 初始化主题
  useEffect(() => {
    initSettings();
  }, [initSettings]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === THEMES.DARK ||
            (theme === THEMES.SYSTEM &&
             window.matchMedia('(prefers-color-scheme: dark)').matches),
  };
}
