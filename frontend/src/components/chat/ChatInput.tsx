/**
 * 聊天输入组件
 */
import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '@/utils/helpers';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isGenerating = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Shift+Enter换行)"
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg px-4 py-3',
            'bg-gray-50 dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'border border-gray-300 dark:border-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'max-h-32 overflow-y-auto'
          )}
        />
        {isGenerating ? (
          <Button
            type="button"
            onClick={onStop}
            variant="danger"
            size="md"
            icon={<Square className="h-4 w-4" />}
          >
            停止
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            variant="primary"
            size="md"
            icon={<Send className="h-4 w-4" />}
          >
            发送
          </Button>
        )}
      </div>
    </form>
  );
}
