'use client'

import { useState, useEffect } from 'react'
import { teacherApi } from '../../lib/api'
import { Search, Mail, Plus, Trash2, Edit2, X, Save, User, Phone, MapPin, Lock, Fingerprint } from 'lucide-react'

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    student_id: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await teacherApi.getStudents()
      // Robustly handle API response structure (Array vs Pagination Object)
      let studentList: any[] = []
      
      if (Array.isArray(data)) {
          studentList = data
      } else if (data && Array.isArray(data.results)) {
          studentList = data.results
      } else if (data && Array.isArray(data.data)) {
          studentList = data.data
      }
      
      setStudents(studentList)
    } catch (e) {
      console.error("Failed to load students", e)
    } finally {
      setLoading(false)
    }
  }

  // --- Handlers ---

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure? This will remove the student and all their progress.")) {
        try {
            await teacherApi.deleteStudent(id)
            loadStudents()
        } catch(e) {
            alert("Failed to delete student.")
        }
    }
  }

  const openModal = (student?: any) => {
    if (student) {
        setEditingStudent(student)
        setFormData({
            username: student.username,
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            password: '', // Don't show existing password
            student_id: student.student_id || '',
            phone: student.phone || '',
            address: student.address || ''
        })
    } else {
        setEditingStudent(null)
        setFormData({
            username: '', email: '', first_name: '', last_name: '',
            password: '', student_id: '', phone: '', address: ''
        })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
        const payload: any = { ...formData }
        if (!payload.password) delete payload.password // Don't send empty password on edit

        if (editingStudent) {
            await teacherApi.updateStudent(editingStudent.id, payload)
        } else {
            if(!payload.password) return alert("Password is required for new students")
            await teacherApi.createStudent(payload)
        }
        
        setIsModalOpen(false)
        loadStudents()
    } catch (e: any) {
        alert(e.message || "Failed to save student")
    } finally {
        setFormLoading(false)
    }
  }

  // Search Filter
  const filteredStudents = students.filter(s => 
    s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center text-gray-500">Loading students...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500 mt-1">Total Students: <span className="font-bold text-gray-900">{students.length}</span></p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search by name, username or email..." 
            className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg focus:ring-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">No students found.</td></tr>
            ) : filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                      {(student.first_name?.[0] || '')}{(student.last_name?.[0] || '')}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{student.first_name} {student.last_name}</div>
                        <div className="text-xs text-gray-500">@{student.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex flex-col gap-1">
                        <span className="flex items-center gap-2"><Mail size={14}/> {student.email}</span>
                        {student.phone && <span className="flex items-center gap-2"><Phone size={14}/> {student.phone}</span>}
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-sm">{student.student_id || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{student.date_joined ? new Date(student.date_joined).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(student)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition" title="Edit">
                        <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition" title="Delete">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required className="w-full pl-10 p-2.5 border rounded-lg" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required className="w-full pl-10 p-2.5 border rounded-lg" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required className="w-full pl-10 p-2.5 border rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input required type="email" className="w-full pl-10 p-2.5 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {editingStudent && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="password" 
                                className="w-full pl-10 p-2.5 border rounded-lg" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                required={!editingStudent}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
                            <div className="relative">
                                <Fingerprint size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input className="w-full pl-10 p-2.5 border rounded-lg" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input className="w-full pl-10 p-2.5 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                            <textarea className="w-full pl-10 p-2.5 border rounded-lg" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
                        <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2">
                            {formLoading ? 'Saving...' : <><Save size={18} /> Save Student</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}