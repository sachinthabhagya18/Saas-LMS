'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  DollarSign, // ✅ Import DollarSign
  Bell
} from 'lucide-react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== 'teacher') {
        router.push('/login')
      }
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading || !user) return <div className="h-screen flex items-center justify-center">Loading...</div>

 const navItems = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/teacher/courses', icon: BookOpen },
    { label: 'Enrollments', href: '/teacher/enrollments', icon: Users },
    { label: 'Payments', href: '/teacher/payments', icon: DollarSign },
    { label: 'Students', href: '/teacher/students', icon: Users },
    { label: 'Notification', href: '/teacher/notifications', icon: Bell },
    { label: 'Settings', href: '/teacher/settings', icon: Settings },
]

  const displayName = user.first_name ? `${user.first_name}'s Academy` : `${user.username}'s Academy`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate" title={displayName}>
            {displayName}
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 mb-4">
             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Logged in as</p>
             <p className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</p>
             <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 lg:hidden flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800 truncate">{displayName}</span>
          <div className="w-8" /> 
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}