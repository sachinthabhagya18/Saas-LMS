'use client'

import { useState, useEffect } from 'react'
import { paymentsApi, coursesApi, getMediaUrl } from '../../lib/api'
import { 
  Search, Filter, Eye, Check, X, RefreshCw, ExternalLink, 
  Calendar, User, BookOpen, CreditCard, DollarSign, FileText, ChevronRight,
  CheckCircle, XCircle, Clock, MoreVertical, ChevronDown
} from 'lucide-react'

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [filter, setFilter] = useState('pending')
  const [courseFilter, setCourseFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
        const [paymentsData, coursesData] = await Promise.all([
            paymentsApi.getTeacherPayments(),
            coursesApi.list()
        ])

        let pList = []
        if (Array.isArray(paymentsData)) pList = paymentsData
        else if (paymentsData?.results) pList = paymentsData.results
        else if (paymentsData?.data) pList = paymentsData.data
        setPayments(pList)

        let cList = []
        if (Array.isArray(coursesData)) cList = coursesData
        else if (coursesData?.results) cList = coursesData.results
        setCourses(cList)

    } catch (e) { 
        console.error("Failed to load data", e) 
    } finally { 
        setLoading(false) 
    }
  }

  // ✅ FIXED: Unified Status Change Handler (Fixes Modal Error)
  const handleStatusChange = async (id: string, newStatus: string) => {
      const currentPayment = payments.find(p => p.id === id);
      if (currentPayment && currentPayment.status === newStatus) return;

      const actionVerb = newStatus === 'completed' ? 'Approve' : newStatus === 'rejected' ? 'Reject' : 'Change';

      if (!confirm(`Are you sure you want to ${actionVerb} this payment?`)) return
      
      try {
          if (newStatus === 'completed') {
              await paymentsApi.approvePayment(id)
          } else if (newStatus === 'rejected') {
              await paymentsApi.rejectPayment(id)
          } else {
             // For resetting to pending or other states if backend supports it
             alert("Resetting to pending is not currently supported.")
             return
          }
          
          await loadData()
          setSelectedPayment(null) // Close modal
      } catch (e) { 
          alert("Action failed. Please try again.") 
      }
  }

  // ✅ STRICT FILTER: Remove "Ghost" Pending Payments
  const cleanPayments = payments.filter(p => {
      // If payment is PENDING but NOT MANUAL, it is an abandoned online checkout. Hide it.
      if (p.status === 'pending' && p.payment_method !== 'manual') {
          return false;
      }
      return true;
  })

  const filteredPayments = cleanPayments.filter(p => {
      const matchesStatus = filter === 'all' ? true : p.status === filter
      
      const selectedCourseTitle = courses.find(c => c.id === courseFilter)?.title
      const matchesCourse = courseFilter === 'all' || p.course_title === selectedCourseTitle

      const matchesSearch = p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesCourse && matchesSearch
  })

  // Stats based on CLEAN list (Ghost payments ignored)
  const stats = {
      pending: cleanPayments.filter(p => p.status === 'pending').length,
      completed: cleanPayments.filter(p => p.status === 'completed').length,
      rejected: cleanPayments.filter(p => p.status === 'rejected').length,
      total: cleanPayments.length
  }

  return (
    <div className="max-w-12xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
            <p className="text-gray-500 mt-1">Manage and track student payments</p>
        </div>
        <div className="flex gap-3">
             <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm font-medium">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""}/> Refresh
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending Approval" value={stats.pending} icon={Clock} color="text-yellow-600" bg="bg-yellow-50" border="border-yellow-100" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="text-green-600" bg="bg-green-50" border="border-green-100" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" bg="bg-red-50" border="border-red-100" />
          <StatCard label="Total Transactions" value={stats.total} icon={CreditCard} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    placeholder="Search by student, email or course..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-3">
                 <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                 </div>
            </div>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
            {['pending', 'completed', 'rejected', 'all'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-3 text-sm font-medium capitalize transition-all relative whitespace-nowrap ${
                        filter === status 
                        ? 'text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {status === 'pending' ? 'Pending Slips' : status}
                    {filter === status && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPayments.length === 0 ? (
                         <tr><td colSpan={7} className="p-12 text-center text-gray-500">No {filter === 'pending' ? 'pending slips' : 'payments'} found.</td></tr>
                    ) : (
                        filteredPayments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                            {(pay.student_name?.[0] || 'S').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{pay.student_name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{pay.student_email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-700 font-medium">{pay.course_title}</span>
                                    <div className="text-[10px] text-gray-400 mt-1">{new Date(pay.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-mono font-bold text-slate-700">LKR {parseFloat(pay.amount).toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            pay.payment_method === 'manual' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                            : 'bg-purple-50 text-purple-700 border-purple-100'
                                        }`}>
                                            {pay.payment_method}
                                        </span>
                                    </div>
                                </td>
                                
                                {/* Status Dropdown */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="relative inline-block text-left">
                                        <select
                                            value={pay.status}
                                            onChange={(e) => handleStatusChange(pay.id, e.target.value)}
                                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                                pay.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400' : 
                                                pay.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400' : 
                                                'bg-red-50 text-red-700 border-red-200 focus:ring-red-400'
                                            }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Active</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <ChevronDown size={12} />
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pay.receipt_image ? (
                                        <button 
                                            onClick={() => setSelectedPayment(pay)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    ) : <span className="text-gray-400 text-xs italic">N/A</span>}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                     <button 
                                        onClick={() => setSelectedPayment(pay)}
                                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
                                        title="More Details"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <FileText size={18} className="text-gray-400"/> Payment Details
                      </h3>
                      <button 
                        onClick={() => setSelectedPayment(null)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition text-gray-500"
                      >
                          <X size={18} />
                      </button>
                  </div>

                  <div className="p-6 space-y-6">
                      {/* Summary Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Student</span>
                              <div className="font-medium text-gray-900">{selectedPayment.student_name}</div>
                              <div className="text-xs text-gray-500 truncate">{selectedPayment.student_email}</div>
                          </div>
                          <div>
                              <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Course</span>
                              <div className="font-medium text-gray-900">{selectedPayment.course_title}</div>
                          </div>
                          <div>
                              <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Amount</span>
                              <div className="font-mono font-bold text-slate-800">LKR {parseFloat(selectedPayment.amount).toLocaleString()}</div>
                          </div>
                          <div>
                              <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Date</span>
                              <div className="font-medium text-gray-700">{new Date(selectedPayment.created_at).toLocaleString()}</div>
                          </div>
                      </div>

                      {/* Receipt View */}
                      <div>
                          <span className="text-xs text-gray-500 uppercase font-bold block mb-2">Receipt Proof</span>
                          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative group">
                              {selectedPayment.receipt_image ? (
                                  <a href={getMediaUrl(selectedPayment.receipt_image)} target="_blank" rel="noreferrer" className="block relative cursor-zoom-in">
                                      <img 
                                        src={getMediaUrl(selectedPayment.receipt_image)} 
                                        alt="Receipt" 
                                        className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-sm" 
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                              <ExternalLink size={12}/> Open Original
                                          </span>
                                      </div>
                                  </a>
                              ) : (
                                  <div className="text-center text-gray-400 py-12">
                                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                                      <p className="text-xs">No receipt image uploaded</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  {selectedPayment.status === 'pending' && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3 sticky bottom-0">
                          <button 
                            onClick={() => handleStatusChange(selectedPayment.id, 'rejected')}
                            className="flex-1 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition text-sm"
                          >
                              Reject
                          </button>
                          <button 
                            onClick={() => handleStatusChange(selectedPayment.id, 'completed')}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-lg text-sm"
                          >
                              Approve & Unlock Course
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg, border }: any) {
    return (
        <div className={`bg-white p-5 rounded-2xl shadow-sm border ${border} flex items-center gap-4`}>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            </div>
        </div>
    )
}