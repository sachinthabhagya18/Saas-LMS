'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi, getMediaUrl } from '../../lib/api'
import {
    BookOpen, Search, Home, Bell, User, LogOut, Filter,
    Clock, Award, Users, Star, TrendingUp, ChevronRight
} from 'lucide-react'

export default function StudentCoursesList() {
    const { user, isAuthLoading, logout } = useAuth()
    const router = useRouter()

    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login')
            return
        }

        const fetchCourses = async () => {
            try {
                setLoading(true)
                const data = await coursesApi.list()

                let courseList: any[] = []

                if (Array.isArray(data)) {
                    courseList = data
                } else if (data && Array.isArray(data.results)) {
                    courseList = data.results
                } else if (data && Array.isArray(data.data)) {
                    courseList = data.data
                }

                setCourses(courseList)
            } catch (err) {
                console.error("Failed to load courses:", err)
                setCourses([])
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchCourses()
        }
    }, [user, isAuthLoading, router])

    const filteredCourses = useMemo(() => {
        const safeCourses = Array.isArray(courses) ? courses : []

        return safeCourses.filter((course) => {
            if (!course) return false
            const searchLower = searchTerm.toLowerCase()
            const titleMatch = course.title?.toLowerCase().includes(searchLower) || false
            const descMatch = course.description?.toLowerCase().includes(searchLower) || false
            return titleMatch || descMatch
        })
    }, [courses, searchTerm])

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Loading available courses...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
            </div>

            {/* Modern Sidebar */}
            <aside className="hidden md:flex w-28 flex-col items-center py-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-200/30 fixed h-full z-40 left-0 top-0 border-r border-white/50">
                <div className="mt-12">
                </div>
                <div className="flex flex-col gap-8 w-full px-5">
                    <NavItem icon={Home} label="Dashboard" color="from-blue-500 to-cyan-400" onClick={() => router.push('/student/dashboard')} />
                    <NavItem icon={BookOpen} label="My Courses" color="from-emerald-500 to-green-400" onClick={() => router.push('/student/my-courses')} />
                    <NavItem icon={Search} label="Browse" color="from-purple-500 to-pink-400" onClick={() => router.push('/student/courses')} active/>
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
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Discover Knowledge</p>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4">Available Courses</h1>
                    <p className="text-slate-600 text-xl">
                        Explore premium courses offered by <span className="font-bold text-blue-600">{typeof window !== 'undefined' ? window.location.hostname : 'your academy'}</span>
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-gradient-to-r from-white to-blue-50/50 p-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-white/80 backdrop-blur-sm mb-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={24} />
                        <input
                            placeholder="Search courses by title, description, or instructor..."
                            className="w-full pl-12 p-4 bg-white/50 border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-500/20 outline-none text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="text-sm text-slate-400">{filteredCourses.length} courses available</span>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-2xl shadow-blue-100/30 border border-white/70 backdrop-blur-sm p-16 text-center">
                        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center animate-float">
                            <BookOpen size={64} className="text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-4">No Courses Found</h3>
                        <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
                            We couldn't find any courses matching your search. Try different keywords or browse all courses.
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105 transition-all"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => router.push(`/student/courses/${course.id}`)}
                                className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 cursor-pointer hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-3 transition-all duration-500 group overflow-hidden flex flex-col h-full"
                            >
                                {/* Course Banner */}
                                <div className="h-56 relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden">
                                    {course.banner ? (
                                        <img
                                            src={getMediaUrl(course.banner) || ''}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <BookOpen size={64} className="text-white/20 group-hover:scale-125 transition-transform duration-500" />
                                        </div>
                                    )}

                                    {/* Course Type Badge */}
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-slate-800 text-xs font-black border border-white/50 shadow-lg">
                                        {course.course_type === 'online' ? '🌐 Online' : '📚 Physical'}
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>

                                {/* Course Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-black text-xl text-slate-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
                                        {course.description || 'No description available.'}
                                    </p>

                                    {/* Course Stats */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">30h</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">250+</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star size={16} className="text-amber-500" />
                                            <span className="text-xs text-slate-500">4.8</span>
                                        </div>
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Price</span>
                                            <span className={`font-black text-xl ${course.is_free ? 'text-green-600' : 'text-blue-600'}`}>
                                                {course.is_free ? 'FREE' : `${course.currency} ${course.price}`}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-300/50 hover:scale-105 transition-all duration-300 group-hover:gap-2 flex items-center gap-1">
                                            View Details <ChevronRight size={16} />
                                        </span>
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
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-purple-500 to-pink-400 rounded-l-full"></div>
            )}
        </button>
    )
}