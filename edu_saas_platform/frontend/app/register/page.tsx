'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useAcademy } from '../contexts/AcademyContext'
import { UserPlus, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, BookOpen, Shield, GraduationCap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { settings } = useAcademy()
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const primaryColor = settings?.primary_color || '#2563eb'
  const secondaryColor = settings?.secondary_color || '#7c3aed'
  
  const primaryLight = `${primaryColor}05`
  const primaryMedium = `${primaryColor}20`
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`

  // ✅ FIX: Use CSS Variables for dynamic styling instead of invalid style props
  const pageStyles = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties

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
      await register({
        ...formData,
        role: 'student'
      })
      // Success - Redirect to login
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

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
                  className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl p-1"
                />
              ) : (
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{settings?.academy_name || 'Learning Academy'}</h2>
                <p className="text-white/80 text-sm">Join Our Community</p>
              </div>
            </div>
            
            {/* Welcome Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Start Your Learning Journey</h1>
              <p className="text-white/80">
                Create your account and unlock access to premium courses, expert instructors, and personalized learning paths.
              </p>
            </div>
            
            {/* Features List */}
            <div className="mt-12 space-y-4">
              {[
                  "Access to all beginner courses",
                  "Personalized learning dashboard",
                  "Progress tracking and certificates",
                  "Community support and forums"
              ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="md:w-3/5 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Student Account</h2>
              <p className="text-gray-600">Fill in your details to get started</p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mb-6 p-4 rounded-xl border text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626'
                }}
              >
                <Shield size={16} />
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User size={20} style={{ color: primaryColor }} />
                    </div>
                    <input 
                      required 
                      name="firstName" 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                      placeholder="John"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User size={20} style={{ color: primaryColor }} />
                    </div>
                    <input 
                      required 
                      name="lastName" 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <GraduationCap size={20} style={{ color: primaryColor }} />
                  </div>
                  <input 
                    required 
                    name="username" 
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="johndoe123"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail size={20} style={{ color: primaryColor }} />
                  </div>
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
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
                    name="password" 
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock size={20} style={{ color: primaryColor }} />
                  </div>
                  <input 
                    required 
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword" 
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder-gray-400 hover:border-gray-300"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ color: primaryColor }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  required
                  className="mt-1 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 text-[var(--primary)]"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a 
                    href="/terms" 
                    className="font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a 
                    href="/privacy" 
                    className="font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Privacy Policy
                  </a>
                </label>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create Account
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
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <a 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border-2 hover:shadow-sm transition-all duration-300"
                style={{ 
                  borderColor: primaryMedium,
                  color: primaryColor,
                  backgroundColor: primaryLight
                }}
              >
                <ArrowRight size={18} className="rotate-180" />
                Sign In to Existing Account
              </a>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <a 
                  href="/contact" 
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Contact Support
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