// pages/api/users/chat/conversations.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Define types for your database tables
type Message = {
  id: string;
  chat_id: string;
  text: string;
  sent_at: string;
  sender_id: string;
  seen_at: string | null;
  seen_by: string[] | null;
  created_at: string;
  user_id: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type Chat = {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  messages: Message[];
  profiles: Profile;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return getConversations(req, res);
  } else if (req.method === 'POST') {
    return createConversation(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get user's conversations
async function getConversations(
  req: NextApiRequest,
  res: NextApiResponse<{ conversations?: Chat[], error?: string }>
) {
  try {
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        messages (
          id,
          text,
          sent_at,
          sender_id,
          seen_at,
          seen_by,
          created_at,
          user_id
        ),
        profiles!chats_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Type assertion for the query result
    const chats = data as unknown as (Chat & {
      messages: Message[];
      profiles: Profile;
    })[];

    // Sort messages by sent_at for each conversation
    const conversationsWithSortedMessages = chats.map(chat => ({
      ...chat,
      messages: chat.messages.sort((a, b) => 
        new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      )
    }));

    res.status(200).json({ conversations: conversationsWithSortedMessages });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new conversation
async function createConversation(
  req: NextApiRequest,
  res: NextApiResponse<{ conversation?: Chat, error?: string }>
) {
  try {
    const { user_id, title, initial_message } = req.body;

    if (!user_id || !initial_message) {
      return res.status(400).json({ 
        error: 'User ID and initial message are required' 
      });
    }

    // Create chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([
        {
          user_id,
          title: title || 'Support Chat',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (chatError || !chat) {
      return res.status(500).json({ error: chatError?.message || 'Failed to create chat' });
    }

    // Create initial message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chat.id,
          sender_id: user_id,
          user_id: user_id,
          text: initial_message,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (msgError || !message) {
      return res.status(500).json({ error: msgError?.message || 'Failed to create message' });
    }

    // Get user profile for response
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user_id)
      .single();

    if (!profile) {
      return res.status(500).json({ error: 'User profile not found' });
    }

    res.status(201).json({ 
      conversation: {
        ...chat,
        messages: [message],
        profiles: profile
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}