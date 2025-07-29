import { useState } from 'react'
import { Check, Ban, Pause, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

type AccountStatus = 'active' | 'disabled' | 'suspended'

interface AccountStatusDropdownProps {
  accountId: string
  currentStatus: AccountStatus
  onStatusChange: (newStatus: AccountStatus) => Promise<void>
}

const AccountStatusDropdown = ({
  accountId,
  currentStatus,
  onStatusChange
}: AccountStatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusOptions = [
    { 
      value: 'active', 
      label: 'Active', 
      icon: Check, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      value: 'disabled', 
      label: 'Disabled', 
      icon: Ban, 
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    { 
      value: 'suspended', 
      label: 'Suspended', 
      icon: Pause, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  const handleStatusUpdate = async (newStatus: AccountStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      await onStatusChange(newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
      setIsOpen(false)
    }
  }

  const currentStatusConfig = statusOptions.find(opt => opt.value === currentStatus)

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center justify-between px-3 py-1 rounded-md border ${currentStatusConfig?.bgColor} ${currentStatusConfig?.color} text-sm font-medium hover:bg-opacity-80 transition-colors`}
      >
        <div className="flex items-center">
          {currentStatusConfig?.icon && (
            <currentStatusConfig.icon className="w-3 h-3 mr-1" />
          )}
          <span className="capitalize">{currentStatus}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusUpdate(option.value as AccountStatus)}
                disabled={option.value === currentStatus || isUpdating}
                className={`${option.value === currentStatus ? 'bg-gray-100' : 'hover:bg-gray-50'} w-full text-left px-3 py-2 text-sm flex items-center ${option.color}`}
              >
                <option.icon className="w-3 h-3 mr-2" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountStatusDropdown