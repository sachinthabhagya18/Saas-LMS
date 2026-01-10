'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notificationsApi, getMediaUrl } from '../../lib/api'
import {
    Megaphone, CheckCircle, Clock, AlertCircle, Calendar,
    Home, BookOpen, Bell, User, LogOut, Search,
    ChevronRight, Sparkles, Target, Filter
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentNotificationsPage() {
    const [activeTab, setActiveTab] = useState('notices')
    const [notices, setNotices] = useState<any[]>([])
    const { user, logout, isAuthLoading } = useAuth()
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login')
            return
        }

        loadData()
    }, [user, isAuthLoading, router])

    const loadData = async () => {
        setLoading(true)
        try {
            const [noticesData, notificationsData] = await Promise.all([
                notificationsApi.getNotices(),
                notificationsApi.getNotifications()
            ])

            setNotices(Array.isArray(noticesData) ? noticesData : noticesData.results || [])
            setNotifications(Array.isArray(notificationsData) ? notificationsData : notificationsData.results || [])
        } catch (e) {
            console.error("Failed to load notifications", e)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkRead = async (id: string) => {
        try {
            await notificationsApi.markRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
        } catch (e) { console.error(e) }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
        } catch (e) { console.error(e) }
    }

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Loading notifications...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-orange-300/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl"></div>
            </div>

            {/* Modern Sidebar */}
            <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-orange-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
                <div className="mb-12 p-3 ">
                </div>
                <div className="flex flex-col gap-8 w-full px-5">
                    <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
                    <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
                    <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} />
                    <NavItem icon={Bell} label="Notifications" color="from-orange-500 to-amber-400" onClick={() => router.push('/student/notifications')} active />
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
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stay Updated</p>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-2">Notifications Center</h1>
                    <p className="text-slate-600 text-xl">
                        Important updates, announcements, and your learning activity
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-10 mb-12 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`pb-6 text-lg font-bold flex items-center gap-3 transition-all relative ${activeTab === 'notices' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className={`p-3 rounded-xl ${activeTab === 'notices' ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Megaphone size={24} />
                        </div>
                        Announcements
                        {activeTab === 'notices' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-t-full"></div>}
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('personal')}
                        className={`pb-6 text-lg font-bold flex items-center gap-3 transition-all relative ${activeTab === 'personal' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className={`p-3 rounded-xl ${activeTab === 'personal' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Bell size={24} />
                        </div>
                        My Activity
                        {notifications.some(n => n.status === 'unread') && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        {activeTab === 'personal' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-full"></div>}
                    </button> */}
                </div>

                {/* Content: Announcements */}
                {activeTab === 'notices' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {notices.length === 0 ? (
                            <div className="col-span-full bg-gradient-to-br from-white to-orange-50/50 rounded-3xl shadow-2xl shadow-orange-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
                                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center animate-float">
                                    <Megaphone size={64} className="text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-4">No Announcements Yet</h3>
                                <p className="text-slate-600 text-lg">Check back later for important updates from your instructors.</p>
                            </div>
                        ) : (
                            notices.map(notice => (
                                <div key={notice.id} className={`bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-3 transition-all duration-500 group overflow-hidden ${notice.is_important ? 'border-l-4 border-l-red-500' : ''}`}>
                                    {/* Header */}
                                    <div className="p-6 pb-4 flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${notice.is_important ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-400 text-white'}`}>
                                            <Megaphone size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-black text-slate-900 leading-tight truncate mb-2">
                                                {notice.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium flex-wrap">
                                                <span className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(notice.created_at).toLocaleDateString()}
                                                </span>
                                                {notice.is_important && (
                                                    <>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">
                                                            IMPORTANT
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    {notice.image && (
                                        <div className="w-full bg-slate-100 relative group cursor-pointer overflow-hidden">
                                            <img
                                                src={getMediaUrl(notice.image) || ''}
                                                alt={notice.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="p-6 pt-4">
                                        <p className="text-slate-700 text-base leading-relaxed line-clamp-4">
                                            {notice.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-6">
                                            <div className="text-xs text-slate-400 font-bold">
                                                📢 Academy Announcement
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Content: Personal Notifications */}
                {activeTab === 'personal' && (
                    <div className="max-w-10xl mx-auto">
                        {/* Header Actions */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Your Activity</h3>
                                <p className="text-slate-600">
                                    {notifications.filter(n => n.status === 'unread').length} unread notifications
                                </p>
                            </div>
                            {/* <button
                                onClick={handleMarkAllRead}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105 transition-all"
                            >
                                Mark All as Read
                            </button> */}
                        </div>

                        {/* Notifications List */}
                        {notifications.length === 0 ? (
                            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl shadow-blue-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
                                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center animate-float">
                                    <Bell size={64} className="text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-4">No Activity Yet</h3>
                                <p className="text-slate-600 text-lg">Your learning activity will appear here once you start engaging with courses.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/80 p-6 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-slate-300/70 hover:-translate-y-1 ${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                                        onClick={() => handleMarkRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-5">
                                            {/* Icon */}
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${notification.notification_type === 'payment_success' ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                                                notification.notification_type === 'course_enrollment' ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                                                    'bg-gradient-to-r from-blue-500 to-cyan-400'
                                                } text-white`}>
                                                {notification.notification_type === 'payment_success' ? <CheckCircle size={28} /> :
                                                    notification.notification_type === 'course_enrollment' ? <BookOpen size={28} /> :
                                                        <AlertCircle size={28} />
                                                }
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className={`text-lg font-black ${notification.status === 'unread' ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-sm text-slate-400 whitespace-nowrap ml-2">
                                                        {notification.time_ago} ago
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed mb-4">
                                                    {notification.message}
                                                </p>

                                                {notification.action_url && (
                                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 group">
                                                        View Details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Unread Indicator */}
                                            {notification.status === 'unread' && (
                                                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-2 shrink-0 animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
            className={`p-4 rounded-2xl transition-all duration-500 w-full flex flex-col items-center group relative ${active ? 'bg-gradient-to-br from-white to-slate-100 shadow-lg shadow-slate-200/50' : 'hover:bg-white/60'
                }`}
            title={label}
        >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon size={26} strokeWidth={2.5} />
            </div>
            <span className={`text-xs font-bold mt-2 ${active ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                {label}
            </span>
            {active && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-orange-500 to-amber-400 rounded-l-full"></div>
            )}
        </button>
    )
}