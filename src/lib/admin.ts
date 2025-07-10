import { createClient } from '@supabase/supabase-js'

// Create admin client with service role
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

// Test function to verify service role access
async function testServiceRoleAccess() {
  try {
    const { data, error } = await supabaseAdmin
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

export async function createAccount(userId: string, accountData: { balance?: number }) {
  const { balance = 0.00 } = accountData
     
  try {
    // Test service role access first
    await testServiceRoleAccess()
    
    const accountNumber = Math.floor(Math.random() * 999999999).toString().padStart(9, '0')
    
    console.log('Attempting to create account with:', { userId, accountNumber, balance })
         
    const { data, error } = await supabaseAdmin
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

export async function updateAccount(accountId: string, updates: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`)
    }

    return {
      success: true,
      account: data[0]
    }
  } catch (error: any) {
    console.error('Update account error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        created_at,
        updated_at,
        last_sign_in_at,
        accounts(id, account_number, balance, created_at)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    // Transform data to match expected format
    const transformedUsers = data?.map(user => ({
      ...user,
      role: user.role || 'user', // Default role if not specified
      accounts: user.accounts || []
    })) || []

    return { success: true, users: transformedUsers }
  } catch (error: any) {
    console.error('Get users error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAllAccounts() {
  try {
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select(`
        *,
        profiles(id, email, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`)
    }

    return { success: true, accounts: data }
  } catch (error: any) {
    console.error('Get accounts error:', error)
    return { success: false, error: error.message }
  }
}

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
  } catch (error: any) {
    console.error('Get chats error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getChatMessages(chatId: string) {
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
  } catch (error: any) {
    console.error('Get messages error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function deleteChat(chatId: string) {
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
  } catch (error: any) {
    console.error('Delete chat error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getDashboardStats() {
  try {
    // Get total users with detailed info for growth calculation
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, created_at, last_sign_in_at')

    if (usersError) throw usersError

    // Get total accounts and their balances
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, balance, currency, created_at, status')

    if (accountsError) throw accountsError

    // Get support chats
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('id, created_at, status')

    if (chatsError) {
      console.warn('Chats table not found, using default value')
    }

    // Get messages count
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('id, created_at')

    if (messagesError) {
      console.warn('Messages table not found, using default value')
    }

    // Calculate basic stats
    const totalUsers = users?.length || 0
    const totalAccounts = accounts?.filter(acc => acc.status === 'active').length || 0
    const totalValue = accounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0
    const totalChats = chats?.filter(chat => chat.status === 'active').length || 0
    const totalMessages = messages?.length || 0

    // Calculate monthly revenue (assuming 1% of total value as monthly revenue)
    const monthlyRevenue = totalValue * 0.01

    // Calculate growth rate (users created this month vs last month)
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const usersThisMonth = users?.filter(user => 
      new Date(user.created_at) >= thisMonth
    ).length || 0

    const usersLastMonth = users?.filter(user => 
      new Date(user.created_at) >= lastMonth && new Date(user.created_at) < thisMonth
    ).length || 0

    const growthRate = usersLastMonth > 0 ? 
      ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 
      (usersThisMonth > 0 ? 100 : 0)

    // Calculate account growth
    const accountsThisMonth = accounts?.filter(account => 
      new Date(account.created_at) >= thisMonth
    ).length || 0

    const accountsLastMonth = accounts?.filter(account => 
      new Date(account.created_at) >= lastMonth && new Date(account.created_at) < thisMonth
    ).length || 0

    const accountGrowthRate = accountsLastMonth > 0 ? 
      ((accountsThisMonth - accountsLastMonth) / accountsLastMonth) * 100 : 
      (accountsThisMonth > 0 ? 100 : 0)

    // Calculate revenue growth (comparing this month vs last month)
    const lastMonthValue = accounts?.filter(account => 
      new Date(account.created_at) < thisMonth
    ).reduce((sum, account) => sum + (account.balance || 0), 0) || 0

    const revenueGrowthRate = lastMonthValue > 0 ? 
      ((totalValue - lastMonthValue) / lastMonthValue) * 100 : 
      (totalValue > 0 ? 100 : 0)

    return {
      success: true,
      stats: {
        totalUsers,
        totalAccounts,
        totalValue,
        totalChats,
        totalMessages,
        monthlyRevenue,
        growthRate,
        accountGrowthRate,
        revenueGrowthRate
      }
    }
  } catch (error: any) {
    console.error('Get dashboard stats error:', error)
    return { success: false, error: error.message }
  }
}