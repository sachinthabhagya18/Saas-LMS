'use client'

import { useState, useEffect, useMemo } from 'react'
import { superAdminApi } from '../../lib/api'
import { Search, DollarSign, TrendingUp, BookOpen, Users, Filter, Download, LayoutList, Building2, Calendar, Percent } from 'lucide-react'

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('all')
  
  const [viewMode, setViewMode] = useState<'courses' | 'academies'>('courses')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  
  // ✅ NEW: Commission Rate State
  const [commissionRate, setCommissionRate] = useState(10) // Default 10%

  useEffect(() => {
    loadData()
  }, [selectedMonth]) 

  const loadData = async () => {
    setLoading(true)
    try {
      // ✅ Now passes the selected month to the API
      const response = await superAdminApi.getRevenueReport(selectedMonth)
      setData(response)
    } catch (e) {
      console.error("Failed to load revenue", e)
    } finally {
      setLoading(false)
    }
  }

  const stats = data?.stats || { total_revenue: 0, total_sales: 0, total_courses: 0, top_teacher: 'N/A' }
  const details = data?.details || []

  // --- ACADEMY SUMMARY LOGIC ---
  const academySummary = useMemo(() => {
    const summary: any[] = []
    if (!Array.isArray(details)) return []

    details.forEach((item: any) => {
        let existing = summary.find((a) => a.tenant_name === item.tenant_name)
        if (!existing) {
            existing = {
                tenant_name: item.tenant_name,
                owner_email: item.owner_email,
                total_courses: 0,
                total_sales: 0,
                total_revenue: 0
            }
            summary.push(existing)
        }
        existing.total_courses += 1
        existing.total_sales += item.sales_count
        existing.total_revenue += item.revenue
    })
    return summary
  }, [details])

  const teachers = Array.from(new Set(details.map((item: any) => item.tenant_name)))

  const filteredCourses = details.filter((item: any) => {
      const matchesSearch = item.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTeacher = filterTeacher === 'all' || item.tenant_name === filterTeacher
      return matchesSearch && matchesTeacher
  })

  const filteredAcademies = academySummary.filter((item: any) => 
      item.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-12 text-center text-gray-500">Loading financial data...</div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue & Sales</h1>
            <p className="text-gray-500 text-sm mt-1">Platform-wide financial performance</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
             {/* ✅ NEW: Dynamic Commission Input */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-3 mr-1">
                <Percent size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Commission:</span>
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="w-16 p-1 text-sm font-bold text-center bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                />
                <span className="text-sm font-bold text-gray-700">%</span>
            </div>

            {/* Month Picker */}
            <div className="flex items-center gap-2 px-2">
                <Calendar size={16} className="text-gray-500" />
                <input 
                    type="month" 
                    className="bg-transparent border-none text-sm text-gray-700 focus:ring-0 outline-none"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg ml-2">
                <Download size={16} /> Export
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`LKR ${stats.total_revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-50 text-green-600" />
        <StatCard label="Total Enrollments" value={stats.total_sales} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Active Courses" value={stats.total_courses} icon={BookOpen} color="bg-purple-50 text-purple-600" />
        <StatCard label="Top Academy" value={stats.top_teacher || 'N/A'} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button onClick={() => setViewMode('courses')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'courses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <LayoutList size={18} /> Course Breakdown
        </button>
        <button onClick={() => setViewMode('academies')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'academies' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Building2 size={18} /> Academy Summary
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                 <input 
                    placeholder={viewMode === 'courses' ? "Search courses or academies..." : "Search academies..."}
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                 />
             </div>
             
             {viewMode === 'courses' && (
                 <div className="flex items-center gap-2">
                     <Filter size={20} className="text-gray-400" />
                     <select className="p-2 border rounded-lg bg-gray-50 text-gray-700 min-w-[200px] outline-none" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                         <option value="all">All Academies</option>
                         {teachers.map((t: any) => <option key={t} value={t}>{t}</option>)}
                     </select>
                 </div>
             )}
         </div>

         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                     {viewMode === 'courses' ? (
                         <tr>
                             <th className="px-6 py-4">Academy / Teacher</th>
                             <th className="px-6 py-4">Course Title</th>
                             <th className="px-6 py-4">Unit Price</th>
                             <th className="px-6 py-4">Sales Count</th>
                             <th className="px-6 py-4 text-right">Revenue</th>
                         </tr>
                     ) : (
                         <tr>
                             <th className="px-6 py-4">Academy Name</th>
                             <th className="px-6 py-4">Owner Email</th>
                             <th className="px-6 py-4">Active Courses</th>
                             <th className="px-6 py-4">Total Enrollments</th>
                             <th className="px-6 py-4 text-right">Total Revenue</th>
                             {/* ✅ Dynamic Commission Header */}
                             <th className="px-6 py-4 text-right text-green-700 bg-green-50/50">Est. Commission ({commissionRate}%)</th>
                         </tr>
                     )}
                 </thead>
                 
                 <tbody className="divide-y divide-gray-100 text-sm">
                     {viewMode === 'courses' ? (
                         filteredCourses.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-400">No data found.</td></tr>
                         ) : (
                             filteredCourses.map((row: any, idx: number) => (
                                 <tr key={idx} className="hover:bg-gray-50 transition">
                                     <td className="px-6 py-4 font-medium text-gray-900">
                                         {row.tenant_name}
                                         <div className="text-xs text-gray-400 font-normal">{row.owner_email}</div>
                                     </td>
                                     <td className="px-6 py-4 text-gray-600">{row.course_title}</td>
                                     <td className="px-6 py-4 text-gray-500">
                                         {row.is_free ? <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">FREE</span> : `LKR ${row.price.toLocaleString()}`}
                                     </td>
                                     <td className="px-6 py-4 font-mono font-bold text-blue-600 bg-blue-50/50 w-fit rounded-lg">
                                         {row.sales_count}
                                     </td>
                                     <td className="px-6 py-4 text-right font-bold text-gray-900">
                                         LKR {row.revenue.toLocaleString()}
                                     </td>
                                 </tr>
                             ))
                         )
                     ) : (
                         filteredAcademies.length === 0 ? (
                             <tr><td colSpan={6} className="p-8 text-center text-gray-400">No academies found.</td></tr>
                         ) : (
                             filteredAcademies.map((academy: any, idx: number) => (
                                 <tr key={idx} className="hover:bg-gray-50 transition">
                                     <td className="px-6 py-4 font-bold text-gray-900">{academy.tenant_name}</td>
                                     <td className="px-6 py-4 text-gray-600">{academy.owner_email}</td>
                                     <td className="px-6 py-4 text-gray-600">{academy.total_courses}</td>
                                     <td className="px-6 py-4 font-mono font-bold text-blue-600 bg-blue-50/50 w-fit rounded-lg">
                                         {academy.total_sales}
                                     </td>
                                     <td className="px-6 py-4 text-right font-bold text-slate-800">
                                         LKR {academy.total_revenue.toLocaleString()}
                                     </td>
                                     {/* ✅ Dynamic Commission Calculation */}
                                     <td className="px-6 py-4 text-right font-bold text-green-700 bg-green-50/30">
                                         LKR {(academy.total_revenue * (commissionRate / 100)).toLocaleString()}
                                     </td>
                                 </tr>
                             ))
                         )
                     )}
                 </tbody>
             </table>
         </div>
         <div className="p-4 border-t border-gray-200 bg-gray-50 text-right text-sm text-gray-500">
             Showing {viewMode === 'courses' ? filteredCourses.length : filteredAcademies.length} entries for {selectedMonth}
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900 truncate max-w-[150px]" title={value}>{value}</p>
            </div>
        </div>
    )
}