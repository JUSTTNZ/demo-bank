'use client'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import React, { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video,
  Info,
  Archive,
  UserCheck,
  Clock,
  CheckCircle2,
  User,
  MessageCircle,
  X,
  AlertCircle
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
  profiles?: {
    id: string
    email: string
    full_name?: string
  }
}

interface ChatUser {
  id: string
  email: string
  full_name?: string
  timezone?: string // Add timezone support for users
}

interface ChatDetails {
  id: string
  title: string
  user_id: string
  admin_id?: string
  status: 'active' | 'closed' | 'pending'
  created_at: string
  updated_at: string
  profiles?: ChatUser
  messages: Message[]
}

interface Props {
  chatId: string
  onBack: () => void
  onClose?: () => void
  adminTimezone?: string // Admin's timezone
}

const ChatDetail: React.FC<Props> = ({ chatId, onBack, onClose, adminTimezone }) => {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get admin's timezone (from props, context, or browser)
  const currentAdminTimezone = adminTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { formatMessageTime, formatDetailedTime, getRelativeTime } = useTimestampFormatter(currentAdminTimezone);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chat details and messages
const fetchChatData = async () => {
  try {
    setLoading(true)
    
    // Fetch chat details
    const chatResponse = await fetch(`/api/admin/chats/${chatId}`)
    const chatData = await chatResponse.json()
    
    if (!chatData.success) {
      throw new Error(chatData.error || 'Failed to fetch chat')
    }
    
    // Fetch messages
    const messagesResponse = await fetch(`/api/admin/chats/${chatId}/messages`)
    const messagesData = await messagesResponse.json()
    
    if (!messagesData.success) {
      throw new Error(messagesData.error || 'Failed to fetch messages')
    }
    
    setChatDetails(chatData.chat)
    
    // Transform messages to ensure consistent field names
    const transformedMessages = messagesData.messages
      .filter((msg: any) => {
        const content = msg.content || msg.message; // Handle both field names
        return content && 
               content.trim() !== "" && 
               msg.created_at &&
               !isNaN(new Date(msg.created_at).getTime());
      })
      .map((msg: any) => ({
        id: msg.id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        content: msg.content || msg.message, // Map message field to content if needed
        message_type: msg.message_type || 'text',
        created_at: msg.created_at,
        profiles: msg.profiles
      }));
    
    console.log('Transformed messages:', transformedMessages);
    setMessages(transformedMessages)
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchChatData()
  }, [chatId])

 // Update the handleSendMessage function in your ChatDetail component

// Update your handleSendMessage function to immediately show the message

// Update your handleSendMessage function in ChatDetail component

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!newMessage.trim() || sending) return

  console.log('Sending message:', { chatId, newMessage })

  const messageContent = newMessage;
  setNewMessage('') // Clear input immediately
  setSending(true)

  try {
    const response = await fetch('/api/admin/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // This ensures cookies are sent for authentication
      body: JSON.stringify({
        chatId: chatId,
        content: messageContent,
        message_type: 'text'
      })
    })

    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.success) {
      // Refresh messages to get the updated list
      await fetchChatData()
      toast.success('Message sent successfully')
    } else {
      console.error('API Error:', data.error)
      toast.error(data.error || 'Failed to send message')
      setNewMessage(messageContent) // Restore message content on error
    }
  } catch (err) {
    console.error('Error sending message:', err)
    toast.error('Error sending message')
    setNewMessage(messageContent) // Restore message content on error
  } finally {
    setSending(false)
  }
}

const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'closed': return 'text-gray-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleChatAction = async (action: string) => {
    if (action === 'close') {
      try {
        const response = await fetch(`/api/admin/chats/${chatId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'closed' })
        })

        const data = await response.json()
        if (data.success) {
          await fetchChatData()
          toast.success('Chat closed successfully')
        } else {
          toast.error('Failed to close chat')
        }
      } catch (err) {
        toast.error('Error closing chat')
      }
    }
    
    if (action === 'archive') {
      // TODO: Implement archive functionality
      console.log('Archive chat:', chatId)
      toast('Archive functionality coming soon')
    }
    
    setShowOptions(false)
  }

  const isAdminMessage = (message: Message) => {
    return message.sender_id === chatDetails?.admin_id
  }

  // Get the appropriate timezone for displaying timestamps
  const getMessageTimezone = (message: Message) => {
    if (isAdminMessage(message)) {
      // Admin message - use admin's timezone
      return currentAdminTimezone;
    } else {
      // User message - use user's timezone if available, otherwise admin's timezone
      return chatDetails?.profiles?.timezone || currentAdminTimezone;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading chat</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!chatDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat not found</h3>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {chatDetails.profiles ? 
                    getUserInitials(chatDetails.profiles.full_name) : 
                    'U'
                  }
                </span>
              </div>
              
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {chatDetails.profiles ? 
                    `${chatDetails.profiles.full_name || 'User'}` : 
                    'Unknown User'
                  }
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`font-medium ${getStatusColor(chatDetails.status)}`}>
                    {chatDetails.status.charAt(0).toUpperCase() + chatDetails.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>{chatDetails.profiles?.email || 'No email'}</span>
                  {chatDetails.profiles?.timezone && (
                    <>
                      <span>•</span>
                      <span>{chatDetails.profiles.timezone}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {getRelativeTime(chatDetails.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {showOptions && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowOptions(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => handleChatAction('close')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        disabled={chatDetails.status === 'closed'}
                      >
                        <X className="w-4 h-4" />
                        <span>{chatDetails.status === 'closed' ? 'Chat Closed' : 'Close Chat'}</span>
                      </button>
                      <button
                        onClick={() => handleChatAction('archive')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive Chat</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isAdmin = isAdminMessage(message);
              const messageTimezone = getMessageTimezone(message);
              const showTimestamp = index === 0 || 
                (index > 0 && new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000); // 5 minutes
              
              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-gray-400 mb-2">
                      {formatDetailedTime(message.created_at, messageTimezone)}
                    </div>
                  )}
                  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isAdmin && (
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-xs">
                            {getUserInitials(chatDetails.profiles?.full_name)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isAdmin
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                          isAdmin ? 'text-emerald-100' : 'text-gray-500'
                        }`}>
                          <span>{formatMessageTime(message.created_at, messageTimezone)}</span>
                          {isAdmin && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              rows={1}
              disabled={sending || chatDetails.status === 'closed'}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || chatDetails.status === 'closed'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-h-[44px]"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {chatDetails.status === 'closed' && (
          <div className="mt-2 text-sm text-gray-500 text-center flex items-center justify-center space-x-1">
            <X className="w-4 h-4" />
            <span>This chat has been closed</span>
          </div>
        )}
        
        {chatDetails.status === 'pending' && (
          <div className="mt-2 text-sm text-yellow-600 text-center flex items-center justify-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Chat is pending - waiting for user response</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDetail