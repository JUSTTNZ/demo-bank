import supabaseAdmin from '@/utils/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { CreateUserPayload, CreateUserResponse, GetAllUsersResponse } from '@/types/adminTypes'

// export async function createUser(userData: CreateUserPayload): Promise<CreateUserResponse> {
//   const {
//     email,
//     password,
//     role = 'user',
//     fullName = '',
//     createAccount = true
//   } = userData

//   try {
//     const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: true,
//       user_metadata: {
//         full_name: fullName
//       }
//     })

//     if (authError || !authData?.user?.id) {
//       throw new Error(`Failed to create user: ${authError?.message || 'Unknown error'}`)
//     }

//     const { data: profileData, error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .update({ 
//         role: role, 
//         full_name: fullName 
//         })
//       .eq('id', authData.user.id)
//       .select()

//     if (profileError) {
//       await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
//       throw new Error(`Failed to create profile: ${profileError.message}`)
//     }

//     let accountData = null
//     if (createAccount) {
//       const accountNumber = 'ACC-' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0')

//       const { data: newAccount, error: accountError } = await supabaseAdmin
//         .from('accounts')
//         .insert({
//           user_id: authData.user.id,
//           account_number: accountNumber,
//           account_type: 'checking',
//           balance: 0.0,
//           currency: 'USD',
//           status: 'active'
//         })
//         .select()

//       if (accountError) {
//         console.warn('Failed to create account:', accountError.message)
//       } else {
//         accountData = newAccount?.[0]
//       }
//     }

//     return {
//       success: true,
//       user: authData.user,
//       profile: profileData?.[0],
//       account: accountData
//     }
//   } catch (error: any) {
//     console.error('Create user error:', error)
//     return {
//       success: false,
//       error: error?.message || 'An unknown error occurred'
//     }
//   }
// }

// export async function getAllUsers(): Promise<GetAllUsersResponse> {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('profiles')
//       .select(`
//         *,
//         accounts(id, account_number, account_type, balance, currency, status)
//       `)
//       .order('created_at', { ascending: false })

//     if (error) {
//       throw new Error(`Failed to fetch users: ${error.message}`)
//     }

//     return {
//       success: true,
//       users: data
//     }
//   } catch (error: any) {
//     console.error('Get users error:', error)
//     return {
//       success: false,
//       error: error?.message || 'An unknown error occurred'
//     }
//   }
// }


export async function updateUser(userId, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return {
      success: true,
      user: data[0]
    }
  } catch (error) {
    console.error('Update user error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function deleteUser(userId) {
  try {
    // Delete from auth.users (this will cascade to profiles, accounts, chats, messages)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Delete user error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// ============================================
// ACCOUNT MANAGEMENT
// ============================================



// Create admin client with service role
const supabaseAdmins = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Test function to verify service role access
async function testServiceRoleAccess() {
  try {
    const { data, error } = await supabaseAdmins
      .from('accounts')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Service role access test failed:', error)
    } else {
      console.log('Service role access test passed')
    }
  } catch (err) {
    console.error('Service role test error:', err)
  }
}

export async function createAccount(userId: string, accountData: { balance?: number}) {
  const { balance = 0.00 } = accountData
     
  try {
    // Test service role access first
    await testServiceRoleAccess()
    
    const accountNumber = Math.floor(Math.random() * 999999999).toString().padStart(9, '0')
    
    console.log('Attempting to create account with:', { userId, accountNumber, balance })
         
    const { data, error } = await supabaseAdmins
      .from('accounts')
      .insert({
        user_id: userId,
        account_number: accountNumber,
        balance,
      })
      .select()
     
    if (error) {
      console.error('Account creation error details:', error)
      throw new Error(`Failed to create account: ${error.message}`)
    }
     
    return {
      success: true,
      account: data[0]
    }
  } catch (error: any) {
    console.error('Create account error:', error)
    return {
      success: false,
      error: error.message
    }
   
  }
}

// ============================================
// CHAT AND MESSAGE MANAGEMENT
// ============================================

export async function getAllChats() {
  try {
    const { data, error } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        profiles(first_name, last_name, email),
        messages(count)
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`)
    }

    return {
      success: true,
      chats: data
    }
  } catch (error) {
    console.error('Get chats error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getChatMessages(chatId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        profiles(first_name, last_name, email)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return {
      success: true,
      messages: data
    }
  } catch (error) {
    console.error('Get messages error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function deleteChat(chatId) {
  try {
    // Delete chat (this will cascade to messages)
    const { error } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (error) {
      throw new Error(`Failed to delete chat: ${error.message}`)
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Delete chat error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function getDashboardStats() {
  try {
    const [usersResult, accountsResult, chatsResult, messagesResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('accounts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('chats').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('messages').select('id', { count: 'exact', head: true })
    ])

    const totalBalance = await supabaseAdmin
      .from('accounts')
      .select('balance')
      .eq('status', 'active')

    let totalValue = 0
    if (totalBalance.data) {
      totalValue = totalBalance.data.reduce((sum, account) => sum + parseFloat(account.balance), 0)
    }

    return {
      success: true,
      stats: {
        totalUsers: usersResult.count || 0,
        totalAccounts: accountsResult.count || 0,
        totalChats: chatsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalValue: totalValue
      }
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}