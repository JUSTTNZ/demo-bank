// /api/admin/users/index.ts - GET all users
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Get all users from auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      throw new Error(authError.message)
    }

    // Get profiles for all users
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    if (profileError) {
      throw new Error(profileError.message)
    }

    // Get accounts count for each user
    const { data: accounts, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('user_id, id')
    
    if (accountError) {
      throw new Error(accountError.message)
    }

    // Combine data
    const combinedUsers = users.map(user => {
      const profile = profiles.find(p => p.id === user.id)
      const userAccounts = accounts.filter(acc => acc.user_id === user.id)
      
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || null,
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url || null,
        phone: user.phone || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        accounts: userAccounts
      }
    })

    return res.status(200).json({ 
      success: true, 
      users: combinedUsers 
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}

// /api/admin/users/[userId].ts - DELETE user
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query

  if (typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid user ID' })
  }

  if (req.method === 'DELETE') {
    try {
      // Delete user's accounts first
      const { error: accountError } = await supabaseAdmin
        .from('accounts')
        .delete()
        .eq('user_id', userId)

      if (accountError) {
        console.error('Error deleting accounts:', accountError)
        // Continue with user deletion even if account deletion fails
      }

      // Delete user's profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.error('Error deleting profile:', profileError)
        // Continue with user deletion even if profile deletion fails
      }

      // Delete auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authError) {
        throw new Error(authError.message)
      }

      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      })
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

// /api/admin/users/[userId]/reset-password.ts - Reset password
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query

  if (typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid user ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Get user details first
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (getUserError || !user) {
      throw new Error(getUserError?.message || 'User not found')
    }

    // Send password reset email
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email!
    })

    if (error) {
      throw new Error(error.message)
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending reset email:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}