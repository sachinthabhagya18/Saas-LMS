'use client'

import StudentFooter from '../components/StudentFooter'
import StudentHeader from '../components/StudentHeader'
import { useAcademy } from '../contexts/AcademyContext'
StudentFooter
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings, loading } = useAcademy()

  // Inline styles to inject the dynamic colors from DB into CSS variables
  const themeStyles = {
    '--primary': settings.primary_color,
    '--secondary': settings.secondary_color,
  } as React.CSSProperties

  return (
    <div style={themeStyles} className="min-h-screen bg-gray-50 selection:bg-[var(--primary)] selection:text-white">
      {/* Custom Header */}
      {/* <StudentHeader /> */}
      
      {/* Main Content */}
      <main className="animate-in fade-in duration-500">
        {children}
      </main>

      <StudentFooter/>
    </div>
  )
}