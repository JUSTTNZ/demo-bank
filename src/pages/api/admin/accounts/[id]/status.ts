import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  const { id } = req.query
  const { status } = req.body

  // Validate inputs
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Account ID is required'
    })
  }

  const validStatuses = ['active', 'disabled', 'suspended']
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Valid status is required (active, disabled, or suspended)'
    })
  }

  try {
    // Update account status
    const { data: updatedAccount, error } = await supabase
      .from('accounts')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating account:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update account status'
      })
    }

    return res.status(200).json({
      success: true,
      message: `Account status updated to ${status}`,
      account: updatedAccount
    })

  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}