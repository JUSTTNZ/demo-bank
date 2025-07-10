'use client'

import React from 'react'
import { Account } from '@/types/adminTypes'

interface Props {
  accounts: Account[]
  onRefresh: () => void
}

const AccountsManagement: React.FC<Props> = ({ accounts, onRefresh }) => {
  console.log(accounts, onRefresh)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accounts Management</h2>
        <p className="text-gray-600">Account management features coming soon...</p>
      </div>
    </div>
  )
}

export default AccountsManagement;