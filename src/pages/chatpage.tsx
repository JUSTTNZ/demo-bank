import CustomerChat from '@/components/users/chat/ChatList';

const CustomerChatPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <CustomerChat />
    </div>
  );
};

export default CustomerChatPage;

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   KeyboardEvent,
//   ChangeEvent,
//   FC
// } from 'react'
// import {
//   MessageCircle,
//   Send,
//   ArrowLeft,
//   User,
//   Clock,
//   CheckCheck,
//   Wifi,
//   WifiOff
// } from 'lucide-react'
// import { SupabaseClient, createClient } from '@supabase/supabase-js'

// /* ------------------------------------------------------------------
//  * Supabase client (mock impl for demo)
//  * ------------------------------------------------------------------ */
// const createSupabaseClient = (): SupabaseClient | null => {
//   // 🔐 ENV values – replace with real keys in prod
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'your-supabase-url'
//   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'your-supabase-anon-key'
//   // For demo we return null to avoid runtime network calls
//   return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
// }

// /* ------------------------------------------------------------------
//  * Domain Types
//  * ------------------------------------------------------------------ */
// export interface UserProfile {
//   id: string
//   full_name: string
//   first_name?: string
//   last_name?: string
//   email?: string
//   avatar_url?: string | null
//   last_sign_in_at?: string
//   role: 'admin' | 'user'
//   created_at?: string
// }

// export interface Chat {
//   id: string
//   user_id: string
//   admin_id: string
//   title: string
//   status: string
//   created_at?: string
//   updated_at?: string
// }

// export interface Message {
//   id: number | string
//   chat_id: string
//   sender_id: string
//   user_id: string
//   text: string
//   sent_at: string
//   seen_at: string | null
//   seen_by: string | null
//   sender: Pick<UserProfile, 'id' | 'full_name' | 'role'>
// }

// export interface MessageEventPayload {
//   eventType: 'INSERT' | 'UPDATE'
//   new: Message
//   old?: Message
// }

// /* ------------------------------------------------------------------
//  * UserChatAPI – demo in‑memory implementation
//  * ------------------------------------------------------------------ */
// class UserChatAPI {
//   private currentUser: UserProfile | null = null
//   private currentChat: Chat | null = null
//   private messageSubscription: { interval: NodeJS.Timeout } | null = null
//   private chatSubscription: { active: boolean } | null = null
//   private adminStatusSubscription: null = null
//   private readonly supabase: SupabaseClient | null

//   constructor() {
//     this.supabase = createSupabaseClient()
//   }

//   async initialize(userId: string): Promise<{ success: true; user: UserProfile } | { success: false; error: string }> {
//     try {
//       // 🎭 Mock user object
//       const mockUser: UserProfile = {
//         id: userId,
//         full_name: 'John Doe',
//         email: 'john@example.com',
//         created_at: new Date().toISOString(),
//         role: 'user'
//       }
//       this.currentUser = mockUser
//       return { success: true, user: mockUser }
//     } catch (error) {
//       console.error('Error initializing user chat API:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   async getAssignedAdmin(): Promise<
//     | { success: true; admin: UserProfile; chat: Chat }
//     | { success: false; error: string }
//   > {
//     try {
//       if (!this.currentUser) throw new Error('User not initialized')

//       // 🎭 Mock admin + chat
//       const mockAdmin: UserProfile = {
//         id: 'admin-123',
//         full_name: 'Sarah Johnson',
//         first_name: 'Sarah',
//         last_name: 'Johnson',
//         role: 'admin',
//         avatar_url: null,
//         email: 'sarah.johnson@company.com',
//         last_sign_in_at: new Date(Date.now() - 300_000).toISOString()
//       }

//       const mockChat: Chat = {
//         id: 'chat-123',
//         user_id: this.currentUser.id,
//         admin_id: mockAdmin.id,
//         title: `Support Chat - ${this.currentUser.full_name}`,
//         status: 'active',
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       }

