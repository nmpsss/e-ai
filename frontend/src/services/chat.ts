/**
 * 聊天相关API服务
 */
import api from './api';

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  created_at: string;
}

export interface ChatRequest {
  conversation_id?: number;
  message: string;
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  conversation_id: number;
  message: Message;
  assistant_message: Message;
}

export interface StreamEvent {
  type: 'init' | 'chunk' | 'done' | 'error';
  conversation_id?: number;
  message?: Message;
  assistant_message?: Message;
  content?: string;
  error?: string;
}

/**
 * 发送消息(非流式)
 */
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/chat', {
    ...data,
    stream: false,
  });
  return response.data;
}

/**
 * 发送消息(流式)
 */
export async function* sendMessageStream(
  data: ChatRequest
): AsyncGenerator<StreamEvent, void, unknown> {
  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify({
      ...data,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('无法读取响应流');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data as StreamEvent;
          } catch (e) {
            console.error('解析SSE数据失败:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 停止生成
 */
export async function stopGeneration(): Promise<void> {
  await api.post('/chat/stop');
}
