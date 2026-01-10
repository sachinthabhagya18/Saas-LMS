'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi, paymentsApi, getMediaUrl } from '../../lib/api'
import { processPayHerePayment } from '../../lib/payhere'
import {
  Home, BookOpen, Bell, User, LogOut, Search, PlayCircle, Zap,
  Clock, Users, Award, ChevronRight, Sparkles, Target
} from 'lucide-react'

export default function MyCoursesPage() {
  const { user, isAuthLoading, logout } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading,] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login')
      return
    }
    if (user) fetchData()
  }, [user, isAuthLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await coursesApi.getMyEnrollments()
      const list = Array.isArray(data) ? data : (data.results || [])
      setEnrollments(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true)
      const data = await coursesApi.getMyEnrollments()
      const list = Array.isArray(data) ? data : (data.results || [])
      setEnrollments(list)
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePay = async (enrollmentId: string) => {
    try {
      const params = await paymentsApi.initPayHerePayment(enrollmentId);
      processPayHerePayment(params);
    } catch (err) {
      alert("Payment initialization failed");
    }
  }

  const visibleEnrollments = enrollments.filter(enrollment => {
      const isPaid = enrollment.status === 'paid'
      const isFree = enrollment.course_is_free
      const hasSlip = enrollment.has_pending_approval === true // Requires backend update
      
      return isPaid || isFree || hasSlip
  })

  // const filteredEnrollments = enrollments.filter(e => 
  //   e.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  // )

  if (isAuthLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading your courses...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Sidebar */}
      <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-emerald-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
           <div className="mb-12 p-3 ">
                </div>
        <div className="flex flex-col gap-8 w-full px-5">
          <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
          <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} active/>
          <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} />
          <NavItem icon={Bell} label="Notifications" color="from-orange-500 to-amber-400" onClick={() => router.push('/student/notifications')} />
          <NavItem icon={User} label="Profile" color="from-yellow-500 to-orange-400" onClick={() => router.push('/student/profile')} />
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
      <main className="flex-1 md:ml-28 p-8 max-w-[1800px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Learning Journey</p>
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-2">My Courses</h1>
            <p className="text-slate-600 text-xl">
              Continue your learning adventure with enrolled courses
            </p>
          </div>
          
          <div className="mt-6 md:mt-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={22} />
              <input 
                className="pl-12 pr-4 py-3 bg-white/50 border border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none text-lg font-medium w-full md:w-80"
                placeholder="Search my courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats */}

        {loading ? (
          <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-2xl shadow-blue-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-600 font-medium">Loading your courses...</p>
          </div>
        ) : visibleEnrollments.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-2xl shadow-emerald-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center animate-float">
              <BookOpen size={64} className="text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No Courses Found</h3>
            <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
              You haven't enrolled in any courses yet. Start your learning journey by exploring available courses.
            </p>
            <button 
              onClick={() => router.push('/student/courses')}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-emerald-300/50 hover:scale-105 transition-all text-lg"
            >
              <Sparkles size={20} className="inline mr-2" />
              Discover Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden group hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-3 transition-all duration-500">
                {/* Banner */}
                <div className="h-52 relative bg-gradient-to-br from-green-500/20 to-teal-600/20 overflow-hidden">
                  {enrollment.course_banner ? (
                    <img 
                      src={getMediaUrl(enrollment.course_banner) || ''} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <BookOpen size={64} className="text-white/20 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                  )}
                  <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg ${
                    enrollment.status === 'paid' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}>
                    {enrollment.status === 'paid' ? '✅ Active' : '⏳ Pending'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="text-xs text-slate-400 font-bold mb-2 block">
                      Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                    <h4 className="font-black text-xl text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {enrollment.course_title}
                    </h4>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                        {enrollment.course_is_free ? '🎯 Free Course' : '💰 Paid Course'}
                      </span>
                      {enrollment.status === 'paid' ? (
                        <button 
                          onClick={() => router.push(`/student/courses/${enrollment.course}/learn`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-300/50 hover:scale-105 transition-all duration-300 font-bold"
                        >
                          <PlayCircle size={18} /> Continue
                        </button>
                      ) : (
                        <button 
                          onClick={() => router.push(`/student/courses/${enrollment.course}`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-300/50 hover:scale-105 transition-all duration-300 font-bold"
                        >
                          <Zap size={18} /> Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
      <span className={`text-xs font-bold mt-2 ${active ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-emerald-500 to-green-400 rounded-l-full"></div>
      )}
    </button>
  )
}