//       this.currentChat = mockChat
//       return { success: true, admin: mockAdmin, chat: mockChat }
//     } catch (error) {
//       console.error('Error getting assigned admin:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   async sendMessage(messageText: string): Promise<
//     | { success: true; message: Message }
//     | { success: false; error: string }
//   > {
//     try {
//       if (!this.currentChat || !this.currentUser) throw new Error('No active chat found')

//       const newMessage: Message = {
//         id: Date.now(),
//         chat_id: this.currentChat.id,
//         sender_id: this.currentUser.id,
//         user_id: this.currentUser.id,
//         text: messageText,
//         sent_at: new Date().toISOString(),
//         seen_at: null,
//         seen_by: null,
//         sender: {
//           id: this.currentUser.id,
//           full_name: this.currentUser.full_name,
//           role: 'user'
//         }
//       }

//       // Simulate latency
//       await new Promise((resolve) => setTimeout(resolve, 100))
//       return { success: true, message: newMessage }
//     } catch (error) {
//       console.error('Error sending message:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   async getChatMessages(): Promise<
//     | { success: true; messages: Message[] }
//     | { success: false; error: string }
//   > {
//     try {
//       if (!this.currentChat) throw new Error('No active chat found')

//       const mockMessages: Message[] = [
//         {
//           id: 1,
//           chat_id: this.currentChat.id,
//           sender_id: 'admin-123',
//           user_id: 'admin-123',
//           text: 'Hello! Welcome to our customer support. How can I help you today?',
//           sent_at: new Date(Date.now() - 300_000).toISOString(),
//           seen_at: new Date(Date.now() - 290_000).toISOString(),
//           seen_by: this.currentUser?.id ?? null,
//           sender: {
//             id: 'admin-123',
//             full_name: 'Sarah Johnson',
//             role: 'admin'
//           }
//         },
//         {
//           id: 2,
//           chat_id: this.currentChat.id,
//           sender_id: 'admin-123',
//           user_id: 'admin-123',
//           text: "I'm here to assist you with any questions or concerns you might have.",
//           sent_at: new Date(Date.now() - 280_000).toISOString(),
//           seen_at: new Date(Date.now() - 270_000).toISOString(),
//           seen_by: this.currentUser?.id ?? null,
//           sender: {
//             id: 'admin-123',
//             full_name: 'Sarah Johnson',
//             role: 'admin'
//           }
//         }
//       ]

//       return { success: true, messages: mockMessages }
//     } catch (error) {
//       console.error('Error fetching messages:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   async markMessagesAsSeen(): Promise<{ success: true } | { success: false; error: string }> {
//     try {
//       if (!this.currentChat) throw new Error('No active chat found')
//       await new Promise((resolve) => setTimeout(resolve, 100))
//       return { success: true }
//     } catch (error) {
//       console.error('Error marking messages as seen:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   subscribeToMessages(onMessageUpdate: (payload: MessageEventPayload) => void): void {
//     if (!this.currentChat) {
//       console.error('No active chat to subscribe to')
//       return
//     }

//     console.log('Subscribed to messages for chat:', this.currentChat.id)
//     const interval = setInterval(() => {
//       if (Math.random() > 0.98) {
//         const mockAdminMessage: Message = {
//           id: Date.now(),
//           chat_id: this.currentChat!.id,
//           sender_id: 'admin-123',
//           user_id: 'admin-123',
//           text: 'Is there anything else I can help you with?',
//           sent_at: new Date().toISOString(),
//           seen_at: null,
//           seen_by: null,
//           sender: {
//             id: 'admin-123',
//             full_name: 'Sarah Johnson',
//             role: 'admin'
//           }
//         }

//         onMessageUpdate({ eventType: 'INSERT', new: mockAdminMessage })
//       }
//     }, 1_000)

//     this.messageSubscription = { interval }
//   }

//   subscribeToChat(onChatUpdate: (payload: unknown) => void): void {
//     if (!this.currentChat) {
//       console.error('No active chat to subscribe to')
//       return
//     }

//     console.log('Subscribed to chat updates for chat:', this.currentChat.id)
//     this.chatSubscription = { active: true }
//   }

