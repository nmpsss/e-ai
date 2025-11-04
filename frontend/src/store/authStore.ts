/**
 * 认证状态管理
 */
import { create } from 'zustand';
import { User } from '@/services/auth';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constants';
import { setLocalStorage, removeLocalStorage } from '@/utils/helpers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setTokens: (accessToken, refreshToken) => {
    setLocalStorage(TOKEN_KEY, accessToken);
    setLocalStorage(REFRESH_TOKEN_KEY, refreshToken);
  },

  logout: () => {
    removeLocalStorage(TOKEN_KEY);
    removeLocalStorage(REFRESH_TOKEN_KEY);
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}));
