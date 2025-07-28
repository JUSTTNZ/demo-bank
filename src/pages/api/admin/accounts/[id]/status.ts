// pages/api/admin/accounts/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { UpdateAccountStatusResponse, AccountStatus } from '@/types/adminTypes'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateAccountStatusResponse>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  const { id } = req.query
  const { status } = req.body

  // Validate id
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Account ID is required'
    })
  }

  // Validate status
  const validStatuses: AccountStatus[] = ['active', 'disabled', 'suspended']
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Valid status is required (active, disabled, or suspended)'
    })
  }

  try {
    // Check if account exists first
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    // Update account status
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({ 
        status,
        updated_at: new Date().toISOString() // Add updated_at if you have this column
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating account status:', updateError)
      return res.status(500).json({
        success: false,
        error: 'Failed to update account status'
      })
    }

    // Log the status change for audit purposes (optional)
    console.log(`Account ${id} status changed from ${existingAccount.status} to ${status}`)

    return res.status(200).json({
      success: true,
      message: `Account status updated to ${status}`,
      account: updatedAccount
    })

  } catch (error) {
    console.error('Error in account status update:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Alternative API endpoint for bulk status updates
// pages/api/admin/accounts/bulk-status.ts
export async function bulkUpdateAccountStatus(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  const { accountIds, status } = req.body

  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Account IDs array is required'
    })
  }

  const validStatuses: AccountStatus[] = ['active', 'disabled', 'suspended']
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Valid status is required'
    })
  }

  try {
    const { data: updatedAccounts, error } = await supabase
      .from('accounts')
      .update({ status })
      .in('id', accountIds)
      .select('*')

    if (error) {
      console.error('Error bulk updating account statuses:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update account statuses'
      })
    }

    return res.status(200).json({
      success: true,
      message: `${updatedAccounts.length} accounts updated to ${status}`,
      accounts: updatedAccounts
    })

  } catch (error) {
    console.error('Error in bulk account status update:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}