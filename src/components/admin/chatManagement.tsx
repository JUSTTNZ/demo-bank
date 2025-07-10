'use client'

import React, { useState, useEffect } from 'react'
import { Chat } from '@/types/adminTypes'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  User, 
  MoreVertical,
  Eye,
  Archive,
  Trash2,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

interface Props {
  chats: Chat[]
  onRefresh: () => void
}

// Mock data for demonstration - replace with real data from your API
const mockChats = [
  {
    id: '1',
    title: 'Account Balance Issue',
    user: {
      id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null
    },
    admin: {
      id: 'a1',
      name: 'Sarah Wilson',
      email: 'sarah@bank.com',
      avatar: null
    },
    status: 'active',
    lastMessage: {
      text: 'Thank you for your help with the balance issue!',
      timestamp: '2 minutes ago',
      sender: 'user',
      seen: true
    },
    unreadCount: 0,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Transaction History Query',
    user: {
      id: 'u2',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: null
    },
    admin: null,
    status: 'active',
    lastMessage: {
      text: 'I need help accessing my transaction history',
      timestamp: '15 minutes ago',
      sender: 'user',
      seen: false
    },
    unreadCount: 3,
    createdAt: '2024-01-15T09:45:00Z'
  },
  {
    id: '3',
    title: 'Card Activation Support',
    user: {
      id: 'u3',
      name: 'Robert Chen',
      email: 'robert@example.com',
      avatar: null
    },
    admin: {
      id: 'a2',
      name: 'Mike Johnson',
      email: 'mike@bank.com',
      avatar: null
    },
    status: 'closed',
    lastMessage: {
      text: 'Perfect! My card is now activated. Thanks!',
      timestamp: '1 hour ago',
      sender: 'user',
      seen: true
    },
    unreadCount: 0,
    createdAt: '2024-01-15T08:20:00Z'
  },
  {
    id: '4',
    title: 'Password Reset Request',
    user: {
      id: 'u4',
      name: 'Emma Thompson',
      email: 'emma@example.com',
      avatar: null
    },
    admin: {
      id: 'a1',
      name: 'Sarah Wilson',
      email: 'sarah@bank.com',
      avatar: null
    },
    status: 'active',
    lastMessage: {
      text: 'I\'ve sent you the password reset instructions',
      timestamp: '30 minutes ago',
      sender: 'admin',
      seen: false
    },
    unreadCount: 1,
    createdAt: '2024-01-14T16:15:00Z'
  }
]

const ChatsManagement: React.FC<Props> = ({ chats, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [displayChats, setDisplayChats] = useState(mockChats)

  // Filter chats based on search and status
  const filteredChats = displayChats.filter(chat => {
    const matchesSearch = chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      default:
        return null
    }
  }

  const getMessageStatusIndicator = (message: any) => {
    if (message.sender === 'admin') {
      return message.seen ? (
        <div className="flex items-center space-x-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Seen</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Sent</span>
        </div>
      )
    }
    return null
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleChatAction = (chatId: string, action: string) => {
    console.log(`${action} chat:`, chatId)
    // Implement chat actions here
  }

  const assignToMe = (chatId: string) => {
    // Implement assign to current admin logic
    console.log('Assigning chat to current admin:', chatId)
  }

  return (
    <div className="space-y-6">
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
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Refresh Chats
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Chats</p>
              <p className="text-2xl font-bold text-gray-900">{displayChats.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Chats</p>
              <p className="text-2xl font-bold text-green-600">
                {displayChats.filter(chat => chat.status === 'active').length}
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
                {displayChats.filter(chat => !chat.admin).length}
              </p>
            </div>
            <User className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread Messages</p>
              <p className="text-2xl font-bold text-red-600">
                {displayChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-red-500" />
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
            </select>
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chat Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredChats.map((chat) => (
                <tr key={chat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{chat.title}</div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {chat.user.avatar ? (
                          <img 
                            src={chat.user.avatar} 
                            alt={chat.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {getUserInitials(chat.user.name)}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{chat.user.name}</div>
                        <div className="text-sm text-gray-500">{chat.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {chat.admin ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {getUserInitials(chat.admin.name)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{chat.admin.name}</div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => assignToMe(chat.id)}
                        className="text-sm text-emerald-600 hover:text-emerald-900 font-medium"
                      >
                        Assign to me
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{chat.lastMessage.text}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-sm text-gray-500">{chat.lastMessage.timestamp}</div>
                        {getMessageStatusIndicator(chat.lastMessage)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(chat.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleChatAction(chat.id, 'view')}
                        className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleChatAction(chat.id, 'archive')}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setSelectedChat(selectedChat === chat.id ? null : chat.id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {selectedChat === chat.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleChatAction(chat.id, 'view')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                View Chat
                              </button>
                              <button
                                onClick={() => handleChatAction(chat.id, 'close')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Close Chat
                              </button>
                              <button
                                onClick={() => handleChatAction(chat.id, 'transfer')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Transfer Chat
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleChatAction(chat.id, 'delete')}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Chat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
  )
}

export default ChatsManagement