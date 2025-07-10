import { useState } from 'react'
import { CreditCard, Search, Filter, DollarSign, User, Calendar, Eye, Edit, Trash2, Plus } from 'lucide-react'

// Type definitions
interface User {
  id: string
  full_name: string
  email: string
  avatar?: string
}

interface Account {
  id: string
  user: User
  account_type: 'checking' | 'savings' | 'investment'
  balance: number
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

interface AccountsManagementProps {
  accounts: Account[]
  onRefresh: () => void
}

const AccountsManagement = ({ accounts, onRefresh }: AccountsManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus
    const matchesType = selectedType === 'all' || account.account_type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700'
      case 'suspended':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-700'
      case 'savings':
        return 'bg-green-100 text-green-700'
      case 'investment':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balance, 0)
  const activeAccounts = filteredAccounts.filter(account => account.status === 'active').length

  const handleViewAccount = (accountId: string) => {
    console.log('View account:', accountId)
  }

  const handleEditAccount = (accountId: string) => {
    console.log('Edit account:', accountId)
  }

  const handleDeleteAccount = (accountId: string) => {
    console.log('Delete account:', accountId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accounts Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor and manage user accounts and balances
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Active Accounts</p>
              <p className="text-2xl font-bold text-emerald-600">
                {activeAccounts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search accounts by user name, email, or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Types</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="investment">Investment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {account.id.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {account.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {account.user.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(account.account_type)}`}>
                      {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {account.balance.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(account.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAccount(account.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Account"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditAccount(account.id)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        title="Edit Account"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Account"
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
        
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No accounts available to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Demo component with sample data
const Demo = () => {
  const [accounts] = useState<Account[]>([
    {
      id: 'acc_1a2b3c4d5e6f7g8h',
      user: {
        id: 'user_1',
        full_name: 'John Doe',
        email: 'john.doe@example.com'
      },
      account_type: 'checking',
      balance: 25000,
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'acc_2b3c4d5e6f7g8h9i',
      user: {
        id: 'user_2',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      account_type: 'savings',
      balance: 75000,
      status: 'active',
      created_at: '2024-02-20T14:30:00Z',
      updated_at: '2024-02-20T14:30:00Z'
    },
    {
      id: 'acc_3c4d5e6f7g8h9i0j',
      user: {
        id: 'user_3',
        full_name: 'Michael Johnson',
        email: 'michael.johnson@example.com'
      },
      account_type: 'investment',
      balance: 150000,
      status: 'inactive',
      created_at: '2024-03-10T09:15:00Z',
      updated_at: '2024-03-10T09:15:00Z'
    },
    {
      id: 'acc_4d5e6f7g8h9i0j1k',
      user: {
        id: 'user_4',
        full_name: 'Sarah Williams',
        email: 'sarah.williams@example.com'
      },
      account_type: 'checking',
      balance: 12500,
      status: 'suspended',
      created_at: '2024-04-05T16:45:00Z',
      updated_at: '2024-04-05T16:45:00Z'
    },
    {
      id: 'acc_5e6f7g8h9i0j1k2l',
      user: {
        id: 'user_5',
        full_name: 'David Brown',
        email: 'david.brown@example.com'
      },
      account_type: 'savings',
      balance: 89000,
      status: 'active',
      created_at: '2024-05-12T11:20:00Z',
      updated_at: '2024-05-12T11:20:00Z'
    }
  ])

  const handleRefresh = () => {
    console.log('Refreshing accounts...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AccountsManagement accounts={accounts} onRefresh={handleRefresh} />
      </div>
    </div>
  )
}

export default AccountsManagement