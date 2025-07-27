import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageIds, seenBy } = body;

    // Validate required fields
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    if (!seenBy) {
      return NextResponse.json(
        { success: false, error: 'seenBy is required' },
        { status: 400 }
      );
    }

    // Get user from session (optional authentication check)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sb-access-token')?.value;
    
    if (authToken) {
      // Verify user session if token exists
      const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
      
      if (authError || !user) {
        console.warn('Authentication warning:', authError?.message);
        // Continue anyway - some implementations might not require strict auth for this endpoint
      } else if (user.id !== seenBy) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Cannot mark messages for another user' },
          { status: 403 }
        );
      }
    }

    console.log('User marking messages as seen:', { messageIds, seenBy });

    // First, verify these messages exist and belong to chats the user is part of
    const { data: messagesToUpdate, error: fetchError } = await supabase
      .from('messages')
      .select(`
        id, 
        chat_id, 
        sender_id,
        chats!inner (
          id,
          user_id,
          admin_id
        )
      `)
      .in('id', messageIds);

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Filter messages that the user is authorized to mark as seen
    const authorizedMessageIds = messagesToUpdate
      ?.filter(msg => {
        // User can mark messages as seen if:
        // 1. They are part of the chat (either as user or admin)
        // 2. The message is not sent by them (can't mark own messages as seen)
        const chat = Array.isArray(msg.chats) ? msg.chats[0] : msg.chats;
        const isPartOfChat = chat && (chat.user_id === seenBy || chat.admin_id === seenBy);
        const isNotSender = msg.sender_id !== seenBy;
        return isPartOfChat && isNotSender;
      })
      .map(msg => msg.id) || [];

    if (authorizedMessageIds.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No messages to mark as seen', updatedMessages: [] },
        { status: 200 }
      );
    }

    // Update messages with seen information
    const { data, error } = await supabase
      .from('messages')
      .update({
        seen_at: new Date().toISOString(),
        seen_by: seenBy
      })
      .in('id', authorizedMessageIds)
      .select();

    if (error) {
      console.error('Database error marking messages as seen:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to mark messages as seen' },
        { status: 500 }
      );
    }

    console.log('Successfully marked messages as seen:', data);

    return NextResponse.json({
      success: true,
      message: 'Messages marked as seen successfully',
      updatedMessages: data,
      markedCount: authorizedMessageIds.length
    });

  } catch (error) {
    console.error('Error in user mark-seen API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}