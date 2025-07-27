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
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (getUserError || !user) throw new Error(getUserError?.message || 'User not found')

    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email!
    })
    if (error) throw new Error(error.message)

    return res.status(200).json({ success: true })
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: err.message || 'Internal server error',
    });
  }
}
