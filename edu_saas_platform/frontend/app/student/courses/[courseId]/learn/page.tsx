'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { coursesApi, getMediaUrl } from '../../../../lib/api'
import { 
  PlayCircle, BookOpen, Search, Home, Bell, User, LogOut, 
  ChevronRight, Clock, CheckCircle, BarChart3, Target, 
  Brain, Award, Sparkles, Video, FileText, FileVideo, 
  Zap, Users, Star, GraduationCap, FolderOpen, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'

export default function CourseLearnPage() {
  const { user, isAuthLoading, logout } = useAuth()
  const { courseId } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [c, ch] = await Promise.all([
          coursesApi.get(courseId as string),
          coursesApi.getCourseChapters(courseId as string)
        ])
        setCourse(c)
        setChapters(ch)
        
        // Calculate progress (mock data)
        if (ch.length > 0) {
          const completed = ch.filter((ch: { completed: any }) => ch.completed).length
          setProgress(Math.round((completed / ch.length) * 100))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading course content...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Glass Sidebar */}
      <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
        <div className="mb-12 p-3 ">
                </div>
        <div className="flex flex-col gap-8 w-full px-5">
          <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
          <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
          <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} />
          <NavItem icon={Bell} label="Notifications" color="from-orange-500 to-amber-400" onClick={() => router.push('/student/notifications')} />
          <NavItem icon={User} label="Profile" color="from-yellow-500 to-orange-400" onClick={() => router.push('/student/profile')}/>
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
      <main className="flex-1 md:ml-28 relative ">
        {/* Top Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-900/90 to-slate-900 text-white relative overflow-hidden">
          {course.banner && (
            <div className="absolute inset-0 w-full">
              <img 
                src={getMediaUrl(course.banner) || ''} 
                alt="" 
                className="w-full h-full object-cover opacity-20 blur-sm scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90"></div>
            </div>
          )}
          
          {/* Animated Elements */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

          <div className="relative container mx-auto max-w-12xl py-12 px-3">
            {/* Back Button */}
            <button 
              onClick={() => router.push('/student/my-courses')}
              className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to My Courses</span>
            </button>

            {/* Course Info */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Active Course</p>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-2xl">
                  {course.title}
                </h1>
                
                <p className="text-xl text-emerald-100/80 mb-6 max-w-3xl leading-relaxed drop-shadow-lg">
                  {course.description}
                </p>

              
              </div>

              {/* Course Stats */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl shadow-emerald-900/30 min-w-[280px]">
                <h3 className="text-lg font-black text-white mb-6">Course Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <FolderOpen size={20} className="text-emerald-300" />
                      </div>
                      <span className="text-emerald-100">Modules</span>
                    </div>
                    <span className="text-xl font-black text-white">{chapters.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Clock size={20} className="text-blue-300" />
                      </div>
                      <span className="text-emerald-100">Duration</span>
                    </div>
                    <span className="text-xl font-black text-white">30h</span>
                  </div>
                  
                
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-10xl px-3 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column - Chapters */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Course Modules</h2>
                    <p className="text-slate-600">Complete all modules to finish the course</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  {chapters.length} chapters
                </div>
              </div>

              {/* Chapters Grid */}
              {chapters.length === 0 ? (
                <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-2xl shadow-emerald-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center animate-float">
                    <BookOpen size={64} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">No Chapters Available Yet</h3>
                  <p className="text-slate-600 text-lg">Course content will be added soon by your instructor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      onClick={() => router.push(`/student/courses/${courseId}/learn/${chapter.id}`)}
                      className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden cursor-pointer hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-3 transition-all duration-500 group"
                    >
                      {/* Chapter Banner */}
                      <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-green-600/10 relative overflow-hidden">
                        {chapter.banner ? (
                          <img
                            src={getMediaUrl(chapter.banner) || ''}
                            alt={chapter.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <div className="text-center">
                              <BookOpen size={48} className="text-white/30 group-hover:scale-125 transition-transform duration-500 mx-auto mb-2" />
                              <div className="text-white/40 text-sm font-bold">Chapter {index + 1}</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-green-400 text-white text-xs px-3 py-1.5 rounded-full font-black shadow-lg">
                          Chapter {index + 1}
                        </div>
                        
                        {chapter.completed && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-lg">
                            <CheckCircle size={20} />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      {/* Chapter Content */}
                      <div className="p-6">
                        <h3 className="font-black text-xl text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {chapter.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-slate-400" />
                            <span className="text-xs text-slate-500">5 videos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-slate-400" />
                            <span className="text-xs text-slate-500">3 notes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-xs text-slate-500">2h 30m</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                          <div>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                              {chapter.completed ? '✅ Completed' : '📚 In Progress'}
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                            <PlayCircle size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-8">

              {/* Course Tips */}
              <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl shadow-amber-100/30 border border-white/70 backdrop-blur-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={24} className="text-amber-500" />
                  <h3 className="text-xl font-black text-slate-900">Study Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Complete one module per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Take notes during video lessons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Practice with provided exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Join discussions for better understanding</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
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
      <span className={`text-xs font-bold mt-2 ${active ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-emerald-500 to-green-400 rounded-l-full"></div>
      )}
    </button>
  )
}