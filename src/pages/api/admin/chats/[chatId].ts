import { NextResponse } from 'next/server'
import { getChatDetails, deleteChat } from '@/lib/admin'

// GET single chat
export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { success, chat, error } = await getChatDetails(params.chatId)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      chat 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}

// DELETE chat
export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { success, error } = await deleteChat(params.chatId)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete chat' },
      { status: 500 }
    )
  }
}