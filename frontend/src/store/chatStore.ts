/**
 * 聊天状态管理
 */
import { create } from 'zustand';
import { Message } from '@/services/chat';
import { Conversation } from '@/services/conversation';

interface ChatState {
  // 当前会话
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;

  // 消息列表
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;

  // 会话列表
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: number, data: Partial<Conversation>) => void;
  removeConversation: (id: number) => void;

  // 加载状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 生成状态
  isGenerating: boolean;
  setGenerating: (generating: boolean) => void;

  // 清空当前会话
  clearCurrentConversation: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // 当前会话
  currentConversation: null,
  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),

  // 消息列表
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = content;
      }
      return { messages };
    }),

  // 会话列表
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (id, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    })),

  // 加载状态
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // 生成状态
  isGenerating: false,
  setGenerating: (generating) => set({ isGenerating: generating }),

  // 清空当前会话
  clearCurrentConversation: () =>
    set({
      currentConversation: null,
      messages: [],
    }),
}));
