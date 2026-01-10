'use client'

import { usePathname } from 'next/navigation'
import { useAcademy } from '../contexts/AcademyContext'
import { getMediaUrl } from '../lib/api'

export default function StudentFooter() {
  const { settings, loading } = useAcademy()
  const pathname = usePathname()

  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) return null
  if (loading) return null

  return (
    <footer className="py-6 border-t border-slate-100 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-2">
            {settings.logo ? (
              <img 
                src={getMediaUrl(settings.logo) || ''} 
                alt={`${settings.academy_name} Logo`} 
                className="h-6 w-auto object-contain"
              />
            ) : (
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {settings.academy_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-slate-700">
              {settings.academy_name}
            </span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} All rights reserved
          </div>
          
        </div>
      </div>
    </footer>
  )
}