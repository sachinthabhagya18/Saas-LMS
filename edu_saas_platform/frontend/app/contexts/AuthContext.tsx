'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { authApi, coursesApi } from '../lib/api'
import { Enrollment, UserProfile, UserRole } from '../types'

const TOKEN_STORAGE_KEY = 'edu_saas.tokens'
const USER_STORAGE_KEY = 'edu_saas.user'

type StoredTokens = {
  access: string
  refresh: string
}

type RegisterPayload = {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  firstName?: string
  lastName?: string
}

interface EnrollCourseResponse {
  enrollment: Enrollment
  requiresPayment: boolean
  coursePrice?: number
  courseCurrency?: string
}

interface RegisterResponse {
  success: boolean
  domain?: string
}

type AuthContextType = {
  user: UserProfile | null
  accessToken: string | null
  isAuthLoading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<UserProfile>
  logout: () => void
  register: (payload: RegisterPayload) => Promise<RegisterResponse>
  enrollCourse: (courseId: string, courseData?: { price: number; is_free: boolean; currency: string }) => Promise<EnrollCourseResponse>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)

  const persistTokens = (tokens: StoredTokens | null) => {
    if (typeof window === 'undefined') return
    if (tokens) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
      localStorage.setItem('accessToken', tokens.access)
      localStorage.setItem('refreshToken', tokens.refresh)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  const persistUser = (user: UserProfile | null) => {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      console.log('🔐 Login attempt for:', identifier)
      const response = await authApi.login({ email: identifier, password })
      
      const tokens = { access: response.access, refresh: response.refresh }
      setAccessToken(tokens.access)
      persistTokens(tokens)

      const userProfile = await authApi.getCurrentUser()
      // Ensure role exists
      const safeProfile: UserProfile = {
        ...userProfile,
        role: userProfile.role || 'student'
      }
      
      setUser(safeProfile)
      persistUser(safeProfile)
      
      return safeProfile
    } catch (error) {
      console.error('Login Failed', error)
      throw error
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterResponse> => {
    try {
      // Base registration data
      const registerData: any = {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        password2: payload.confirmPassword,
        role: payload.role,
        first_name: payload.firstName,
        last_name: payload.lastName,
      }

      // FIX: Only add 'teacher_domain' if the role is 'student'.
      if (payload.role !== 'teacher') {
        // Use 'host' (includes port) instead of 'hostname' to match backend DB exactly
        const currentDomain = typeof window !== 'undefined' ? window.location.host : '';
        registerData.teacher_domain = currentDomain;
        console.log('📍 Attaching teacher domain:', currentDomain);
      }

      console.log('📝 Registering user payload:', registerData)
      const response = await authApi.register(registerData)
      
      return {
        success: true,
        domain: response.domain
      }
      
    } catch (error) {
      console.error('Registration Failed', error)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    persistTokens(null)
    persistUser(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }, [])

  const enrollCourse = useCallback(async (courseId: string) => {
    try {
      const response = await coursesApi.enroll(courseId)
      return {
        enrollment: response,
        requiresPayment: response.status === 'pending',
        coursePrice: parseFloat(response.amount || '0'),
        courseCurrency: 'LKR'
      }
    } catch (error) {
      throw error
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (storedTokens) {
        const { access } = JSON.parse(storedTokens)
        setAccessToken(access)
        try {
          const profile = await authApi.getCurrentUser()
          setUser(profile)
        } catch (e) {
          logout() // Token invalid
        }
      }
      setIsAuthLoading(false)
    }
    initAuth()
  }, [logout])

  return (
    <AuthContext.Provider value={{ 
      user, accessToken, isAuthLoading, isAuthenticated: !!user, 
      login, logout, register, enrollCourse, refreshAuth: async () => {} 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}