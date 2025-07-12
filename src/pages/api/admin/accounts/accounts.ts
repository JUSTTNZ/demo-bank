import { NextApiRequest, NextApiResponse } from 'next'
import { getAllAccounts } from '@/lib/admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await getAllAccounts()
    
    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    return res.status(200).json({
      success: true,
      accounts: result.accounts
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
