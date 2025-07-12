import { NextResponse } from 'next/server'
import { getAllChats } from '@/lib/admin'

export async function GET() {
  try {
    const { success, chats, error } = await getAllChats()
    
    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      chats 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chats' },
      { status: 500 }
    )
  }
}