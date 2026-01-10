'use client'

import { useEffect, useState } from 'react'
import { coursesApi } from '../../lib/api'
import { Users, BookOpen, DollarSign, TrendingUp, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    loading: true
  })
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [recentStudents, setRecentStudents] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch All Enrollments (Source of Truth for Sales)
        const enrollmentsData = await coursesApi.getMyEnrollments()
        const allEnrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData.results || [])
        
        // ✅ FILTER: Only Paid/Active Enrollments
        // This removes any "pending" payments or slip uploads waiting for approval
        const activeEnrollments = allEnrollments.filter((e: any) => e.status === 'paid')

        // 2. Fetch Courses
        const coursesData = await coursesApi.list()
        const allCourses = Array.isArray(coursesData) ? coursesData : (coursesData.results || [])

        // 3. Calculate Stats
        // Revenue from active enrollments only
        const revenue = activeEnrollments.reduce((acc: number, curr: any) => {
           return acc + (parseFloat(curr.amount) || 0)
        }, 0)

        // Unique Active Students (Count distinct student IDs in paid enrollments)
        const uniqueStudentIds = new Set(activeEnrollments.map((e: any) => e.student))

        // 4. Prepare Recent Students List (From Active Enrollments)
        const processedStudents: any[] = []
        const seenIds = new Set()
        
        // Loop through paid enrollments to build student list
        for (const env of activeEnrollments) {
            if (!seenIds.has(env.student)) {
                seenIds.add(env.student)
                processedStudents.push({
                    id: env.student,
                    name: env.student_name || env.student_username,
                    email: env.student_email,
                    username: env.student_username,
                    joined_at: env.enrolled_at // Use enrollment date as 'Recent Activity'
                })
            }
            if (processedStudents.length >= 5) break
        }

        // 5. Prepare Recent Courses with Active Count
        // We recalculate the count here to ensure it only reflects paid students
        const processedCourses = allCourses.slice(0, 5).map((course: any) => {
            const activeCount = activeEnrollments.filter((e: any) => e.course === course.id).length
            return {
                ...course,
                active_count: activeCount
            }
        })

        setStats({
          totalCourses: allCourses.length,
          totalStudents: uniqueStudentIds.size,
          totalRevenue: revenue,
          loading: false
        })

        setRecentCourses(processedCourses)
        setRecentStudents(processedStudents)

      } catch (e) {
        console.error("Failed to load dashboard data", e)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    loadData()
  }, [])

  if (stats.loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Instructor</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={BookOpen} 
          label="Total Courses" 
          value={stats.totalCourses} 
          color="blue" 
        />
        <StatCard 
          icon={Users} 
          label="Active Students" 
          value={stats.totalStudents} 
          color="green" 
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`LKR ${stats.totalRevenue.toLocaleString()}`} 
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Courses</h2>
            <Link href="/teacher/courses" className="text-blue-600 text-sm hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Active Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCourses.length === 0 ? (
                   <tr><td colSpan={3} className="p-6 text-center text-gray-500">No courses created yet.</td></tr>
                ) : (
                  recentCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]">{course.title}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {course.is_free ? <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Free</span> : `LKR ${course.price}`}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {/* ✅ Show only active/paid count */}
                          {course.active_count}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Students Table (ACTIVE ONLY) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Active Students</h2>
            <Link href="/teacher/enrollments" className="text-blue-600 text-sm hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentStudents.length === 0 ? (
                   <tr><td colSpan={3} className="p-6 text-center text-gray-500">No active students yet.</td></tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                              {(student.name?.[0] || student.username?.[0] || '?').toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{student.email}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(student.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}