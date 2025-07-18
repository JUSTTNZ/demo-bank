import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, admin_id, content } = req.body;
    const { data, error } = await supabase
      .from('messages')
      .insert([{ user_id, admin_id, content }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'GET') {
    const { user_id, admin_id } = req.query;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user_id)
      .eq('admin_id', admin_id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}



// // userChatAPI.js
// import { createClient } from '@supabase/supabase-js'

// // ENV checks with fallback errors
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Supabase URL or Anon Key is not defined in environment variables.')
// }

// const supabase = createClient(supabaseUrl, supabaseKey)

// export class UserChatAPI {
//   constructor() {
//     /** @type {null | Record<string, any>} */
//     this.currentUser = null
//     /** @type {null | Record<string, any>} */
//     this.currentChat = null
//     /** @type {null | any} */
//     this.messageSubscription = null
//     /** @type {null | any} */
//     this.chatSubscription = null
//   }

//   /**
//    * @param {string} userId
//    */
//   async initialize(userId) {
//     try {
//       const { data: user, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if (error) throw error

//       this.currentUser = user
//       return { success: true, user }
//     } catch (error) {
//       console.error('Init error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   async getAssignedAdmin() {
//     try {
//       if (!this.currentUser) throw new Error('User not initialized')

//       const { data: chat, error: chatError } = await supabase
//         .from('chats')
//         .select(`*, admin:admin_id (id, full_name, first_name, last_name, email, avatar_url, last_sign_in_at, role)`)
//         .eq('user_id', this.currentUser.id)
//         .eq('status', 'active')
//         .single()

//       if (chat && !chatError) {
//         this.currentChat = chat
//         return { success: true, admin: chat.admin, chat }
//       }

//       const { data: admins, error: adminError } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('role', 'admin')
//         .limit(1)

//       if (adminError || !admins?.length) throw adminError || new Error('No admin found')

//       const admin = admins[0]

//       const { data: newChat, error: insertError } = await supabase
//         .from('chats')
//         .insert({
//           user_id: this.currentUser.id,
//           admin_id: admin.id,
//           title: `Support Chat - ${this.currentUser.full_name}`,
//           status: 'active'
//         })
//         .select()
//         .single()

//       if (insertError) throw insertError

//       this.currentChat = newChat
//       return { success: true, admin, chat: newChat }
//     } catch (error) {
//       console.error('Admin assignment error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   /**
//    * @param {string} text
//    */
//   async sendMessage(text) {
//     try {
//       if (!this.currentChat) throw new Error('No active chat')

//       const { data: message, error } = await supabase
//         .from('messages')
//         .insert({
//           chat_id: this.currentChat.id,
//           sender_id: this.currentUser.id,
//           user_id: this.currentUser.id,
//           text,
//           sent_at: new Date().toISOString()
//         })
//         .select()
//         .single()

//       if (error) throw error

//       await supabase
//         .from('chats')
//         .update({ updated_at: new Date().toISOString() })
//         .eq('id', this.currentChat.id)

//       return { success: true, message }
//     } catch (error) {
//       console.error('Send message error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   async getChatMessages() {
//     try {
//       if (!this.currentChat) throw new Error('No active chat')

//       const { data, error } = await supabase
//         .from('messages')
//         .select(`*, sender:sender_id (id, full_name, role)`)
//         .eq('chat_id', this.currentChat.id)
//         .order('sent_at', { ascending: true })

//       if (error) throw error

//       return { success: true, messages: data }
//     } catch (error) {
//       console.error('Fetch messages error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   async markMessagesAsSeen() {
//     try {
//       if (!this.currentChat) throw new Error('No active chat')

//       const { error } = await supabase
//         .from('messages')
//         .update({
//           seen_at: new Date().toISOString(),
//           seen_by: this.currentUser.id
//         })
//         .eq('chat_id', this.currentChat.id)
//         .neq('sender_id', this.currentUser.id)
//         .is('seen_at', null)

//       if (error) throw error
//       return { success: true }
//     } catch (error) {
//       console.error('Seen update error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   /**
//    * @param {(payload: any) => void} onMessageUpdate
//    */
//   subscribeToMessages(onMessageUpdate) {
//     if (!this.currentChat) return console.error('No chat for subscription')

//     this.messageSubscription = supabase
//       .channel('messages')
//       .on('postgres_changes', {
//         event: '*',
//         schema: 'public',
//         table: 'messages',
//         filter: `chat_id=eq.${this.currentChat.id}`
//       }, onMessageUpdate)
//       .subscribe()
//   }

//   /**
//    * @param {(payload: any) => void} onChatUpdate
//    */
//   subscribeToChat(onChatUpdate) {
//     if (!this.currentChat) return console.error('No chat for subscription')

//     this.chatSubscription = supabase
//       .channel('chats')
//       .on('postgres_changes', {
//         event: 'UPDATE',
//         schema: 'public',
//         table: 'chats',
//         filter: `id=eq.${this.currentChat.id}`
//       }, onChatUpdate)
//       .subscribe()
//   }

//   async checkAdminOnlineStatus() {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('last_sign_in_at')
//         .eq('id', this.currentChat?.admin_id)
//         .single()

//       if (error) throw error

//       const lastSeen = new Date(data.last_sign_in_at).getTime()
//       const isOnline = Date.now() - lastSeen < 5 * 60 * 1000 // 5 minutes

//       return { success: true, isOnline }
//     } catch (error) {
//       console.error('Check admin online status error:', error)
//       return { success: false, error: error.message }
//     }
//   }

//   cleanup() {
//     if (this.messageSubscription) {
//       supabase.removeChannel(this.messageSubscription)
//       this.messageSubscription = null
//     }
//     if (this.chatSubscription) {
//       supabase.removeChannel(this.chatSubscription)
//       this.chatSubscription = null
//     }
//   }
// }

// export default supabase
