'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../../../contexts/AuthContext'
import { coursesApi, getMediaUrl } from '../../../../../lib/api'
import { 
  Play, FileText, Link as LinkIcon, ArrowLeft, Clock, Video, 
  BookOpen, Search, Home, Bell, User, LogOut, CheckCircle, 
  PlayCircle, Calendar, ChevronRight, Sparkles, Target, 
  Award, Users, FileVideo, Headphones, Download, Share2,
  Zap, Brain, Trophy, BarChart3
} from 'lucide-react'

export default function ChapterPage() {
  const { user, isAuthLoading, logout } = useAuth()
  const { courseId, chapterId } = useParams()
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await coursesApi.getChapterSessions(chapterId as string)
        setSessions(data)
        
        // Calculate progress
        if (data.length > 0) {
          const completed = data.filter((s: { is_completed: any }) => s.is_completed).length
          setProgress(Math.round((completed / data.length) * 100))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [chapterId])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading lessons...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Modern Glass Sidebar */}
      <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
        <div className="mb-12 p-3 ">
                </div>
        <div className="flex flex-col gap-8 w-full px-5">
          <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
          <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
          <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} active/>
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
      <main className="flex-1 md:ml-28 relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.push(`/student/courses/${courseId}/learn`)}
                  className="group p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-105"
                >
                  <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-purple-300 uppercase tracking-wider">Chapter Lessons</p>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2">Chapter Lessons</h1>
                  <p className="text-purple-100/80 text-lg">Select a lesson to start learning</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Content */}
        <div className="container mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column - Lessons Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center text-white">
                    <Video size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">All Lessons</h2>
                    <p className="text-slate-600">Click on any lesson to start learning</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-purple-600">
                  {sessions.length} lessons
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl shadow-2xl shadow-purple-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center animate-float">
                    <BookOpen size={64} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">No lessons yet</h3>
                  <p className="text-slate-600 text-lg">This chapter has no content available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sessions.map((session, idx) => {
                    const zoomDate = session.scheduled_at ? new Date(session.scheduled_at) : null;
                    
                    return (
                      <div 
                        key={session.id}
                        onClick={() => router.push(`/student/courses/${courseId}/learn/${chapterId}/${session.id}`)}
                        className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden cursor-pointer hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-3 transition-all duration-500 group flex flex-col h-full"
                      >
                        {/* Session Banner */}
                        <div className="h-44 relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 overflow-hidden">
                          {session.banner ? (
                            <img 
                              src={getMediaUrl(session.banner) || ''} 
                              alt={session.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                          ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
                              session.media_type === 'zoom' ? 'bg-gradient-to-br from-blue-50 to-indigo-100' :
                              session.media_type === 'video' ? 'bg-gradient-to-br from-red-50 to-red-100' :
                              session.media_type === 'pdf' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' :
                              'bg-gradient-to-br from-emerald-50 to-emerald-100'
                            }`}>
                              {session.media_type === 'zoom' ? (
                                <>
                                  <Calendar size={48} className="text-blue-500 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
                                  {zoomDate ? (
                                    <div className="text-blue-900">
                                      <div className="text-xl font-black leading-none mb-1">
                                        {zoomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                      <div className="text-sm font-bold opacity-75">
                                        {zoomDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-blue-800 font-bold text-sm">Schedule TBD</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {session.media_type === 'video' && 
                                    <PlayCircle size={48} className="text-red-400 opacity-80 group-hover:scale-110 transition-transform" />}
                                  {session.media_type === 'pdf' && 
                                    <FileText size={48} className="text-indigo-400 opacity-80 group-hover:scale-110 transition-transform" />}
                                  {session.media_type === 'link' && 
                                    <LinkIcon size={48} className="text-emerald-400 opacity-80 group-hover:scale-110 transition-transform" />}
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Type Badge */}
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                              session.media_type === 'video' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                              session.media_type === 'zoom' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' :
                              session.media_type === 'pdf' ? 'bg-gradient-to-r from-indigo-500 to-purple-400 text-white' :
                              'bg-gradient-to-r from-emerald-500 to-green-400 text-white'
                            }`}>
                              {session.media_type === 'zoom' ? 'Live Class' : session.media_type}
                            </span>
                          </div>

                          {/* Lesson Number */}
                          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm flex items-center justify-center font-black text-slate-800 shadow-lg">
                            {idx + 1}
                          </div>

                          {/* Duration Badge */}
                          {session.media_type !== 'zoom' && session.duration_seconds && (
                            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold">
                              <Clock size={14} /> 
                              {Math.round(session.duration_seconds/60) || 15} min
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-black text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {session.title}
                          </h3>
                          
                          <div className="mb-6 flex-1">
                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                              {session.description || "Click to view lesson details."}
                            </p>
                          </div>

                          <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {session.is_completed ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                                  <CheckCircle size={16} className="text-emerald-500" />
                                  <span className="text-xs font-bold text-emerald-700">Completed</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                                  <Clock size={16} className="text-amber-500" />
                                  <span className="text-xs font-bold text-amber-700">Not Started</span>
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group-hover:scale-105 ${
                              session.is_completed 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' 
                              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white group-hover:from-purple-600 group-hover:to-pink-500'
                            }`}>
                              {session.is_completed ? (
                                <><CheckCircle size={16} /> Done</>
                              ) : (
                                <><Play size={14} fill="currentColor" /> Open</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-8">
              {/* Study Tips */}
              <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl shadow-amber-100/30 border border-white/70 backdrop-blur-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={24} className="text-amber-500" />
                  <h3 className="text-xl font-black text-slate-900">Study Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Complete lessons in order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Take notes during videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Complete all exercises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                    <span>Review weekly for retention</span>
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
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
      <span className={`text-xs font-bold mt-2 ${active ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-purple-500 to-pink-400 rounded-l-full"></div>
      )}
    </button>
  )
}