// pages/api/chat/mark-seen.ts
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Define types for your database tables
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
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chat_id, user_id } = req.body as {
      chat_id: string;
      user_id: string;
    };

    if (!chat_id || !user_id) {
      return res.status(400).json({ 
        error: 'Chat ID and user ID are required' 
      });
    }

    // Mark all messages in the chat as seen by the user
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        seen_at: new Date().toISOString(),
        seen_by: user_id
      })
      .eq('chat_id', chat_id)
      .neq('sender_id', user_id) // Don't mark own messages as seen
      .is('seen_at', null); // Only update unseen messages

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, updated: data });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}