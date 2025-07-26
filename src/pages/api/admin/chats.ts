// pages/api/admin/chats.ts - Updated with fallback approach
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllChats, createChatMessage } from '@/lib/admin'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API called:', req.method, req.url)
  
  try {
    if (req.method === 'GET') {
      console.log('Getting all chats...')
      const result = await getAllChats()
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false, 
          error: result.error 
        })
      }

      return res.status(200).json({
        success: true,
        chats: result.chats
      })
    }

    if (req.method === 'POST') {
      console.log('POST request body:', req.body)
      
      let currentUserId = null;
      
      // Try to get user from session first
      try {
        const supabase = createPagesServerClient({ req, res })
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Session check:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          sessionError: sessionError?.message 
        })
        
        if (session?.user) {
          currentUserId = session.user.id
          console.log('User ID from session:', currentUserId)
        }
      } catch (sessionErr) {
        console.log('Session error:', sessionErr)
      }
      
      // Fallback: get userId from request body
      if (!currentUserId) {
        const { userId } = req.body
        if (userId) {
          currentUserId = userId
          console.log('User ID from request body (fallback):', currentUserId)
        }
      }
      
      if (!currentUserId) {
        console.log('No user ID available from session or request body')
        return res.status(401).json({ 
          success: false, 
          error: 'Not authenticated. User ID is required.' 
        })
      }
      
      // Handle message sending with dynamic user ID
      const { chatId, content, message_type = 'text' } = req.body

      if (!chatId || !content) {
        console.log('Missing required fields:', { chatId: !!chatId, content: !!content })
        return res.status(400).json({ 
          success: false, 
          error: 'Chat ID and message content are required' 
        })
      }

      console.log('Creating message with:', { 
        chatId, 
        content, 
        userId: currentUserId, 
        message_type 
      })

      const result = await createChatMessage(
        chatId,
        content,
        currentUserId, // Use the dynamic user ID
        message_type
      )

      console.log('Create message result:', result)

      if (!result.success) {
        console.error('Create message failed:', result.error)
        return res.status(400).json({ 
          success: false, 
          error: result.error 
        })
      }

      return res.status(200).json({ 
        success: true, 
        message: result.message 
      })
    }

    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} not allowed` 
    })

  } catch (error: any) {
    console.error('Chats API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}