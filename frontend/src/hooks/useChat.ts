/**
 * 聊天相关Hook
 */
import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  sendMessageStream,
  stopGeneration as stopGenerationApi,
  Message,
} from '@/services/chat';
import {
  getConversations,
  getConversationMessages,
  createConversation,
  updateConversation as updateConversationApi,
  deleteConversation as deleteConversationApi,
} from '@/services/conversation';
import { handleApiError } from '@/services/api';

export function useChat() {
  const {
    currentConversation,
    messages,
    conversations,
    isLoading,
    isGenerating,
    setCurrentConversation,
    setMessages,
    addMessage,
    updateLastMessage,
    setConversations,
    addConversation,
    updateConversation: updateConversationInStore,
    removeConversation,
    setLoading,
    setGenerating,
    clearCurrentConversation,
  } = useChatStore();

  const { selectedModel } = useSettingsStore();

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('加载会话列表失败:', handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConversations]);

  // 加载会话消息
  const loadConversationMessages = useCallback(
    async (conversationId: number) => {
      try {
        setLoading(true);
        const [conversation, messages] = await Promise.all([
          getConversations().then((res) =>
            res.conversations.find((c) => c.id === conversationId)
          ),
          getConversationMessages(conversationId),
        ]);

        if (conversation) {
          setCurrentConversation(conversation);
        }
        setMessages(messages);
      } catch (error) {
        console.error('加载会话消息失败:', handleApiError(error));
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setCurrentConversation, setMessages]
  );

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setGenerating(true);

        // 创建用户消息
        const userMessage: Partial<Message> = {
          role: 'user',
          content,
          created_at: new Date().toISOString(),
        };

        // 添加到界面
        addMessage(userMessage as Message);

        // 创建助手消息占位符
        const assistantMessage: Partial<Message> = {
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMessage as Message);

        // 发送流式请求
        const stream = sendMessageStream({
          conversation_id: currentConversation?.id,
          message: content,
          model: selectedModel,
          stream: true,
        });

        let fullContent = '';

        for await (const event of stream) {
          if (event.type === 'init') {
            // 初始化事件
            if (event.conversation_id && !currentConversation) {
              // 新会话,重新加载会话列表
              await loadConversations();
            }
          } else if (event.type === 'chunk') {
            // 流式内容
            if (event.content) {
              fullContent += event.content;
              updateLastMessage(fullContent);
            }
          } else if (event.type === 'done') {
            // 完成
            if (event.conversation_id && !currentConversation) {
              // 加载新创建的会话
              await loadConversationMessages(event.conversation_id);
            }
          } else if (event.type === 'error') {
            // 错误
            console.error('生成错误:', event.error);
            throw new Error(event.error || '生成失败');
          }
        }
      } catch (error) {
        console.error('发送消息失败:', handleApiError(error));
        throw error;
      } finally {
        setGenerating(false);
      }
    },
    [
      currentConversation,
      selectedModel,
      setGenerating,
      addMessage,
      updateLastMessage,
      loadConversations,
      loadConversationMessages,
    ]
  );

  // 创建新会话
  const createNewConversation = useCallback(async () => {
    try {
      const conversation = await createConversation({
        title: '新对话',
        model: selectedModel,
      });
      addConversation(conversation);
      setCurrentConversation(conversation);
      setMessages([]);
      return conversation;
    } catch (error) {
      console.error('创建会话失败:', handleApiError(error));
      throw error;
    }
  }, [selectedModel, addConversation, setCurrentConversation, setMessages]);

  // 更新会话
  const updateConversation = useCallback(
    async (id: number, title: string) => {
      try {
        const updated = await updateConversationApi(id, { title });
        updateConversationInStore(id, updated);
        if (currentConversation?.id === id) {
          setCurrentConversation(updated);
        }
      } catch (error) {
        console.error('更新会话失败:', handleApiError(error));
        throw error;
      }
    },
    [currentConversation, updateConversationInStore, setCurrentConversation]
  );

  // 删除会话
  const deleteConversation = useCallback(
    async (id: number) => {
      try {
        await deleteConversationApi(id);
        removeConversation(id);
        if (currentConversation?.id === id) {
          clearCurrentConversation();
        }
      } catch (error) {
        console.error('删除会话失败:', handleApiError(error));
        throw error;
      }
    },
    [currentConversation, removeConversation, clearCurrentConversation]
  );

  // 停止生成
  const stopGeneration = useCallback(async () => {
    try {
      await stopGenerationApi();
      setGenerating(false);
    } catch (error) {
      console.error('停止生成失败:', handleApiError(error));
    }
  }, [setGenerating]);

  return {
    currentConversation,
    messages,
    conversations,
    isLoading,
    isGenerating,
    loadConversations,
    loadConversationMessages,
    sendMessage,
    createNewConversation,
    updateConversation,
    deleteConversation,
    stopGeneration,
    clearCurrentConversation,
  };
}
