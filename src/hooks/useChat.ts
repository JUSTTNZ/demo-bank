import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  RealtimePostgresChangesPayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload 
} from '@supabase/supabase-js';

// Define types for your data structures
type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
};

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  user_id: string;
  text: string;
  sent_at: string;
  seen_at: string | null;
  seen_by: string | null;
  created_at: string;
  profiles?: Profile;
};

type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
};

export type UseChatReturn = {
  conversations: Conversation[];
  currentChat: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  setCurrentChat: (chat: Conversation | null) => void;
  setError: (error: string | null) => void;
  fetchConversations: () => Promise<void>;
  createConversation: (title: string, initialMessage: string) => Promise<Conversation | null>;
  sendMessage: (chatId: string, text: string) => Promise<Message | null>;
  editMessage: (messageId: string, text: string) => Promise<Message | null>;
  loadMessages: (chatId: string) => Promise<void>;
  markMessagesAsSeen: (chatId: string) => Promise<void>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useChat(userId: string | undefined): UseChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's conversations
  const fetchConversations = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/chat/conversations?user_id=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  // Create new conversation
  const createConversation = async (title: string, initialMessage: string): Promise<Conversation | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title,
          initial_message: initialMessage
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConversations(prev => [data.conversation, ...prev]);
        setCurrentChat(data.conversation);
        if (data.conversation.messages) {
          setMessages(data.conversation.messages);
        }
        return data.conversation;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err) {
      setError('Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (chatId: string, text: string): Promise<Message | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      setError(null);
      const response = await fetch('/api/users/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          user_id: userId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, data.message]);
        return data.message;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err) {
      setError('Failed to send message');
      return null;
    }
  };

  // Edit message
  const editMessage = async (messageId: string, text: string): Promise<Message | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      setError(null);
      const response = await fetch('/api/users/chat/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          text,
          user_id: userId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? data.message : msg
        ));
        return data.message;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err) {
      setError('Failed to edit message');
      return null;
    }
  };

  // Load messages for a chat
  const loadMessages = async (chatId: string) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/users/chat/messages?chat_id=${chatId}&user_id=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
        // Mark messages as seen
        await markMessagesAsSeen(chatId);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as seen
  const markMessagesAsSeen = async (chatId: string) => {
    if (!userId) return;

    try {
      await fetch('/api/users/chat/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
    } catch (err) {
      console.error('Failed to mark messages as seen:', err);
    }
  };

  // Update the realtime subscription in the useEffect
  useEffect(() => {
    if (!currentChat || !userId) return;

    const channel = supabase
      .channel(`chat_${currentChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${currentChat.id}`
        },
        async (payload: RealtimePostgresInsertPayload<Message>) => {
          if (!payload.new?.id) return;
          
          const { data: messageWithProfile, error } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_sender_id_fkey (
                id,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error || !messageWithProfile) {
            console.error('Error fetching message:', error);
            return;
          }

          if (messageWithProfile.sender_id !== userId) {
            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${currentChat.id}`
        },
        async (payload: RealtimePostgresUpdatePayload<Message>) => {
          if (!payload.new?.id) return;

          const { data: messageWithProfile, error } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_sender_id_fkey (
                id,
                full_name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error || !messageWithProfile) {
            console.error('Error fetching updated message:', error);
            return;
          }

          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? messageWithProfile : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChat, userId]);

  // Auto-fetch conversations when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  return {
    conversations,
    currentChat,
    messages,
    loading,
    error,
    setCurrentChat,
    setError,
    fetchConversations,
    createConversation,
    sendMessage,
    editMessage,
    loadMessages,
    markMessagesAsSeen
  };
}