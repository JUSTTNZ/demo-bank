// pages/api/admin/accounts.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllAccounts } from '@/lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const result = await getAllAccounts()
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error 
      })
    }

    return res.status(200).json({
      success: true,
      accounts: result.accounts
    })
  } catch (error) {
    console.error('Accounts API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}