//   async checkAdminOnlineStatus(): Promise<{ success: true; isOnline: boolean } | { success: false; error: string }> {
//     try {
//       if (!this.currentChat) return { success: true, isOnline: false }
//       const isOnline = Math.random() > 0.3
//       return { success: true, isOnline }
//     } catch (error) {
//       console.error('Error checking admin online status:', error)
//       return { success: false, error: (error as Error).message }
//     }
//   }

//   cleanup(): void {
//     if (this.messageSubscription?.interval) {
//       clearInterval(this.messageSubscription.interval)
//       this.messageSubscription = null
//     }
//     if (this.chatSubscription) this.chatSubscription = null
//     if (this.adminStatusSubscription) this.adminStatusSubscription = null
//   }
// }

// /* ------------------------------------------------------------------
//  * Utility helpers
//  * ------------------------------------------------------------------ */
// const formatTime = (isoDate: string): string => {
//   return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// }

// const getInitials = (name?: string | null): string => {
//   if (!name) return '?'
//   return name
//     .split(' ')
//     .filter(Boolean)
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
// }

// const getMessageStatus = (msg: Message, currentUserId: string): 'seen' | 'sent' | null => {
//   if (msg.sender_id === currentUserId) {
//     return msg.seen_at ? 'seen' : 'sent'
//   }
//   return null
// }

// /* ------------------------------------------------------------------
//  * Main UI Component
//  * ------------------------------------------------------------------ */
// const CustomerChatUI: FC = () => {
//   const [currentView, setCurrentView] = useState<'admin-profile' | 'chat'>('admin-profile')
//   const [message, setMessage] = useState<string>('')
//   const [messages, setMessages] = useState<Message[]>([])
//   const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [error, setError] = useState<string | null>(null)
//   const [isAdminOnline, setIsAdminOnline] = useState<boolean>(false)
//   const [isConnected, setIsConnected] = useState<boolean>(true)
//   const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
//   const [currentChat, setCurrentChat] = useState<Chat | null>(null)
//   const [chatAPI] = useState<UserChatAPI>(() => new UserChatAPI())
//   const messagesEndRef = useRef<HTMLDivElement | null>(null)

//   const CURRENT_USER_ID = 'user-123' // 🔐 Replace with real auth user id

//   /* ---------------------------- lifecycle --------------------------- */
//   useEffect(() => {
//     initializeChat()
//     return () => chatAPI.cleanup()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   useEffect(() => {
//     if (!adminProfile) return

//     const interval = setInterval(checkAdminStatus, 30_000)
//     checkAdminStatus()
//     return () => clearInterval(interval)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [adminProfile])

//   /* ---------------------------- handlers --------------------------- */
//   const initializeChat = async (): Promise<void> => {
//     try {
//       setLoading(true)
//       setError(null)

//       // 1️⃣ Initialize user
//       const userResult = await chatAPI.initialize(CURRENT_USER_ID)
//       if (!userResult.success) throw new Error(userResult.error)
//       setCurrentUser(userResult.user)

//       // 2️⃣ Get assigned admin + chat
//       const adminResult = await chatAPI.getAssignedAdmin()
//       if (!adminResult.success) throw new Error(adminResult.error)
//       setAdminProfile(adminResult.admin)
//       setCurrentChat(adminResult.chat)

//       // 3️⃣ Load messages
//       const msgResult = await chatAPI.getChatMessages()
//       if (msgResult.success) setMessages(msgResult.messages)

//       // 4️⃣ Mark as seen
//       await chatAPI.markMessagesAsSeen()

//       // 5️⃣ Subscriptions
//       setupRealTimeSubscriptions()
//     } catch (err) {
//       setError((err as Error).message)
//       console.error('Error initializing chat:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const setupRealTimeSubscriptions = (): void => {
//     chatAPI.subscribeToMessages(handleMessageUpdate)
//     chatAPI.subscribeToChat(handleChatUpdate)

//     const connectionInterval = setInterval(() => {
//       setIsConnected((prev) => (Math.random() > 0.05 ? true : prev))
//     }, 15_000)

//     // Cleanup interval on unmount via chatAPI.cleanup → not needed here
//     // but retain reference if more control is required in future
//     void connectionInterval
//   }

