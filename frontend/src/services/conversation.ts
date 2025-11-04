/**
 * 会话相关API服务
 */
import api from './api';
import { Message } from './chat';

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  model: string;
  created_at: string;
  updated_at?: string;
}

export interface ConversationListResponse {
  total: number;
  conversations: Conversation[];
}

export interface ConversationCreateRequest {
  title?: string;
  model?: string;
}

export interface ConversationUpdateRequest {
  title?: string;
  model?: string;
}

/**
 * 获取会话列表
 */
export async function getConversations(
  skip: number = 0,
  limit: number = 20
): Promise<ConversationListResponse> {
  const response = await api.get<ConversationListResponse>('/conversations', {
    params: { skip, limit },
  });
  return response.data;
}

/**
 * 创建新会话
 */
export async function createConversation(
  data: ConversationCreateRequest
): Promise<Conversation> {
  const response = await api.post<Conversation>('/conversations', data);
  return response.data;
}

/**
 * 获取会话详情
 */
export async function getConversation(id: number): Promise<Conversation> {
  const response = await api.get<Conversation>(`/conversations/${id}`);
  return response.data;
}

/**
 * 更新会话
 */
export async function updateConversation(
  id: number,
  data: ConversationUpdateRequest
): Promise<Conversation> {
  const response = await api.put<Conversation>(`/conversations/${id}`, data);
  return response.data;
}

/**
 * 删除会话
 */
export async function deleteConversation(id: number): Promise<void> {
  await api.delete(`/conversations/${id}`);
}

/**
 * 获取会话消息
 */
export async function getConversationMessages(id: number): Promise<Message[]> {
  const response = await api.get<Message[]>(`/conversations/${id}/messages`);
  return response.data;
}

/**
 * 搜索会话
 */
export async function searchConversations(
  query: string,
  skip: number = 0,
  limit: number = 20
): Promise<ConversationListResponse> {
  const response = await api.get<ConversationListResponse>('/conversations/search/', {
    params: { q: query, skip, limit },
  });
  return response.data;
}
