import { useState } from 'react';
import { UseChatReturn } from '@/hooks/useChat';

interface ChatListProps {
  userId: string;
  onChatSelect?: (chatId: string) => void;
  selectedChatId?: string | null;
  chatState: UseChatReturn;
}

export function ChatList({ userId, onChatSelect, selectedChatId, chatState }: ChatListProps) {
  const { 
    conversations, 
    loading, 
    error, 
    createConversation,
    setError 
  } = chatState;
  
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    setIsCreating(true);
    try {
      const newConversation = await createConversation(
        'New Chat',
        'Hello, I need help with...'
      );
      if (newConversation && onChatSelect) {
        onChatSelect(newConversation.id);
      }
    } catch (err) {
      console.error('Error creating chat:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button
            onClick={handleCreateChat}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-md text-sm"
          >
            {isCreating ? 'Creating...' : 'New Chat'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Click "New Chat" to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onChatSelect?.(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChatId === conversation.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">
                    {conversation.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {conversation.messages && conversation.messages.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {conversation.messages[conversation.messages.length - 1]?.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}