//   const handleMessageUpdate = (payload: MessageEventPayload): void => {
//     if (payload.eventType === 'INSERT') {
//       setMessages((prev) => [...prev, payload.new])
//       if (
//         currentView === 'chat' &&
//         payload.new.sender_id !== CURRENT_USER_ID
//       ) {
//         setTimeout(() => void chatAPI.markMessagesAsSeen(), 1_000)
//       }
//     } else if (payload.eventType === 'UPDATE') {
//       setMessages((prev) =>
//         prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
//       )
//     }
//   }

//   const handleChatUpdate = (payload: unknown): void => {
//     console.log('Chat update received:', payload)
//   }

//   const checkAdminStatus = async (): Promise<void> => {
//     const result = await chatAPI.checkAdminOnlineStatus()
//     if (result.success) setIsAdminOnline(result.isOnline)
//   }

//   const handleSendMessage = async (): Promise<void> => {
//     if (!message.trim()) return
//     const text = message.trim()
//     setMessage('')
//     try {
//       const result = await chatAPI.sendMessage(text)
//       if (result.success) setMessages((prev) => [...prev, result.message])
//       else setError('Failed to send message')
//     } catch (err) {
//       setError((err as Error).message)
//     }
//   }

//   const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       void handleSendMessage()
//     }
//   }

//   /* ------------------------------ render --------------------------- */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
//           <p className="text-gray-600">Loading chat...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">Error: {error}</p>
//           <button
//             onClick={initializeChat}
//             className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     )
//   }

//   /* -------------------------- admin profile ----------------------- */
//   if (currentView === 'admin-profile') {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-6xl mx-auto bg-white min-h-screen lg:my-8 lg:rounded-2xl lg:shadow-2xl lg:overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 lg:p-8">
//             <div className="max-w-4xl mx-auto">
//               <h1 className="text-xl lg:text-3xl font-semibold">Customer Support</h1>
//               <p className="text-emerald-100 text-sm lg:text-base mt-1">Your dedicated support representative</p>
//             </div>
//           </div>

//           {/* Admin Profile Content */}
//           <div className="p-6 lg:p-12">
//             <div className="max-w-4xl mx-auto">
//               <div className="grid lg:grid-cols-2 gap-8 items-center">
//                 {/* Profile Card */}
//                 <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 lg:p-8">
//                   <div className="flex items-center space-x-4 lg:space-x-6">
//                     <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-semibold">
//                       {adminProfile?.avatar_url ? (
//                         <img
//                           src={adminProfile.avatar_url}
//                           alt={adminProfile.full_name}
//                           className="w-full h-full rounded-full object-cover"
//                         />
//                       ) : (
//                         getInitials(adminProfile?.full_name)
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">{adminProfile?.full_name}</h2>
//                       <p className="text-gray-600 text-sm lg:text-base">Customer Support Representative</p>
//                       <div className="flex items-center space-x-1 mt-2">
//                         <div className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
//                         <span className="text-xs lg:text-sm text-gray-500">
//                           {isAdminOnline ? 'Online' : 'Offline'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4">
//                     <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
//                       <User className="w-4 h-4 lg:w-5 lg:h-5" />
//                       <span className="text-sm lg:text-base">{adminProfile?.email}</span>
//                     </div>
//                     <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
//                       <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
//                       <span className="text-sm lg:text-base">
//                         Last active: {adminProfile?.last_sign_in_at ? formatTime(adminProfile.last_sign_in_at) : 'Unknown'}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
//                       {isConnected ? (
//                         <Wifi className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
//                       ) : (
//                         <WifiOff className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
//                       )}
//                       <span className="text-sm lg:text-base">
//                         {isConnected ? 'Connected' : 'Connection issues'}
//                       </span>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => setCurrentView('chat')}
//                     className="w-full mt-6 lg:mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 lg:py-4 px-4 lg:px-6 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg text-sm lg:text-base"
//                   >
//                     <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
//                     <span>Start Chat</span>
//                   </button>
//                 </div>

