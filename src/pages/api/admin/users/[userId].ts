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
      await supabaseAdmin.from('accounts').delete().eq('user_id', userId)
      await supabaseAdmin.from('profiles').delete().eq('id', userId)

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authError) throw new Error(authError.message)

      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ success: false, error: error.message })
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}