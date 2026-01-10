'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { superAdminApi } from '../../../lib/api'
import { ArrowLeft, Building2, Mail, Lock, User, Save } from 'lucide-react'

export default function CreateAcademyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
  })

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match")
    
    setLoading(true)
    try {
      await superAdminApi.createAcademy({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.confirmPassword,
          role: 'teacher',
          first_name: formData.firstName,
          last_name: formData.lastName
      })
      alert("Academy created successfully!")
      router.push('/admin/academies')
    } catch (e: any) {
        alert(e.message || "Failed to create academy")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" /> Back to Academies
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 border-b border-gray-100 pb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-4">
                <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Register New Academy</h1>
            <p className="text-gray-500 mt-1">Create a new tenant environment for a teacher.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher First Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input required name="firstName" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="John" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input required name="lastName" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name (Subdomain)</label>
                <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input required name="username" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="myacademy" />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will create: http://myacademy.localhost:3000</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input required type="email" name="email" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="teacher@example.com" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input required type="password" name="password" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input required type="password" name="confirmPassword" onChange={handleChange} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                    {loading ? 'Creating...' : <><Save size={20} /> Create Academy</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  )
}