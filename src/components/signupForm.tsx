import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    ssn: '',
    dob: '',
    initialDeposit: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.error('Sign up is currently disabled. Please contact customer support.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-600 text-center mb-6">
          Open a New Bank Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First + Last Name */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
          </div>

          {/* Password + Confirm */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          </div>

          <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Home Address" name="address" value={form.address} onChange={handleChange} />
          <Input label="Social Security Number (SSN)" name="ssn" value={form.ssn} onChange={handleChange} />
          <Input label="Date of Birth" type="date" name="dob" value={form.dob} onChange={handleChange} />
          <Input label="Initial Deposit Amount ($)" type="number" name="initialDeposit" value={form.initialDeposit} onChange={handleChange} />

          

          <button
            type="submit"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
}: {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
      />
    </div>
  )
}
