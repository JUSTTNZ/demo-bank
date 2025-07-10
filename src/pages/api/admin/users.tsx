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
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw new Error(authError.message)

    const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('*')
    if (profileError) throw new Error(profileError.message)

    const { data: accounts, error: accountError } = await supabaseAdmin.from('accounts').select('user_id, id')
    if (accountError) throw new Error(accountError.message)

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

    return res.status(200).json({ success: true, users: combinedUsers })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}