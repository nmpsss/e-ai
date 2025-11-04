/**
 * 认证相关Hook
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getCurrentUser, login as loginApi, register as registerApi, LoginRequest, RegisterRequest } from '@/services/auth';
import { handleApiError } from '@/services/api';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setTokens, logout, setLoading } = useAuthStore();
  const navigate = useNavigate();

  // 初始化时检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]);

  // 登录
  const login = async (data: LoginRequest) => {
    try {
      const response = await loginApi(data);
      setTokens(response.access_token, response.refresh_token);

      // 获取用户信息
      const userData = await getCurrentUser();
      setUser(userData);

      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  // 注册
  const register = async (data: RegisterRequest) => {
    try {
      await registerApi(data);
      // 注册成功后自动登录
      return await login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  // 登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
}
