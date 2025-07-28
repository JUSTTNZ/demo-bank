// components/admin/AccountStatusDropdown.tsx
import { useState } from 'react'
import { ChevronRight, Check, Ban, Pause } from 'lucide-react'
import { Account, AccountStatus } from '@/types/adminTypes'
import toast from 'react-hot-toast'

interface AccountStatusDropdownProps {
  accounts: Account[]
  onStatusUpdate: (accountId: string, newStatus: AccountStatus) => void
  onClose: () => void
}

const AccountStatusDropdown = ({ 
  accounts, 
  onStatusUpdate, 
  onClose 
}: AccountStatusDropdownProps) => {
  const [showStatusOptions, setShowStatusOptions] = useState<string | null>(null)
  const [updatingAccounts, setUpdatingAccounts] = useState<Set<string>>(new Set())

  const statusConfig = {
    active: {
      label: 'Active',
      color: 'text-green-700 bg-green-100',
      icon: Check,
      description: 'Account is active and functional'
    },
    disabled: {
      label: 'Disabled',
      color: 'text-red-700 bg-red-100',
      icon: Ban,
      description: 'Account is disabled and cannot be used'
    },
    suspended: {
      label: 'Suspended',
      color: 'text-yellow-700 bg-yellow-100',
      icon: Pause,
      description: 'Account is temporarily suspended'
    }
  }

  const handleStatusChange = async (id: string, newStatus: AccountStatus) => {
    setUpdatingAccounts(prev => new Set(prev).add(id))
    
    try {
      const response = await fetch(`/api/admin/accounts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Account status updated to ${newStatus}`)
        onStatusUpdate(id, newStatus)
      } else {
        toast.error(data.error || 'Failed to update account status')
      }
    } catch (error) {
      toast.error('Failed to update account status')
      console.error('Error updating account status:', error)
    } finally {
      setUpdatingAccounts(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      setShowStatusOptions(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 text-center">
        No accounts found
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
        Account Status ({accounts.length} account{accounts.length !== 1 ? 's' : ''})
      </div>
      
      {accounts.map((account) => {
        const StatusIcon = statusConfig[account.status].icon
        const isUpdating = updatingAccounts.has(account.id)
        
        return (
          <div key={account.id} className="relative">
            <button
              onClick={() => setShowStatusOptions(
                showStatusOptions === account.id ? null : account.id
              )}
              disabled={isUpdating}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="text-xs font-mono text-gray-500">
                  ...{account.account_number.slice(-6)}
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-3 h-3" />
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[account.status].color}`}>
                    {statusConfig[account.status].label}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                showStatusOptions === account.id ? 'rotate-90' : ''
              }`} />
            </button>
            
            {showStatusOptions === account.id && (
              <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[200px]">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                  Change Status
                </div>
                {Object.entries(statusConfig).map(([status, config]) => {
                  const OptionIcon = config.icon
                  const isCurrentStatus = account.status === status
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(account.id, status as AccountStatus)}
                      disabled={isCurrentStatus || isUpdating}
                      className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                        isCurrentStatus 
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <OptionIcon className="w-4 h-4 mr-3" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-gray-500">{config.description}</div>
                      </div>
                      {isCurrentStatus && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AccountStatusDropdown