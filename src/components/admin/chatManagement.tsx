'use client'

import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Eye,
  Archive,
  Trash2,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import ChatDetail from '@/components/admin/chatdetails'

interface Chat {
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
  }
  messages: Array<{ count: number }>
}

interface Props {
  onRefresh: () => void
}

const ChatsManagement: React.FC<Props> = ({ onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  // Fetch chats from API
  const fetchChats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/chats')
      const data = await response.json()
      
      if (data.success) {
        setChats(data.chats)
      } else {
        setError(data.error || 'Failed to fetch chats')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  // Filter chats based on search and status
  const filteredChats = chats.filter(chat => {
    const userName = chat.profiles ? `${chat.profiles.full_name} ` : ''
    const userEmail = chat.profiles?.email || ''
    
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || chat.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
            Active
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5"></div>
            Closed
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
            Pending
          </span>
        )
      default:
        return null
    }
  }

  const getUserInitials = (fullName?: string | null) => {
  if (!fullName) return 'U'
  const parts = fullName.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}


  const handleChatAction = async (chatId: string, action: string) => {
    if (action === 'view') {
      setSelectedChatId(chatId)
      return
    }
    
    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this chat?')) {
        try {
          const response = await fetch(`/api/admin/chats/${chatId}`, {
            method: 'DELETE'
          })
          const data = await response.json()
          
          if (data.success) {
            fetchChats() // Refresh the list
          } else {
            alert('Failed to delete chat')
          }
        } catch {
          alert('Error deleting chat')
        }
      }
    }
    
    console.log(`${action} chat:`, chatId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getMessageCount = (chat: Chat) => {
    return chat.messages && chat.messages.length > 0 ? chat.messages[0].count : 0
  }

  if (selectedChatId) {
    return (
      <ChatDetail 
        chatId={selectedChatId} 
        onBack={() => setSelectedChatId(null)}
        className="flex-1 overflow-hidden"
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading chats</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchChats}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Support Chats</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage customer support conversations and inquiries
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  onRefresh()
                  fetchChats()
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Refresh Chats
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Chats</p>
                <p className="text-2xl font-bold text-green-600">
                  {chats.filter(chat => chat.status === 'active').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">
                  {chats.filter(chat => !chat.admin_id).length}
                </p>
              </div>
              <User className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {chats.filter(chat => chat.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search chats by user name, email, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chat Details
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {chat.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(chat.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {chat.profiles ? 
                              getUserInitials(chat.profiles.full_name) : 
                              'U'
                            }
                          </span>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {chat.profiles ? 
                              `${chat.profiles.full_name}` : 
                              'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {chat.profiles?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{getMessageCount(chat)}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(chat.status)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleChatAction(chat.id, 'view')}
                          className="text-emerald-600 hover:text-emerald-900 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                          title="View Chat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChatAction(chat.id, 'archive')}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50 transition-colors"
                          title="Archive Chat"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChatAction(chat.id, 'delete')}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chats found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all' 
                ? "Try adjusting your filters to see more chats."
                : "Support chats will appear here when customers start conversations."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsManagement