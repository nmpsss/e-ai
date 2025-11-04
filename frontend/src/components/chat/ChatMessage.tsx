/**
 * 聊天消息组件
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/services/chat';
import { CodeBlock } from './CodeBlock';
import { cn, formatDate } from '@/utils/helpers';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 px-4 py-6',
        isUser ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-600 dark:bg-gray-700 text-white'
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* 消息内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {isUser ? '你' : 'AI助手'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(message.created_at)}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  return !inline && match ? (
                    <CodeBlock code={codeString} language={match[1]} />
                  ) : (
                    <code
                      className={cn(
                        'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm',
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
