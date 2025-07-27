import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
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

    console.log('Marking messages as seen:', { messageIds, seenBy });

    // Update messages with seen information
    const { data, error } = await supabase
      .from('messages')
      .update({
        seen_at: new Date().toISOString(),
        seen_by: seenBy
      })
      .in('id', messageIds)
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
      updatedMessages: data
    });

  } catch (error) {
    console.error('Error in mark-seen API:', error);
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