/**
 * Axios API配置
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constants';
import { removeLocalStorage, getLocalStorage } from '@/utils/helpers';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = getLocalStorage<string | null>(TOKEN_KEY, null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401错误且未重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新token
        const refreshToken = getLocalStorage<string | null>(REFRESH_TOKEN_KEY, null);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // 保存新token
          localStorage.setItem(TOKEN_KEY, access_token);
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

          // 重试原请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除token并跳转到登录页
        removeLocalStorage(TOKEN_KEY);
        removeLocalStorage(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * API响应类型
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

/**
 * API错误类型
 */
export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

/**
 * 处理API错误
 */
export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.response?.data?.detail || axiosError.message || '请求失败',
      detail: axiosError.response?.data?.detail,
      status: axiosError.response?.status,
    };
  }
  return {
    message: error.message || '未知错误',
  };
}
