// pages/api/admin/chats.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllChats } from '@/lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
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
  } catch (error) {
    console.error('Chats API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}