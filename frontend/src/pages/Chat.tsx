/**
 * 聊天页面
 */
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { Layout } from '@/components/layout/Layout';
import { Sidebar } from '@/components/layout/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { Loading } from '@/components/common/Loading';

export function Chat() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
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
  } = useChat();

  // 加载会话列表
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  // 未登录重定向到登录页
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 加载中
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading size="lg" text="加载中..." />
      </div>
    );
  }

  const handleSelectConversation = async (id: number) => {
    await loadConversationMessages(id);
  };

  const handleNewConversation = async () => {
    clearCurrentConversation();
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  return (
    <Layout>
      <div className="h-full flex">
        {/* 侧边栏 */}
        <Sidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onUpdateConversation={updateConversation}
          onDeleteConversation={deleteConversation}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} isLoading={isLoading} />
          <ChatInput
            onSend={handleSendMessage}
            onStop={stopGeneration}
            disabled={isLoading}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </Layout>
  );
}
