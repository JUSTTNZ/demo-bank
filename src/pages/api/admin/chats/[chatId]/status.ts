import { NextResponse } from 'next/server'
import { updateChatStatus } from '@/lib/admin'

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { status } = await request.json()
    
    if (!['active', 'closed', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { success, error } = await updateChatStatus(params.chatId, status)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    )
  }
}