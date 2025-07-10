'use client'

import React from 'react'
import { Chat } from '@/types/adminTypes'

interface Props {
  chats: Chat[]
  onRefresh: () => void
}

const ChatsManagement: React.FC<Props> = ({ chats, onRefresh }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Chats</h2>
        <p className="text-gray-600">Chat management features coming soon...</p>
      </div>
    </div>
  )
}

export default ChatsManagement;