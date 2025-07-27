import { useState, useEffect } from 'react'
import supabase from '@/utils/supabaseClient'
import { X, User, Mail, Lock, Shield, CreditCard, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { NewUser } from '@/types/adminTypes'

interface UserProfile {
  id: string
  role: string
  full_name?: string
  email?: string
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

const CreateUserModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    createAccount: true,
    initialBalance: 1000
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error('Auth error:', authError)
          toast.error('Unable to verify admin credentials')
          return
        }

        console.log('Current auth user:', user.id)
        setCurrentUser(user)

        // Get the user's profile to verify admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, full_name, email')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile fetch error:', profileError)
          toast.error('Unable to verify admin profile')
          return
        }

        console.log('Current user profile:', profile)
        setCurrentUserProfile(profile)

        // Verify admin role
        if (profile.role !== 'admin') {
          toast.error('Only admin users can create new users')
          onClose()
          return
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Authentication error')
        onClose()
      }
    }

    getUser()
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser || !currentUserProfile) {
      toast.error('Admin credentials not verified')
      return
    }

    if (currentUserProfile.role !== 'admin') {
      toast.error('Only admin users can create new users')
      return
    }

    setLoading(true)
    
    // Debug logging - check what data we're about to send
    console.log('=== DEBUG: Form submission ===')
    console.log('newUser state:', newUser)
    console.log('currentUser:', currentUser.id)
    console.log('currentUserProfile:', currentUserProfile)
    console.log('===========================')
    
    try {
      const payload = {
        email: newUser.email.trim(),
        password: newUser.password,
        fullName: newUser.fullName.trim(),
        role: newUser.role,
        createAccount: newUser.createAccount,
        initialBalance: newUser.initialBalance,
        adminId: currentUser.id // This is the key field for created_by_admin_id
      }

      console.log('=== DEBUG: Payload being sent ===')
      console.log('Payload:', JSON.stringify(payload, null, 2))
      console.log('==============================')

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('=== DEBUG: API Response ===')
      console.log('Response status:', response.status)
      console.log('Response data:', data)
      console.log('========================')

      if (data.success) {
        toast.success(data.message || 'User created successfully!')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('=== DEBUG: Error ===')
      console.error('Error:', error)
      console.error('=================')
      toast.error('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  // Debug function to check form state
  const handleInputChange = (field: keyof NewUser, value: string | number | boolean) => {
    console.log(`=== DEBUG: Input change ===`)
    console.log(`Field: ${field}`)
    console.log(`New value: ${value}`)
    console.log(`Value type: ${typeof value}`)
    console.log(`========================`)
    
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Show loading state while verifying admin credentials
  if (!currentUser || !currentUserProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Create New User</h2>
              <p className="text-emerald-100 text-sm mt-1">
                Add a new user to the system
                {currentUserProfile?.full_name && (
                  <span className="block text-xs opacity-75">
                    Creating as: {currentUserProfile.full_name}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Debug Info - Uncomment during development */}
          {/* <div className="bg-gray-100 p-3 rounded-lg text-xs">
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify({ newUser, adminId: currentUser?.id }, null, 2)}</pre>
          </div> */}

          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User className="w-4 h-4 mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={newUser.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="Enter secure password"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 mr-2" />
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Create Account Option */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="createAccount"
                checked={newUser.createAccount}
                onChange={(e) => handleInputChange('createAccount', e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="createAccount" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Create default account
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Automatically create a default account for this user
            </p>

            {/* Initial Balance */}
            {newUser.createAccount && (
              <div className="space-y-2 ml-7">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Initial Balance
                </label>
                <input
                  type="number"
                  value={newUser.initialBalance}
                  onChange={(e) => handleInputChange('initialBalance', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  min="0"
                  step="0.01"
                  placeholder="1000.00"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal