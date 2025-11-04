/**
 * 侧边栏组件
 */
import { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, X, Menu } from 'lucide-react';
import { Conversation } from '@/services/conversation';
import { Button } from '../common/Button';
import { cn, formatDate } from '@/utils/helpers';
import { useSettingsStore } from '@/store/settingsStore';

interface SidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onUpdateConversation: (id: number, title: string) => void;
  onDeleteConversation: (id: number) => void;
}

export function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onUpdateConversation,
  onDeleteConversation,
}: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (id: number) => {
    if (editTitle.trim()) {
      onUpdateConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">对话列表</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 新建对话按钮 */}
      <div className="p-4">
        <Button
          onClick={onNewConversation}
          variant="primary"
          fullWidth
          icon={<Plus className="h-4 w-4" />}
        >
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              'group relative rounded-lg mb-2 cursor-pointer transition-colors',
              currentConversation?.id === conversation.id
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {editingId === conversation.id ? (
              <div className="p-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(conversation.id);
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  onBlur={() => handleSaveEdit(conversation.id)}
                  className="w-full px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none bg-white dark:bg-gray-800"
                  autoFocus
                />
              </div>
            ) : (
              <div
                onClick={() => onSelectConversation(conversation.id)}
                className="p-3"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(conversation.updated_at || conversation.created_at)}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(conversation);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Edit2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个对话吗?')) {
                        onDeleteConversation(conversation.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
