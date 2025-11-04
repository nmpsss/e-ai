/**
 * 消息列表组件
 */
import { useEffect, useRef } from 'react';
import { Message } from '@/services/chat';
import { ChatMessage } from './ChatMessage';
import { Loading } from '../common/Loading';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">开始新的对话</p>
          <p className="text-sm">在下方输入框中输入消息开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="py-8">
            <Loading text="加载中..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
