// pages/api/chat/messages.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Define types for your database tables
type Chat = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

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
  created_at: string;
  profiles?: Profile;
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
    return getMessages(req, res);
  } else if (req.method === 'POST') {
    return sendMessage(req, res);
  } else if (req.method === 'PUT') {
    return editMessage(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get messages for a chat
async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chat_id, user_id } = req.query as {
      chat_id: string;
      user_id: string;
    };

    if (!chat_id || !user_id) {
      return res.status(400).json({ 
        error: 'Chat ID and User ID are required' 
      });
    }

    // Verify user owns the chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chat_id)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: messages, error } = await supabase
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
      .eq('chat_id', chat_id)
      .order('sent_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Send new message
async function sendMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chat_id, text, user_id } = req.body as {
      chat_id: string;
      text: string;
      user_id: string;
    };

    if (!chat_id || !text || !user_id) {
      return res.status(400).json({ 
        error: 'Chat ID, text, and user ID are required' 
      });
    }

    // Verify user owns the chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chat_id)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id,
          sender_id: user_id,
          user_id: user_id,
          text,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (msgError) {
      return res.status(500).json({ error: msgError.message });
    }

    // Update chat's updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id);

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Edit user's message (users can only edit their own messages)
async function editMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { message_id, text, user_id } = req.body as {
      message_id: string;
      text: string;
      user_id: string;
    };

    if (!message_id || !text || !user_id) {
      return res.status(400).json({ 
        error: 'Message ID, text, and user ID are required' 
      });
    }

    // Verify user owns the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('sender_id, user_id, chat_id')
      .eq('id', message_id)
      .single();

    if (msgError || !message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_id !== user_id || message.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    // Update message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ 
        text,
        // Add edited timestamp if your schema supports it
        // edited_at: new Date().toISOString()
      })
      .eq('id', message_id)
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.status(200).json({ message: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}