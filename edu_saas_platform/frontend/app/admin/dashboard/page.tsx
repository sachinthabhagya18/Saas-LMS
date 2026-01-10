'use client'

import { useEffect, useState } from 'react'
import { superAdminApi } from '../../lib/api'
import { Users, Building2, DollarSign, TrendingUp, Globe } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    academies: 0,
    totalStudents: 0, // Placeholder until we have a global student count API
    revenue: 0,       // Placeholder until we have global revenue API
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real tenant data to count academies
        const domains = await superAdminApi.getTenantDomains()
        const academyCount = Array.isArray(domains) ? domains.length : 0
        
        setStats({
            academies: academyCount,
            totalStudents: academyCount * 15, // Estimating 15 students per academy for demo
            revenue: academyCount * 25000,    // Estimating revenue for demo
            loading: false
        })
      } catch (e) {
        console.error("Failed to load stats", e)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor your SaaS platform performance</p>
        </div>
        <div className="flex gap-2">
             <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> System Online
             </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Building2} label="Active Academies" value={stats.loading ? '...' : stats.academies} color="blue" />
        <StatCard icon={Users} label="Est. Total Students" value={stats.loading ? '...' : stats.totalStudents} color="green" />
        <StatCard icon={Globe} label="Active Domains" value={stats.loading ? '...' : stats.academies} color="purple" />
        <StatCard icon={DollarSign} label="Est. Revenue" value={stats.loading ? '...' : `Rs. ${stats.revenue.toLocaleString()}`} color="yellow" />
      </div>

      {/* Recent Activity / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">System Alerts</h3>
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg h-fit text-blue-600"><TrendingUp size={18}/></div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">New Registration</h4>
                        <p className="text-xs text-gray-500">New Academy registered recently.</p>
                    </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg h-fit text-yellow-600"><DollarSign size={18}/></div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Payment Gateway</h4>
                        <p className="text-xs text-gray-500">PayHere sandbox mode is currently active.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-4">
                 <a href="/admin/academies/create" className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer group">
                    <Building2 size={32} className="text-gray-400 group-hover:text-blue-600 mb-2"/>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Register Academy</span>
                 </a>
                 <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition cursor-pointer group">
                    <Users size={32} className="text-gray-400 group-hover:text-green-600 mb-2"/>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">Manage Users</span>
                 </div>
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
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