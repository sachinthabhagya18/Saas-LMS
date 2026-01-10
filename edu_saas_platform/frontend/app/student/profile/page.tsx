'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../lib/api'
import { 
  Home, BookOpen, Bell, User, LogOut, Save, Lock, Mail, Phone, Search,
  MapPin, UserCircle, Shield, Key, Upload, Camera, Sparkles, Target
} from 'lucide-react'

export default function StudentProfilePage() {
  const { user, logout, refreshAuth, isAuthLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }))
    }
  }, [user, isAuthLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
      }
      
      if (formData.password) {
        payload.password = formData.password
      }

      await authApi.updateProfile(payload)
      if (refreshAuth) await refreshAuth()
      
      alert('Profile updated successfully')
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading profile...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-yellow-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Sidebar */}
      <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-yellow-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
        <div className="mb-12 p-3 ">
        </div>

        <div className="flex flex-col gap-8 w-full px-5">
          <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
          <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
          <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} />
          <NavItem icon={Bell} label="Notifications" color="from-orange-500 to-amber-400" onClick={() => router.push('/student/notifications')} />
          <NavItem icon={User} label="Profile" color="from-yellow-500 to-orange-400" onClick={() => router.push('/student/profile')} active/>
        </div>

        <div className="mt-auto">
          <button 
            onClick={logout}
            className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg shadow-red-300 hover:shadow-xl hover:shadow-red-400/50 hover:scale-110 transition-all duration-300 group"
          >
            <LogOut size={26} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-28 p-8 max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Management</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600 text-xl">
            Manage your personal information and security settings
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-yellow-50/50 to-amber-50/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Profile Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-yellow-500/40 group-hover:scale-105 transition-transform duration-500">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <button className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all">
                  <Camera size={20} />
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-slate-600 text-lg mb-4">Student Account</p>
                
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-bold text-slate-800">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-bold text-slate-800">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Student ID</p>
                      <p className="font-bold text-slate-800">{user?.id?.toString().slice(0,6)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-10 space-y-12">
            {/* Personal Details Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                  <UserCircle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Personal Information</h3>
                  <p className="text-slate-600">Update your basic details and contact information</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">First Name</label>
                    <input 
                      type="text"
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none transition text-lg font-medium"
                      value={formData.first_name}
                      onChange={e => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="tel"
                        className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none transition text-lg font-medium"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Last Name</label>
                    <input 
                      type="text"
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none transition text-lg font-medium"
                      value={formData.last_name}
                      onChange={e => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="email"
                        disabled
                        className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-lg font-medium"
                        value={formData.email}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Cannot change</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400" size={22} />
                    <textarea 
                      className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none transition text-lg font-medium min-h-[120px] resize-none"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter your full address for delivery of study materials, notes, and exam papers..."
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-3 flex items-center gap-2">
                    <Sparkles size={16} /> This address will be used for delivering printed study materials.
                  </p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold rounded-full">
                  Security Settings
                </span>
              </div>
            </div>

            {/* Security Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Account Security</h3>
                  <p className="text-slate-600">Update your password and security settings</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="password"
                        className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition text-lg font-medium"
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="password"
                        className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition text-lg font-medium"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50/50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-start gap-4">
                  <Shield className="text-emerald-500 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Password Requirements</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li className="flex items-center gap-2">✓ Minimum 8 characters</li>
                      <li className="flex items-center gap-2">✓ At least one uppercase letter</li>
                      <li className="flex items-center gap-2">✓ At least one number</li>
                      <li className="flex items-center gap-2">✓ At least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={loading}
                className="group bg-gradient-to-r from-slate-900 to-slate-800 text-white px-10 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-slate-900/30 hover:scale-105 transition-all duration-500 flex items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

function NavItem({ icon: Icon, label, color, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl transition-all duration-500 w-full flex flex-col items-center group relative ${
        active ? 'bg-gradient-to-br from-white to-slate-100 shadow-lg shadow-slate-200/50' : 'hover:bg-white/60'
      }`}
      title={label}
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <span className={`text-xs font-bold mt-2 ${active ? 'text-yellow-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-yellow-500 to-amber-400 rounded-l-full"></div>
      )}
    </button>
  )
}