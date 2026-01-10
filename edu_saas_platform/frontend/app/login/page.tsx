'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useAcademy } from '../contexts/AcademyContext'
import { LogIn, User, Lock, ArrowRight, Shield, Eye, EyeOff, BookOpen } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { settings } = useAcademy()
  
  const [formData, setFormData] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMsg('Account created successfully! Please log in.')
    } else if (registered === 'teacher') {
      setSuccessMsg('Academy created successfully! Log in to access your dashboard.')
    }
  }, [searchParams])

  const primaryColor = settings?.primary_color || '#2563eb'
  const secondaryColor = settings?.secondary_color || '#7c3aed'
  
  // Create color variations with minimal opacity
  const primaryLight = `${primaryColor}05`  // 5% opacity
  const primaryMedium = `${primaryColor}20` // 20% opacity
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`

  // CSS Variables for dynamic styling
  const pageStyles = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log("Attempting login...")
      const user = await login(formData.identifier, formData.password)
      
      console.log('✅ Login successful. Role:', user.role)

      // Redirect based on role
      if (user.role === 'admin') {
          console.log("Redirecting to Super Admin Dashboard...")
          router.push('/admin/dashboard') 
      } else if (user.role === 'teacher') {
          console.log("Redirecting to Teacher Dashboard...")
          router.push('/teacher/dashboard') 
      } else {
          console.log("Redirecting to Student Dashboard...")
          router.push('/student/dashboard')
      }

    } catch (err: any) {
      console.error('Login Failed:', err)
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden" style={pageStyles}>
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
        {/* Left Side - Branding */}
        <div 
          className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center text-white relative"
          style={{ background: gradient }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full translate-y-20 -translate-x-20"></div>
          </div>
          
          <div className="relative z-10">
            {/* Academy Logo/Name */}
            <div className="flex items-center gap-3 mb-8">
              {settings?.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.academy_name}
                  className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl p-1 object-contain"
                />
              ) : (
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{settings?.academy_name || 'Learning Academy'}</h2>
                <p className="text-white/80 text-sm">Education Platform</p>
              </div>
            </div>
            
            {/* Welcome Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-white/80">
                Sign in to access your personalized dashboard, course materials, and learning resources.
              </p>
            </div>
            
            {/* Features List */}
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-white/90">Access all your courses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-white/90">Track your progress</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-white/90">Connect with instructors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-3/5 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            {/* Messages */}
            {successMsg && (
              <div 
                className="mb-6 p-4 rounded-xl border text-sm flex items-center gap-3"
                style={{ 
                  backgroundColor: `${secondaryColor}05`,
                  borderColor: `${secondaryColor}20`,
                  color: secondaryColor
                }}
              >
                <Shield size={18} />
                {successMsg}
              </div>
            )}
            
            {error && (
              <div 
                className="mb-6 p-4 rounded-xl border text-sm flex items-center gap-3"
                style={{ 
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626'
                }}
              >
                <Shield size={18} />
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <User size={20} style={{ color: primaryColor }} />
                  </div>
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="Enter your email or username"
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock size={20} style={{ color: primaryColor }} />
                  </div>
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: primaryColor }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 focus:ring-2 focus:ring-offset-0 text-[var(--primary)]"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a 
                  href="/forgot-password" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button 
                disabled={loading}
                type="submit" 
                className="w-full py-3.5 rounded-xl font-bold text-white hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ 
                  background: gradient,
                  boxShadow: `0 4px 15px ${primaryColor}30`
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Alternative Options */}
            <div className="space-y-3">
              <a 
                href="/register" 
                className="block w-full py-3 rounded-xl font-medium text-center border-2 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                style={{ 
                  borderColor: primaryMedium,
                  color: primaryColor,
                  backgroundColor: primaryLight
                }}
              >
                <User size={18} />
                Register as Student
              </a>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <a 
                  href="/terms" 
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Terms
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy" 
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Privacy Policy
                </a>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © {new Date().getFullYear()} {settings?.academy_name || 'Learning Academy'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}