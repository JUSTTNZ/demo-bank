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
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    // Get accounts separately to avoid relationship issues
    const { data: accountsData, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, account_number, balance, created_at')

    if (accountsError) {
      console.warn('Could not fetch accounts:', accountsError)
    }

    // Transform data to match expected format
    const transformedUsers = data?.map(user => ({
      ...user,
      role: user.role || 'user', // Default role if not specified
      accounts: accountsData?.filter(account => account.user_id === user.id) || []
    })) || []

    return { success: true, users: transformedUsers }
  } catch (error: any) {
    console.error('Get users error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAllAccounts() {
  try {
    // First get all accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`)
    }

    // Then get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, avatar_url')

    if (profilesError) {
      console.warn('Could not fetch profiles:', profilesError)
    }

    // Manually join the data
    const accountsWithProfiles = accounts?.map(account => ({
      ...account,
      profiles: profiles?.find(profile => profile.id === account.user_id) || null
    })) || []

    return { success: true, accounts: accountsWithProfiles }
  } catch (error: any) {
    console.error('Get accounts error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAllChats() {
  try {
    // First get all chats
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })

    if (chatsError) {
      throw new Error(`Failed to fetch chats: ${chatsError.message}`)
    }

    // Then get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')

    if (profilesError) {
      console.warn('Could not fetch profiles:', profilesError)
    }

    // Get message counts for each chat
    const { data: messageCounts, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('chat_id')

    if (messageError) {
      console.warn('Could not fetch message counts:', messageError)
    }

    // Calculate message counts per chat
    const messageCountMap = messageCounts?.reduce((acc, message) => {
      acc[message.chat_id] = (acc[message.chat_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Manually join the data
    const chatsWithProfiles = chats?.map(chat => ({
      ...chat,
      profiles: profiles?.find(profile => profile.id === chat.user_id) || null,
      messages: [{ count: messageCountMap[chat.id] || 0 }]
    })) || []

    return {
      success: true,
      chats: chatsWithProfiles
    }
  } catch (error: any) {
    console.error('Get chats error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getChatDetails(chatId: string) {
  try {
    // Get chat details
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        profiles:user_id (id, full_name, email)
      `)
      .eq('id', chatId)
      .single()

    if (chatError) throw chatError

    // Get message count
    const { count: messageCount, error: countError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)

    if (countError) throw countError

    return {
      success: true,
      chat: {
        ...chat,
        messages: [{ count: messageCount || 0 }]
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch chat details'
    }
  }
}

export async function createChatMessage(
  chatId: string,
  content: string,
  message_type: 'text' | 'file' | 'image' = 'text'
) {
  try {
    // Get current admin user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Create message
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        content,
        message_type,
        sender_id: user.id
      })
      .select(`
        *,
        profiles:sender_id (id, full_name, email)
      `)
      .single()

    if (error) throw error

    // Update chat's updated_at timestamp
    await supabaseAdmin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return {
      success: true,
      message
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send message'
    }
  }
}

export async function getChatMessages(chatId: string) {
  try {
    // 1. Get all messages in the chat
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    // 2. Get all profiles (optional optimization: just get needed IDs)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')

    if (profilesError) {
      console.warn('Could not fetch profiles:', profilesError)
    }

    // 3. Attach sender's profile info to each message
    const messagesWithProfiles = messages?.map(message => ({
      ...message,
      sender: profiles?.find(p => p.id === message.sender_id) || null
    })) ?? []

    return {
      success: true,
      messages: messagesWithProfiles
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

export async function updateChatStatus(
  chatId: string,
  status: 'active' | 'closed' | 'pending'
) {
  try {
    // Get current admin user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data: chat, error } = await supabaseAdmin
      .from('chats')
      .update({ 
        status,
        admin_id: status === 'active' ? user.id : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select(`
        *,
        profiles:user_id (id, full_name email)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      chat
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update chat status'
    }
  }
}
export async function getDashboardStats() {
  try {
    // Get total users with basic info
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

    // Get messages count - use created_at instead of inserted_at
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('id, created_at') // Changed from inserted_at to created_at

    if (messagesError) {
      console.warn('Messages table not found, using default value')
    }

    // Rest of the function remains the same...
    const totalUsers = users?.length || 0
    const totalAccounts = accounts?.filter(acc => acc.status === 'active' || !acc.status).length || 0
    const totalValue = accounts?.reduce((sum, account) => sum + (Number(account.balance) || 0), 0) || 0
    const totalChats = chats?.filter(chat => chat.status === 'active' || !chat.status).length || 0
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
    ).reduce((sum, account) => sum + (Number(account.balance) || 0), 0) || 0

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