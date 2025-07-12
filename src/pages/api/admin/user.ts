// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllUsers } from '@/lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const result = await getAllUsers()
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      })
    }

    return res.status(200).json({
      success: true,
      users: result.users
    })
  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}