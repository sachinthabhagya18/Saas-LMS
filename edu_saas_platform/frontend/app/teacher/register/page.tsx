'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, Briefcase, Layout } from 'lucide-react'

export default function TeacherRegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      // 1. Register as Teacher
      const result = await register({
        ...formData,
        role: 'teacher'
      })

      // 2. Redirect to their new domain
      if (result.domain) {
        // Construct the new URL (e.g., http://teacher1.localhost:3000/login)
        const protocol = window.location.protocol
        const port = window.location.port ? `:${window.location.port}` : ''
        const newUrl = `${protocol}//${result.domain}${port}/login?registered=teacher`
        
        console.log('Redirecting to new academy:', newUrl)
        window.location.href = newUrl
      } else {
        router.push('/login?registered=true')
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-purple-600 p-8 text-center text-white">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Briefcase size={32} />
          </div>
          <h2 className="text-3xl font-bold">Create Your Academy</h2>
          <p className="text-purple-100 mt-2">Launch your own LMS today</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input required name="firstName" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Jane" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input required name="lastName" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Smith" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name (Username)</label>
            <div className="relative">
              <Layout size={18} className="absolute left-3 top-3 text-gray-400" />
              <input required name="username" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="myacademy" />
            </div>
            <p className="text-xs text-gray-500 mt-1">This will be your subdomain: myacademy.localhost</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input required type="email" name="email" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="teacher@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" name="password" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
              <input required type="password" name="confirmPassword" onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
            {loading ? 'Creating Academy...' : <><UserPlus size={20} /> Create Academy</>}
          </button>
        </form>
      </div>
    </div>
  )
}