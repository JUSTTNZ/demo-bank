import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatList } from '@/components/users/chat/ChatList';
import { ChatWindow } from '@/components/users/chat/ChatWindow';

export default function ChatPage({ userId }: { userId: string | undefined }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Single useChat hook for the entire chat page
  const chatState = useChat(userId);

  // Show loading state while userId is being resolved
  if (!userId) {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    // Load messages for the selected chat
    chatState.loadMessages(chatId);
    // Set the current chat in the chat state
    const selectedChat = chatState.conversations.find(c => c.id === chatId);
    if (selectedChat) {
      chatState.setCurrentChat(selectedChat);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-72 border-r border-gray-200">
        <ChatList 
          userId={userId} 
          onChatSelect={handleChatSelect}
          selectedChatId={currentChatId}
          chatState={chatState}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {currentChatId ? (
          <ChatWindow 
            chatId={currentChatId} 
            userId={userId} 
            chatState={chatState}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium">No chat selected</h3>
              <p className="mt-1">Select a conversation from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}