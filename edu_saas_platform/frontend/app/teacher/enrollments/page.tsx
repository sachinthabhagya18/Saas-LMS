'use client'

import { useState, useEffect } from 'react'
import { coursesApi, teacherApi } from '../../lib/api'
import { Search, Filter, BookOpen, Calendar, CheckCircle, XCircle, RefreshCw, UserPlus, X, Save, Clock, Trash2, FileText } from 'lucide-react'

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([]) // For dropdown
  const [loading, setLoading] = useState(true)
  
  // Filter State
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // New Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [newEnrollmentData, setNewEnrollmentData] = useState({
      student_id: '',
      course_id: '',
      status: 'paid' // Default to paid since teacher is enrolling
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
        const [enrollmentsData, coursesData, studentsData] = await Promise.all([
            coursesApi.getMyEnrollments(),
            coursesApi.list(),
            teacherApi.getStudents() // Fetch students for dropdown
        ])
        
        const eList = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData.results || [])
        const cList = Array.isArray(coursesData) ? coursesData : (coursesData.results || [])
        const sList = Array.isArray(studentsData) ? studentsData : (studentsData.results || [])
        
        setEnrollments(eList)
        setCourses(cList)
        setStudents(sList)
    } catch (e) {
        console.error("Failed to load data", e)
    } finally {
        setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
      if (!confirm(`Are you sure you want to change access status to ${newStatus}?`)) return
      try {
          await coursesApi.updateEnrollment(id, { status: newStatus })
          loadData()
      } catch (e) {
          alert('Failed to update status')
      }
  }

  // ✅ DELETE ENROLLMENT
  const handleDelete = async (id: string) => {
      if (!confirm("⚠️ Are you sure you want to DELETE this enrollment? This will remove the student from the course completely.")) return
      try {
          await coursesApi.deleteEnrollment(id)
          loadData()
      } catch (e) {
          alert('Failed to delete enrollment')
      }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
      e.preventDefault()
      setEnrollLoading(true)
      try {
          if (!newEnrollmentData.student_id || !newEnrollmentData.course_id) {
              alert("Please select both a student and a course.")
              setEnrollLoading(false)
              return
          }

          await teacherApi.createEnrollment(newEnrollmentData)
          
          alert("Student enrolled successfully!")
          setIsEnrollModalOpen(false)
          setNewEnrollmentData({ student_id: '', course_id: '', status: 'paid' })
          loadData()
      } catch (err: any) {
          console.error(err)
          alert(err.message || "Failed to enroll student.")
      } finally {
          setEnrollLoading(false)
      }
  }

  // ✅ FILTER: Show Paid OR Pending with Slip
  const filteredEnrollments = enrollments.filter(e => {
      const isPaid = e.status === 'paid'
      const hasSlip = e.has_pending_approval === true
      
      // We show if Paid OR (Pending AND Has Slip)
      const isVisible = isPaid || hasSlip

      const matchesCourse = selectedCourse === 'all' || e.course === selectedCourse || e.course?.id === selectedCourse
      const matchesSearch = e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (e.student_id && e.student_id.includes(searchTerm))
      
      return isVisible && matchesCourse && matchesSearch
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
            <p className="text-sm text-gray-500 mt-1">View active students and payment verifications</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsEnrollModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg font-bold"
            >
                <UserPlus size={18}/> Enroll Student
            </button>
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw size={18}/> Refresh
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search by name, ID, email, or course..." 
            className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg focus:ring-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
             <Filter size={20} className="text-gray-400" />
             <select 
                className="p-2.5 bg-gray-50 border-none rounded-lg text-gray-700 focus:ring-0 min-w-[200px]"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
             >
                 <option value="all">All Courses</option>
                 {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
             </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                      <th className="px-6 py-4">Student Details</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Enrolled Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {filteredEnrollments.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-gray-500">No matching enrollments found.</td></tr>
                  ) : filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                      {enrollment.student_name ? enrollment.student_name[0].toUpperCase() : 'S'}
                                  </div>
                                  <div>
                                      <div className="font-medium text-gray-900">{enrollment.student_name || enrollment.student_username}</div>
                                      <div className="text-xs text-gray-500">{enrollment.student_email}</div>
                                      {/* ✅ Student ID Display */}
                                      <div className="text-xs text-blue-600 font-mono mt-0.5">ID: {enrollment.student_id || 'N/A'}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                  <BookOpen size={16} className="text-gray-400"/>
                                  {enrollment.course_title}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                  <Calendar size={14}/>
                                  {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                  enrollment.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }`}>
                                  {enrollment.status === 'paid' ? <CheckCircle size={12}/> : <FileText size={12}/>}
                                  {enrollment.status === 'paid' ? 'Active' : 'Pending Slip'}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                  {/* Actions based on status */}
                                  {enrollment.status === 'paid' ? (
                                      <button 
                                        onClick={() => handleStatusUpdate(enrollment.id, 'pending')} 
                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                                        title="Revoke Access"
                                      >
                                          <XCircle size={18} />
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={() => handleStatusUpdate(enrollment.id, 'paid')} 
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                        title="Grant Access"
                                      >
                                          <CheckCircle size={18} />
                                      </button>
                                  )}
                                  
                                  {/* ✅ Delete Button */}
                                  <button 
                                    onClick={() => handleDelete(enrollment.id)} 
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                    title="Delete Enrollment"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Enroll Modal */}
      {isEnrollModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                      <h3 className="text-xl font-bold text-gray-900">Manually Enroll Student</h3>
                      <button onClick={() => setIsEnrollModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>

                  <form onSubmit={handleEnrollStudent} className="space-y-5">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                              value={newEnrollmentData.student_id}
                              onChange={e => setNewEnrollmentData({...newEnrollmentData, student_id: e.target.value})}
                              required
                          >
                              <option value="">-- Choose Student --</option>
                              {students.map(s => (
                                  <option key={s.id} value={s.id}>
                                      {s.first_name} {s.last_name} ({s.student_id || s.username})
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                              value={newEnrollmentData.course_id}
                              onChange={e => setNewEnrollmentData({...newEnrollmentData, course_id: e.target.value})}
                              required
                          >
                              <option value="">-- Choose Course --</option>
                              {courses.map(c => (
                                  <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                              value={newEnrollmentData.status}
                              onChange={e => setNewEnrollmentData({...newEnrollmentData, status: e.target.value})}
                          >
                              <option value="paid">Active (Paid)</option>
                              <option value="pending">Pending</option>
                          </select>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                          <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
                          <button type="submit" disabled={enrollLoading} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2">
                              {enrollLoading ? 'Enrolling...' : <><Save size={18} /> Enroll Now</>}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  )
}