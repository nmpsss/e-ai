/**
 * 头部组件
 */
import { Sun, Moon, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { THEMES } from '@/utils/constants';

export function Header() {
  const { theme, setTheme, isDark } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(isDark ? THEMES.LIGHT : THEMES.DARK);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        LLM Chat System
      </h1>

      <div className="flex items-center gap-2">
        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* 设置 */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          title="设置"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* 用户信息 */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              title="退出登录"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
