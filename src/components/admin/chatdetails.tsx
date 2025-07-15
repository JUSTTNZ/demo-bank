'use client'

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

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image'
  created_at: string
  profiles?: {
    id: string
    first_name: string
    last_name: string
    email: string
    full_name?: string
  }
}

interface ChatUser {
  id: string
  first_name: string
  last_name: string
  email: string
  full_name?: string
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
}

const ChatDetail: React.FC<Props> = ({ chatId, onBack, onClose }) => {
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      setMessages(messagesData.messages)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChatData()
  }, [chatId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          message_type: 'text'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewMessage('')
        // Refresh messages
        fetchChatData()
      } else {
        alert('Failed to send message')
      }
    } catch (err) {
      alert('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
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
          fetchChatData()
        } else {
          alert('Failed to close chat')
        }
      } catch (err) {
        alert('Error closing chat')
      }
    }
    
    if (action === 'archive') {
      // TODO: Implement archive functionality
      console.log('Archive chat:', chatId)
    }
    
    setShowOptions(false)
  }

  const isAdminMessage = (message: Message) => {
    return message.sender_id === chatDetails?.admin_id
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
                    getUserInitials(chatDetails.profiles.first_name, chatDetails.profiles.last_name) : 
                    'U'
                  }
                </span>
              </div>
              
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {chatDetails.profiles ? 
                    `${chatDetails.profiles.first_name} ${chatDetails.profiles.last_name}` : 
                    'Unknown User'
                  }
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`font-medium ${getStatusColor(chatDetails.status)}`}>
                    {chatDetails.status.charAt(0).toUpperCase() + chatDetails.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>{chatDetails.profiles?.email || 'No email'}</span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleChatAction('close')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Close Chat
                    </button>
                    <button
                      onClick={() => handleChatAction('archive')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Archive Chat
                    </button>
                  </div>
                </div>
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
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isAdminMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isAdminMessage(message)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="mb-1">
                    <p className="text-sm font-medium">
                      {message.profiles ? 
                        `${message.profiles.first_name} ${message.profiles.last_name}` : 
                        'Unknown User'
                      }
                    </p>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isAdminMessage(message) ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              disabled={sending || chatDetails.status === 'closed'}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || chatDetails.status === 'closed'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {chatDetails.status === 'closed' && (
          <div className="mt-2 text-sm text-gray-500 text-center">
            This chat has been closed
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDetail