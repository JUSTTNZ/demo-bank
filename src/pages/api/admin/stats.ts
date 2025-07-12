// pages/api/admin/stats.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getDashboardStats } from '@/lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const result = await getDashboardStats()
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      })
    }

    return res.status(200).json({
      success: true,
      stats: result.stats
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}