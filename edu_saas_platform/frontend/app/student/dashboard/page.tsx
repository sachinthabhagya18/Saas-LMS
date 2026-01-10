'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi, paymentsApi, getMediaUrl, notificationsApi } from '../../lib/api'
import { processPayHerePayment } from '../../lib/payhere'
import {
    Home, BookOpen, Bell, BarChart2, User, LogOut, Zap,
    Clock, Truck, MoreVertical, PlayCircle, Search,
    ChevronRight, Sparkles, Target, Brain, Award, Rocket,
    TrendingUp, Shield, Calendar, Users, Activity, Download
} from 'lucide-react'

export default function StudentDashboard() {
    const { user, isAuthLoading, logout } = useAuth()
    const router = useRouter()
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [notices, setNotices] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login')
            return
        }

        if (user) {
            fetchData()
        }
    }, [user, isAuthLoading, router])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [enrollData, noticeData] = await Promise.all([
                coursesApi.getMyEnrollments(),
                notificationsApi.getNotices()
            ])
            const enrollmentList = Array.isArray(enrollData) ? enrollData : (enrollData.results || [])
            setEnrollments(enrollmentList)
            setNotices(Array.isArray(noticeData) ? noticeData : (noticeData.results || []))
        } catch (error) {
            console.error("Failed to load dashboard", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePay = async (enrollmentId: string) => {
        try {
            const params = await paymentsApi.initPayHerePayment(enrollmentId)
            processPayHerePayment(params)
        } catch (err) {
            alert("Failed to initialize payment")
        }
    }

    if (isAuthLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans overflow-hidden">

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-10 right-1/3 w-48 h-48 bg-cyan-200/15 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50 overflow-y-auto scrollbar-hide">
                <div className="mb-12 p-3 ">
                </div>
                <div className="flex flex-col gap-8 w-full px-5">
                    <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} active />
                    <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
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

            <main className="flex-1 md:ml-28 p-6 md:p-10 max-w-[1800px] mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Welcome back</p>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 flex flex-wrap items-center gap-3">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {greeting}
                            </span>
                            <span className="animate-wave inline-block">👋</span>
                            <span className="text-slate-800">{user?.first_name || user?.username}!</span>
                        </h1>
                        <p className="text-slate-500 text-lg mt-2 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-500" />
                            Let's continue your learning journey today.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                            <Rocket size={18} />
                            Institute : Online
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-white/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-200/70 transition-all duration-500 hover:-translate-y-1 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Student ID</p>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{user?.student_id || 'Generating...'}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex items-center justify-center font-black text-white text-xl">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-100/50 flex items-center gap-2">
                            <Target size={14} className="text-blue-500" />
                            <p className="text-xs text-slate-500">Active Student</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white">
                                        <BookOpen size={24} />
                                    </div>
                                    My Active Courses
                                </h2>
                                <button
                                    onClick={() => router.push('/student/courses')}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                                >
                                    Browse All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {enrollments.length === 0 ? (
                                <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-10 text-center border-2 border-dashed border-emerald-200/50 hover:border-emerald-300/70 transition-all duration-300 group">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BookOpen size={48} className="text-emerald-400" />
                                    </div>
                                    <p className="text-slate-600 text-lg mb-4">You haven't enrolled in any courses yet.</p>
                                    <button
                                        onClick={() => router.push('/student/courses')}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-green-300/50 hover:scale-105 transition-all duration-300"
                                    >
                                        Discover Courses
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/80 overflow-hidden group hover:shadow-2xl hover:shadow-slate-300/70 hover:-translate-y-2 transition-all duration-500">
                                            <div className="h-40 relative bg-gradient-to-r from-blue-500/20 to-purple-500/20 overflow-hidden">
                                                {enrollment.course_banner ? (
                                                    <img src={getMediaUrl(enrollment.course_banner) || ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                                        <BookOpen size={48} className="text-white/30" />
                                                    </div>
                                                )}
                                                <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black uppercase shadow-lg ${enrollment.status === 'paid' ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}`}>
                                                    {enrollment.status}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            </div>

                                            <div className="p-6">
                                                <h4 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{enrollment.course_title}</h4>
                                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{enrollment.course_description || 'No description available'}</p>
                                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                                                        {enrollment.course_is_free ? '🎯 Free Course' : '💰 Paid Course'}
                                                    </span>
                                                    {enrollment.status === 'paid' ? (
                                                        <button
                                                            onClick={() => router.push(`/student/courses/${enrollment.course}/learn`)}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-300/50 hover:scale-105 transition-all duration-300 font-bold"
                                                        >
                                                            <PlayCircle size={16} /> Continue
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePay(enrollment.id)}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-300/50 hover:scale-105 transition-all duration-300 font-bold"
                                                        >
                                                            <Zap size={16} /> Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Notices */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl shadow-2xl shadow-orange-100/30 border border-white/70 backdrop-blur-sm p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
                            <div className="flex justify-between items-center mb-8 border-b border-orange-100/50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white">
                                        <Bell size={22} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Notices</h3>
                                </div>
                                <button
                                    onClick={() => router.push('/student/notifications')}
                                    className="text-sm font-bold text-orange-600 hover:text-orange-800 hover:scale-105 transition-all"
                                >
                                    View All →
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                                {notices.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center">
                                            <Bell size={32} className="text-orange-300" />
                                        </div>
                                        <p className="text-slate-400">No new notices.</p>
                                    </div>
                                ) : (
                                    notices.map((notice) => (
                                        <div
                                            key={notice.id}
                                            className="group bg-gradient-to-br from-white to-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200/70 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
                                            onClick={() => router.push('/student/notifications')}
                                        >
                                            {/* Notice Image */}
                                            {notice.image && (
                                                <div className="h-36 w-full overflow-hidden bg-gradient-to-r from-blue-200/30 to-purple-200/30">
                                                    <img
                                                        src={getMediaUrl(notice.image) || ''}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        alt="Notice"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                </div>
                                            )}

                                            <div className="p-5">
                                                <div className="flex items-start gap-3 mb-3">
                                                    {notice.is_important && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black rounded-full">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                            IMPORTANT
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className={`text-base font-black leading-tight ${notice.is_important ? 'text-red-700' : 'text-slate-800'}`}>
                                                            {notice.title}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">{notice.message}</p>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        📅 {new Date(notice.created_at).toLocaleDateString()}
                                                    </p>
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-orange-200 group-hover:to-amber-200 transition-all">
                                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add custom animations */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
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
            className={`p-4 rounded-2xl transition-all duration-500 w-full flex flex-col items-center group relative ${active ? 'bg-gradient-to-br from-white to-slate-100 shadow-lg shadow-slate-200/50' : 'hover:bg-white/60'
                }`}
            title={label}
        >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon size={26} strokeWidth={2.5} />
            </div>
            <span className={`text-xs font-bold mt-2 ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                {label}
            </span>
            {active && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-l-full"></div>
            )}
        </button>
    )
}