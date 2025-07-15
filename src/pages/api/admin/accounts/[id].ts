import { NextApiRequest, NextApiResponse } from 'next'
import { updateAccount } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'

// Create admin client for delete operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Delete account function (since it's not in your lib/admin file)
async function deleteAccount(accountId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete account error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Account ID is required' })
  }

  try {
    switch (req.method) {
      case 'PUT':
        // Update account
        const updateData = req.body
        
        if (!updateData || typeof updateData !== 'object') {
          return res.status(400).json({ error: 'Update data is required' })
        }

        const updateResult = await updateAccount(id, updateData)
        
        if (!updateResult.success) {
          return res.status(500).json({ error: updateResult.error })
        }

        return res.status(200).json({
          success: true,
          account: updateResult.account
        })

      case 'DELETE':
        // Delete account
        const deleteResult = await deleteAccount(id)
        
        if (!deleteResult.success) {
          return res.status(500).json({ error: deleteResult.error })
        }

        return res.status(200).json({
          success: true,
          message: 'Account deleted successfully'
        })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}