//                 {/* Info Section */}
//                 <div className="space-y-6">
//                   <div className="bg-emerald-50 rounded-lg p-4 lg:p-6">
//                     <h3 className="font-medium text-emerald-900 mb-2 lg:mb-3 text-base lg:text-lg">Need Help?</h3>
//                     <p className="text-emerald-700 text-sm lg:text-base leading-relaxed">
//                       Click "Start Chat" to begin a conversation with your support representative. They'll be notified immediately and will respond as soon as possible.
//                     </p>
//                   </div>

//                   <div className="bg-blue-50 rounded-lg p-4 lg:p-6">
//                     <h3 className="font-medium text-blue-900 mb-2 lg:mb-3 text-base lg:text-lg">Support Hours</h3>
//                     <div className="text-blue-700 text-sm lg:text-base space-y-1">
//                       <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
//                       <p>Saturday: 10:00 AM - 4:00 PM</p>
//                       <p>Sunday: Closed</p>
//                     </div>
//                   </div>

//                   <div className="bg-purple-50 rounded-lg p-4 lg:p-6">
//                     <h3 className="font-medium text-purple-900 mb-2 lg:mb-3 text-base lg:text-lg">Quick Tips</h3>
//                     <ul className="text-purple-700 text-sm lg:text-base space-y-1">
//                       <li>• Have your order number ready</li>
//                       <li>• Be specific about your issue</li>
//                       <li>• Screenshots help us help you faster</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   /* ------------------------------ chat view ----------------------- */
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto bg-white min-h-screen lg:my-8 lg:rounded-2xl lg:shadow-2xl lg:overflow-hidden flex flex-col">
//         {/* Chat Header */}
//         <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 lg:p-6 flex items-center space-x-3 lg:space-x-4">
//           <button
//             onClick={() => setCurrentView('admin-profile')}
//             className="hover:bg-white/20 p-1 lg:p-2 rounded transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
//           </button>
//           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-sm lg:text-base font-semibold">
//             {getInitials(adminProfile?.full_name)}
//           </div>
//           <div className="flex-1">
//             <h2 className="font-semibold text-base lg:text-lg">{adminProfile?.full_name}</h2>
//             <div className="flex items-center space-x-1">
//               <div className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
//               <span className="text-xs lg:text-sm text-emerald-100">
//                 {isAdminOnline ? 'Online' : 'Offline'}
//               </span>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             {isConnected ? (
//               <Wifi className="w-4 h-4 text-emerald-200" />
//             ) : (
//               <WifiOff className="w-4 h-4 text-red-300" />
//             )}
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 flex flex-col min-h-0">
//           <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
//             {messages.map((msg) => (
//               <div key={msg.id} className={`flex ${msg.sender_id === CURRENT_USER_ID ? 'justify-end' : 'justify-start'}`}>
//                 <div
//                   className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                     msg.sender_id === CURRENT_USER_ID ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800'
//                   }`}
//                 >
//                   <p className="text-sm lg:text-base">{msg.text}</p>
//                   <div
//                     className={`flex items-center justify-between mt-1 ${
//                       msg.sender_id === CURRENT_USER_ID ? 'text-emerald-100' : 'text-gray-500'
//                     }`}
//                   >
//                     <span className="text-xs">{formatTime(msg.sent_at)}</span>
//                     {msg.sender_id === CURRENT_USER_ID && (
//                       <div className="flex items-center space-x-1">
//                         <CheckCheck
//                           className={`w-4 h-4 ${getMessageStatus(msg, CURRENT_USER_ID) === 'seen' ? 'text-blue-300' : 'text-emerald-300'}`}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Message Input */}
//           <div className="p-4 lg:p-6 border-t border-gray-200">
//             <div className="flex space-x-2 lg:space-x-4">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm lg:text-base"
//                 disabled={!isConnected}
//               />
//               <button
//                 onClick={handleSendMessage}
//                 disabled={!message.trim() || !isConnected}
//                 className="bg-emerald-500 text-white px-4 py-2 lg:py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 <Send className="w-4 h-4 lg:w-5 lg:h-5" />
//               </button>
//             </div>
//             {!isConnected && (
//               <p className="text-red-500 text-xs lg:text-sm mt-2">
//                 Connection lost. Trying to reconnect...
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CustomerChatUI
