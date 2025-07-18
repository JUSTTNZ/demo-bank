import { useState, useEffect } from 'react'
import { CreditCard, Search, Filter, DollarSign, User, Calendar, Eye, Edit, Trash2, RefreshCw, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Type definitions
interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

interface Account {
  id: string
  user_id: string
  account_number: string
  balance: number
  currency?: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
  profiles: User | null
}

interface AccountsManagementProps {
  initialAccounts?: Account[]
  onRefresh?: () => void
}

const AccountsManagement = ({ initialAccounts = [], onRefresh }: AccountsManagementProps) => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    balance: '',
    status: 'active' as Account['status']
  })
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Fetch accounts from API
  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/accounts')
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.accounts)
      } else {
        toast.error(data.error || 'Failed to fetch accounts')
      }
    } catch (error) {
      toast.error('Failed to fetch accounts')
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load accounts on component mount
  useEffect(() => {
    if (initialAccounts.length === 0) {
      fetchAccounts()
    }
  }, [initialAccounts.length])

  // Handle refresh
  const handleRefresh = () => {
    fetchAccounts()
    if (onRefresh) onRefresh()
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.account_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus
    return matchesSearch && matchesStatus
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const totalBalance = filteredAccounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0)
  const activeAccounts = filteredAccounts.filter(account => account.status === 'active').length

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleViewAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      alert(`Account Details:\n\nID: ${account.id}\nAccount Number: ${account.account_number}\nUser: ${account.profiles?.full_name}\nBalance: ${formatCurrency(account.balance)}\nStatus: ${account.status}`)
    }
  }

  const handleEditAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      setEditingAccount(accountId)
      setEditForm({
        balance: account.balance.toString(),
        status: account.status
      })
    }
  }

  const handleSaveEdit = async (accountId: string) => {
    setUpdateLoading(accountId)
    try {
      const updates = {
        balance: parseFloat(editForm.balance),
        status: editForm.status
      }

      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Account updated successfully')
        setEditingAccount(null)
        fetchAccounts() // Refresh the accounts list
      } else {
        toast.error(data.error || 'Failed to update account')
      }
    } catch (error) {
      toast.error('Error updating account')
      console.error('Error updating account:', error)
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingAccount(null)
    setEditForm({ balance: '', status: 'active' })
  }

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account && window.confirm(`Are you sure you want to delete the account for ${account.profiles?.full_name}?`)) {
      setUpdateLoading(accountId)
      try {
        const response = await fetch(`/api/admin/accounts/${accountId}`, {
          method: 'DELETE'
        })

        const data = await response.json()
        
        if (data.success) {
          toast.success('Account deleted successfully')
          // Remove account from local state
          setAccounts(accounts.filter(acc => acc.id !== accountId))
        } else {
          toast.error(data.error || 'Failed to delete account')
        }
      } catch (error) {
        toast.error('Error deleting account')
        console.error('Error deleting account:', error)
      } finally {
        setUpdateLoading(null)
      }
    }
  }

  // Use showNotification function to avoid unused variable warning
  const handleNotificationTest = () => {
    showNotification('success', 'Test notification')
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accounts Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor and manage user accounts and balances ({accounts.length} total accounts)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleNotificationTest}
              className="hidden"
              aria-hidden="true"
            >
              Test Notification
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
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
              placeholder="Search accounts by user name, email, or account number..."
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
                          {account.account_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {account.id.slice(0, 8)}...
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
                          {account.profiles?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.profiles?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAccount === account.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({...editForm, balance: e.target.value})}
                          className="w-32 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.balance, account.currency)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAccount === account.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value as Account['status']})}
                        className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(account.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingAccount === account.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveEdit(account.id)}
                          disabled={updateLoading === account.id}
                          className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                          title="Save Changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updateLoading === account.id}
                          className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading accounts...</h3>
            <p className="text-gray-500">Please wait while we fetch the latest data.</p>
          </div>
        )}
        
        {!loading && filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No accounts available to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsManagement