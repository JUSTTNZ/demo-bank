import { NextResponse } from 'next/server'
import { getChatMessages, createChatMessage } from '@/lib/admin'

// GET messages
export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { success, messages, error } = await getChatMessages(params.chatId)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      messages 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST new message
export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { content, message_type = 'text' } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const { success, message, error } = await createChatMessage(
      params.chatId, 
      content, 
      message_type
    )
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}