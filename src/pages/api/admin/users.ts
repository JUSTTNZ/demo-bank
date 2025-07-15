// /api/admin/users/index.ts - Fixed to bypass RLS for admin operations
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      if (authError) throw new Error(authError.message)

      // Use rpc or direct query to bypass RLS
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        
      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      const { data: accounts } = await supabaseAdmin.from('accounts').select('user_id, id')

      // Debug logging
      console.log('Total users from auth:', users?.length)
      console.log('Total profiles:', profiles?.length)
      console.log('Sample profile:', profiles?.[0])

      const combined = users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        const userAccounts = accounts?.filter(acc => acc.user_id === user.id)
        
        // Debug logging for each user
        console.log(`User ${user.email}:`, {
          profileFound: !!profile,
          profileFullName: profile?.full_name,
          profileData: profile
        })

        return {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || null,
          role: profile?.role || 'user',
          avatar_url: profile?.avatar_url || null,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          accounts: userAccounts || [],
        }
      })

      return res.status(200).json({ success: true, users: combined })
    } catch (error: any) {
      console.error('GET users error:', error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { email, password, fullName, role, createAccount, initialBalance } = req.body

      console.log('Creating user with data:', { email, fullName, role, createAccount, initialBalance })

      // Validate required fields
      if (!email || !password || !fullName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, password, and fullName are required' 
        })
      }

      // Create user in Supabase Auth
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (error || !user?.user) {
        console.error('Auth user creation error:', error)
        throw new Error(error?.message || 'Failed to create user')
      }

      console.log('Auth user created:', user.user.id)

      // First, check if profile already exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means "not found", which is expected for new users
        console.error('Error checking for existing profile:', checkError)
      }

      if (existingProfile) {
        console.log('Profile already exists:', existingProfile)
        console.log('Updating existing profile instead of creating new one')
        
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            role: role || 'user'
          })
          .eq('id', user.user.id)
          .select()

        if (updateError) {
          console.error('Profile update failed:', updateError)
          throw new Error(`Profile update failed: ${updateError.message}`)
        }
        
        console.log('Profile updated successfully:', updatedProfile)
      } else {
        // Create new profile
        console.log('Creating new profile for user:', user.user.id)
        
        // METHOD 1: Try RPC first (if you created the function)
        const { data: profileResult, error: profileError } = await supabaseAdmin
          .rpc('create_user_profile', {
            user_id: user.user.id,
            user_email: email,
            user_full_name: fullName,
            user_role: role || 'user'
          })

        if (profileError) {
          console.error('Profile creation via RPC failed:', profileError)
          
          // FALLBACK METHOD 2: Direct SQL query
          const { data: directInsert, error: directError } = await supabaseAdmin
            .from('profiles')
            .insert([{
              id: user.user.id,
              full_name: fullName,
              email: email,
              role: role || 'user'
            }])
            .select()

          if (directError) {
            console.error('Direct profile creation also failed:', directError)
            
            // Clean up the auth user
            try {
              await supabaseAdmin.auth.admin.deleteUser(user.user.id)
            } catch (cleanupError) {
              console.error('Failed to cleanup auth user:', cleanupError)
            }
            
            throw new Error(`Profile creation failed: ${directError.message}`)
          }
          
          console.log('Profile created via direct insert:', directInsert)
        } else {
          console.log('Profile created via RPC:', profileResult)
        }
      }

      // Create account if requested
      if (createAccount) {
        const accountData = {
          user_id: user.user.id,
          account_number: Math.floor(Math.random() * 999999999).toString().padStart(9, '0'),
          balance: initialBalance || 0,
          currency: 'USD',
          status: 'active'
        }

        console.log('Creating account with data:', accountData)

        const { data: account, error: accountError } = await supabaseAdmin
          .from('accounts')
          .insert([accountData])
          .select()

        if (accountError) {
          console.error('Account creation error:', accountError)
        } else {
          console.log('Account created successfully:', account)
        }
      }

      return res.status(200).json({ success: true, userId: user.user.id })
    } catch (error: any) {
      console.error('POST users error:', error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ success: false, error: 'Method not allowed' })
}