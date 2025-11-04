/**
 * 认证相关API服务
 */
import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', data);
  return response.data;
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/login', data);
  return response.data;
}

/**
 * 刷新Token
 */
export async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}
