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
    const { error } = await supabaseAdmin
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
  } catch (error: unknown) {
    console.error('Create account error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
  }
}

export async function updateAccount(accountId: string, updates: unknown) {
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
  } catch (error: unknown) {
    console.error('Update account error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
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
  } catch (error: unknown) {
    console.error('Get users error:', error)
    const err = error instanceof Error ? error : new Error(String(error));
  return { success: false, error: err.message };  }
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
  } catch (error: unknown) {
    console.error('Get accounts error:', error)
    const err = error instanceof Error ? error : new Error(String(error));
  return { success: false, error: err.message };  }
}

export async function getAllChats() {
  try {
    // Get all chats with message counts
    const { data: chatsWithCounts, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        profiles!chats_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('updated_at', { ascending: false })

    if (chatsError) {
      throw new Error(`Failed to fetch chats: ${chatsError.message}`)
    }

    // Get message counts for each chat
    const chatIds = chatsWithCounts?.map(chat => chat.id) || []
    const { data: messageCounts, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('chat_id')
      .in('chat_id', chatIds)

    if (messageError) {
      console.warn('Could not fetch message counts:', messageError)
    }

    // Calculate message counts per chat
    const messageCountMap = messageCounts?.reduce((acc, message) => {
      acc[message.chat_id] = (acc[message.chat_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Add message counts to chats
    const chatsWithMessageCounts = chatsWithCounts?.map(chat => ({
      ...chat,
      messageCount: messageCountMap[chat.id] || 0
    })) || []

    // Group by user_id and select the chat with the most messages per user
    const uniqueChatsMap = new Map()
    
    chatsWithMessageCounts.forEach(chat => {
      const existing = uniqueChatsMap.get(chat.user_id)
      if (!existing || chat.messageCount > existing.messageCount || 
          (chat.messageCount === existing.messageCount && new Date(chat.updated_at) > new Date(existing.updated_at))) {
        uniqueChatsMap.set(chat.user_id, chat)
      }
    })

    const uniqueChats = Array.from(uniqueChatsMap.values())

    // Format for frontend
    const formattedChats = uniqueChats.map(chat => ({
      id: chat.id,
      user_id: chat.user_id,
      admin_id: chat.admin_id,
      title: chat.title,
      status: chat.status,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      profiles: chat.profiles,
      messages: [{ count: chat.messageCount }]
    }))

    return {
      success: true,
      chats: formattedChats
    }
  } catch (error: unknown) {
    console.error('Get chats error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err.message || 'Failed to send message'
    };

  }
}

// Update your createChatMessage function in @/lib/admin

// Update your createChatMessage function to match the expected schema

export async function createChatMessage(
  chatId: string,
  messageContent: string,
  adminId: string,
  message_type: 'text' | 'file' | 'image' = 'text'
) {
  console.log('createChatMessage called with:', { chatId, messageContent, adminId, message_type })
  
  try {
    // Create message with the provided adminId
    const { data: messageData, error } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        message: messageContent, // This is the content field
        sender_id: adminId,
        user_id: adminId,
        created_at: new Date().toISOString() // Ensure created_at is set
      })
      .select(`
        id,
        chat_id,
        sender_id,
        message,
        created_at,
        profiles:sender_id (id, full_name, email)
      `)
      .single()

    console.log('Insert result:', { messageData, error })

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    // Transform the data to match your frontend interface
    const transformedMessage = {
      id: messageData.id,
      chat_id: messageData.chat_id,
      sender_id: messageData.sender_id,
      content: messageData.message, // Map 'message' field to 'content'
      message_type: 'text',
      created_at: messageData.created_at,
      profiles: messageData.profiles
    }

    // Update chat's updated_at timestamp
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    if (updateError) {
      console.error('Chat update error:', updateError)
    }

    console.log('Message created successfully:', transformedMessage)

    return {
      success: true,
      message: transformedMessage
    }
  } catch (error: unknown) {
    console.error('Create message error:', error)
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err.message || 'Failed to send message'
    };

  }
}

export async function getChatMessages(chatId: string) {
  try {
    console.log('Fetching messages for chat:', chatId) // Debug log

    // First, let's check if there are unknown messages at all for this chat
    const { count: totalMessages, error: countError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)

    console.log('Total messages found:', totalMessages) // Debug log

    if (countError) {
      console.error('Count error:', countError)
    }

    // Get messages with sender profiles
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    console.log('Messages query result:', { messages, error: messagesError }) // Debug log

    if (messagesError) {
      console.error('Messages fetch error:', messagesError)
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    // Transform the data to match your expected format
    const transformedMessages = messages?.map(message => ({
      ...message,
      content: message.message, // Map 'message' field to 'content' for frontend compatibility
      sender: message.profiles,
      profiles: message.profiles // Keep both for compatibility
    })) || []

    console.log('Transformed messages:', transformedMessages) // Debug log

    return {
      success: true,
      messages: transformedMessages
    }
  } catch (error: unknown) {
    console.error('Get messages error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
  }
}

// Alternative version that doesn't rely on foreign key relationships
export async function getChatMessagesAlternative(chatId: string) {
  try {
    console.log('Fetching messages for chat (alternative):', chatId)

    // Get all messages for this chat
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    console.log('Raw messages:', messages)

    if (!messages || messages.length === 0) {
      return {
        success: true,
        messages: []
      }
    }

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id))]
    
    // Get profiles for all senders
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', senderIds)

    if (profilesError) {
      console.warn('Could not fetch profiles:', profilesError)
    }

    // Manually join messages with profiles
    const messagesWithProfiles = messages.map(message => ({
      ...message,
      content: message.message, // Map database 'message' field to frontend 'content'
      sender: profiles?.find(p => p.id === message.sender_id) || null,
      profiles: profiles?.find(p => p.id === message.sender_id) || null
    }))

    console.log('Messages with profiles:', messagesWithProfiles)

    return {
      success: true,
      messages: messagesWithProfiles
    }
  } catch (error: unknown) {
    console.error('Get messages alternative error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
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
  } catch (error: unknown) {
    console.error('Delete chat error:', error)
    if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: String(error) };
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err.message || 'Failed to send message'
    };

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
  } catch (error: unknown) {
    console.error('Get dashboard stats error:', error)
    const err = error instanceof Error ? error : new Error(String(error));
  return { success: false, error: err.message };  }
}