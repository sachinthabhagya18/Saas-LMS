'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useAcademy } from '../contexts/AcademyContext'
import { getMediaUrl } from '../lib/api'
import { Menu, X, LogOut, LayoutDashboard, Home, Image, MessageSquare, User, BookOpen } from 'lucide-react'
import { useState } from 'react'

export default function StudentHeader() {
  const { user, logout } = useAuth()
  const { settings } = useAcademy()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Hide on admin/teacher routes to prevent double headers
  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) return null

  const dashboardLink = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  // Use backend colors with fallback
  const primaryColor = settings.primary_color || '#3b82f6' // blue-500 as fallback
  const secondaryColor = settings.secondary_color || '#8b5cf6' // purple-500 as fallback

  return (
    <header 
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300"
      style={{
        '--primary': primaryColor,
        '--secondary': secondaryColor,
      } as React.CSSProperties}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          {settings.logo ? (
            <img 
              src={getMediaUrl(settings.logo) || ''} 
              alt={`${settings.academy_name} Logo`} 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                const parent = (e.target as HTMLElement).parentElement
                if (parent) {
                  const fallback = document.createElement('div')
                  fallback.className = "h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                  fallback.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                  fallback.textContent = settings.academy_name.charAt(0).toUpperCase()
                  parent.appendChild(fallback)
                }
              }}
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              {settings.academy_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-xl text-slate-900 group-hover:text-[var(--primary)] transition-colors">
            {settings.academy_name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: 'Home', path: '/', icon: Home },
            { name: 'Gallery', path: '/gallery', icon: Image },
            { name: 'Contact', path: '/contact', icon: MessageSquare },
          ].map((item) => {
             const isActive = pathname === item.path
             const Icon = item.icon
             return (
                <Link 
                    key={item.name} 
                    href={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-all hover:text-[var(--primary)] group ${
                        isActive ? 'text-[var(--primary)] font-bold' : 'text-slate-600'
                    }`}
                >
                    <Icon size={16} className={`group-hover:text-[var(--primary)] transition-colors ${
                      isActive ? 'text-[var(--primary)]' : 'text-slate-400'
                    }`} />
                    {item.name}
                </Link>
             )
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-4">
                <Link 
                    href={dashboardLink}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      boxShadow: `0 10px 15px -3px ${primaryColor}40`
                    }}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button 
                    onClick={logout} 
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition"
                    title="Log Out"
                >
                    <LogOut size={20} />
                </button>
             </div>
          ) : (
             <>
                <Link 
                  href="/login" 
                  className="font-medium text-slate-600 hover:text-[var(--primary)] px-4 py-2.5 transition-colors"
                >
                    Login
                </Link>
                <Link 
                    href="/register"
                    className="px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      color: 'white',
                      boxShadow: `0 4px 6px -1px ${primaryColor}30`
                    }}
                >
                    Join Now
                </Link>
             </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-slate-700 p-2" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{ color: primaryColor }}
        >
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl animate-in slide-in-from-top-5">
           <nav className="flex flex-col gap-3">
              {[
                { name: 'Home', path: '/', icon: Home },
                { name: 'Gallery', path: '/gallery', icon: Image },
                { name: 'Contact', path: '/contact', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.name} 
                    href={item.path}
                    className="flex items-center gap-3 text-lg font-medium text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                    style={{ 
                      color: pathname === item.path ? primaryColor : ''
                    }}
                  >
                    <Icon size={20} style={{ 
                      color: pathname === item.path ? primaryColor : '#64748b'
                    }} />
                    {item.name}
                    {pathname === item.path && (
                      <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    )}
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  {user ? (
                      <>
                        <Link 
                          href={dashboardLink} 
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 10px 15px -3px ${primaryColor}40`
                          }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <LayoutDashboard size={20} />
                          Go to Dashboard
                        </Link>
                        <button 
                          onClick={() => {
                            logout()
                            setIsMobileOpen(false)
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          <LogOut size={20} />
                          Log Out
                        </button>
                      </>
                  ) : (
                      <>
                        <Link 
                          href="/login" 
                          className="w-full text-center py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                          onClick={() => setIsMobileOpen(false)}
                        >
                            Login
                        </Link>
                        <Link 
                          href="/register" 
                          className="w-full text-center py-3 rounded-xl font-bold text-white shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            boxShadow: `0 4px 6px -1px ${primaryColor}30`
                          }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                            Register
                        </Link>
                      </>
                  )}
              </div>
           </nav>
        </div>
      )}

      {/* Inline style for CSS variables */}
      <style jsx global>{`
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
        }
      `}</style>
    </header>
  )
}