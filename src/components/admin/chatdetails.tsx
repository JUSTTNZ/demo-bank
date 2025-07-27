'use client'
import supabase from '@/utils/supabaseClient'
import React, { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Info,
  Archive,
  CheckCheck,
  MessageCircle,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTimestampFormatter, getUserInitials } from '@/utils/timeStamp'

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image'
  created_at: string
  sent_at?: string
  seen_at?: string | null
  seen_by?: string | null
  profiles?: {
    id: string
    email: string
    full_name?: string
  }
}

interface ChatDetails {
  id: string
  title: string
  user_id: string
  admin_id?: string
  status: 'active' | 'closed' | 'pending'
  created_at: string
  updated_at: string
  profiles?: {
    id: string
    email: string
    full_name?: string
    timezone?: string
  }
}

interface Props {
  chatId: string
  onBack: () => void
  onClose?: () => void
  adminTimezone?: string
  className?: string
}

const ChatDetail: React.FC<Props> = ({ chatId, onBack, onClose, adminTimezone }) => {
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  const currentAdminTimezone = adminTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const { formatMessageTime, formatDetailedTime, getRelativeTime } = useTimestampFormatter(currentAdminTimezone)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Get current admin user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUser(user)
      } catch (err) {
        console.error('Error getting user:', err)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch chat data and setup realtime subscription
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true)
        
        // Fetch chat details
        const chatResponse = await fetch(`/api/admin/chats/${chatId}`)
        const chatData = await chatResponse.json()
        if (!chatData.success) throw new Error(chatData.error || 'Failed to fetch chat')
        setChatDetails(chatData.chat)
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/admin/chats/${chatId}/messages`)
        const messagesData = await messagesResponse.json()
        if (!messagesData.success) throw new Error(messagesData.error || 'Failed to fetch messages')
        
        // Transform and filter messages
        const validMessages = messagesData.messages
          .filter((msg: any) => msg.content?.trim() && msg.created_at)
          .map((msg: any) => ({
            id: msg.id,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            content: msg.content,
            message_type: msg.message_type || 'text',
            created_at: msg.created_at,
            sent_at: msg.sent_at,
            seen_at: msg.seen_at,
            seen_by: msg.seen_by,
            profiles: msg.profiles
          }))
        
        setMessages(validMessages)
        
        // Setup realtime subscription
        subscriptionRef.current = supabase
          .channel(`chat_messages_${chatId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'messages',
              filter: `chat_id=eq.${chatId}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newMsg = payload.new as Message
                if (newMsg.content?.trim() && newMsg.created_at) {
                  setMessages(prev => [...prev, newMsg])
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedMsg = payload.new as Message
                setMessages(prev => prev.map(msg => 
                  msg.id === updatedMsg.id ? updatedMsg : msg
                ))
              }
            }
          )
          .subscribe()

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchChatData()
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as seen
  useEffect(() => {
    if (!currentUser || !messages.length) return

    const markAsSeen = async () => {
      const unseenMessages = messages.filter(msg => 
        msg.sender_id !== currentUser.id && !msg.seen_at
      )
      if (!unseenMessages.length) return

      try {
        await fetch('/api/admin/chats/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageIds: unseenMessages.map(m => m.id),
            seenBy: currentUser.id
          })
        })
      } catch (err) {
        console.error('Error marking messages as seen:', err)
      }
    }

    markAsSeen()
  }, [messages, currentUser])

  // Send message with optimistic updates
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || !currentUser || sending) return

    // Create optimistic message
    const tempId = `temp_${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      chat_id: chatId,
      sender_id: currentUser.id,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      profiles: {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || currentUser.email
      }
    }

    // Add to UI immediately
    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')
    setSending(true)

    try {
      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          content,
          message_type: 'text',
          userId: currentUser.id
        })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to send message')

      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...data.message, profiles: optimisticMsg.profiles } : msg
      ))
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const getReadReceiptIcon = (message: Message) => {
    if (message.sender_id !== currentUser?.id) return null
    return message.seen_at ? (
      <CheckCheck className="w-3 h-3 text-blue-500" />
    ) : (
      <CheckCheck className="w-3 h-3 text-gray-400" />
    )
  }

  const handleChatAction = async (action: 'close' | 'archive') => {
    if (action === 'close') {
      try {
        const response = await fetch(`/api/admin/chats/${chatId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'closed' })
        })
        const data = await response.json()
        if (data.success) {
          setChatDetails(prev => prev ? { ...prev, status: 'closed' } : null)
          toast.success('Chat closed successfully')
        } else {
          throw new Error(data.error)
        }
      } catch (err) {
        toast.error('Failed to close chat')
      }
    }
    setShowOptions(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error loading chat</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!chatDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chat not found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                {getUserInitials(chatDetails.profiles?.full_name)}
              </div>
              
              <div>
                <h1 className="font-semibold">
                  {chatDetails.profiles?.full_name || 'User'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`${
                    chatDetails.status === 'active' ? 'text-green-600' :
                    chatDetails.status === 'closed' ? 'text-gray-600' : 'text-yellow-600'
                  }`}>
                    {chatDetails.status.charAt(0).toUpperCase() + chatDetails.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>{chatDetails.profiles?.email || 'No email'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Info className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleChatAction('close')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                      disabled={chatDetails.status === 'closed'}
                    >
                      <X className="w-4 h-4" />
                      <span>{chatDetails.status === 'closed' ? 'Chat Closed' : 'Close Chat'}</span>
                    </button>
                    <button
                      onClick={() => handleChatAction('archive')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Archive Chat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isAdmin = message.sender_id === currentUser?.id
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showTimestamp = !prevMessage || 
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000 ||
                prevMessage.sender_id !== message.sender_id

              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-gray-400 mb-2">
                      {formatDetailedTime(message.created_at, currentAdminTimezone)}
                    </div>
                  )}
                  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      isAdmin 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}>
                      <p>{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        isAdmin ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        <span>{formatMessageTime(message.created_at, currentAdminTimezone)}</span>
                        {getReadReceiptIcon(message)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            rows={1}
            disabled={sending || chatDetails.status === 'closed'}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || chatDetails.status === 'closed'}
            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        {chatDetails.status === 'closed' && (
          <div className="text-center text-sm text-gray-500 mt-2">
            This chat is closed
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDetail