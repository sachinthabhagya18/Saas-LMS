'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { coursesApi, teacherApi, getMediaUrl } from '../../lib/api' // ✅ Added getMediaUrl
import { Plus, Search, BookOpen, Users, Edit, Trash2, X, Save, Pencil, Image as ImageIcon } from 'lucide-react' // ✅ Added ImageIcon

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  
  // ✅ Updated state to include banner
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'LKR',
    course_type: 'online',
    is_free: false,
    published: false,
    banner: null as File | null // ✅ New field for banner file
  })

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await coursesApi.list()
      const list = Array.isArray(data) ? data : (data.results || [])
      setCourses(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Delete Handler
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this course? This cannot be undone.')) {
        try {
            await teacherApi.deleteCourse(id)
            loadCourses()
        } catch (error) {
            console.error(error)
            alert('Failed to delete course. Ensure there are no active enrollments.')
        }
    }
  }

  // ✅ Open Edit Modal
  const handleEditClick = (e: React.MouseEvent, course: any) => {
    e.preventDefault()
    setEditingCourse(course)
    setEditFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      currency: course.currency,
      course_type: course.course_type,
      is_free: course.is_free,
      published: course.published,
      banner: null // ✅ Reset banner input on open
    })
    setIsEditModalOpen(true)
  }

  // ✅ Update Course Handler
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    setEditLoading(true)
    try {
        const payload = {
            ...editFormData,
            price: editFormData.is_free ? 0 : parseFloat(editFormData.price as string)
        }
        
        // teacherApi.updateCourse handles converting this object (with File) to FormData
        await teacherApi.updateCourse(editingCourse.id, payload)
        
        setIsEditModalOpen(false)
        setEditingCourse(null)
        loadCourses() // Refresh list
        alert('Course updated successfully!')
    } catch (error) {
        console.error(error)
        alert('Failed to update course.')
    } finally {
        setEditLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your curriculum and students</p>
        </div>
        <Link 
          href="/teacher/courses/create"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
        >
          <Plus size={20} /> Create Course
        </Link>
      </div>

      {/* Filter/Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search your courses..." 
            className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg focus:ring-0"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first course.</p>
          <Link href="/teacher/courses/create" className="text-blue-600 font-semibold hover:underline">
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link 
              href={`/teacher/courses/${course.id}`}
              key={course.id} 
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full relative"
            >
              {/* Action Buttons (Delete & Edit) */}
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <button 
                    onClick={(e) => handleEditClick(e, course)}
                    className="p-2 bg-white/90 hover:bg-blue-500 text-slate-700 hover:text-white rounded-lg backdrop-blur-sm transition-colors shadow-sm"
                    title="Edit Course Details"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={(e) => handleDelete(e, course.id)}
                    className="p-2 bg-white/90 hover:bg-red-500 text-slate-700 hover:text-white rounded-lg backdrop-blur-sm transition-colors shadow-sm"
                    title="Delete Course"
                >
                    <Trash2 size={16} />
                </button>
              </div>

              <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-end relative overflow-hidden">
                {/* Banner Image Display in Card */}
                {course.banner ? (
                    <img 
                        src={getMediaUrl(course.banner) || ''} 
                        alt={course.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                    />
                ) : null}
                
                <span className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-bold z-10 ${
                  course.published ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white'
                }`}>
                  {course.published ? 'PUBLISHED' : 'DRAFT'}
                </span>
                
                <div className="relative z-10 p-6 pt-0">
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-300 transition line-clamp-2 drop-shadow-md">
                    {course.title}
                    </h3>
                </div>
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{course.enrollment_count || 0} Students</span>
                  </div>
                  <div className="font-semibold text-gray-700">
                    {course.is_free ? 'Free' : `${course.currency} ${course.price}`}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <span 
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                  >
                    <Edit size={16} /> Manage
                  </span>
                  <button className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    Stats
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ✅ Edit Course Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdateCourse} className="space-y-6">
                    {/* ✅ Banner Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Banner</label>
                        <div className="space-y-3">
                            {/* Preview */}
                            {(editFormData.banner || editingCourse?.banner) && (
                                <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 relative bg-gray-50">
                                    <img 
                                        src={editFormData.banner ? URL.createObjectURL(editFormData.banner) : getMediaUrl(editingCourse.banner) || ''} 
                                        alt="Banner Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    {editFormData.banner && (
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">New Image Selected</div>
                                    )}
                                </div>
                            )}
                            
                            {/* File Input */}
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <ImageIcon className="w-5 h-5" />
                                        <p className="text-sm"><span className="font-semibold text-blue-600">Click to upload</span> new banner</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (MAX. 5MB)</p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setEditFormData({...editFormData, banner: e.target.files[0]})
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input 
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                            value={editFormData.title}
                            onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                            value={editFormData.description}
                            onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select 
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                                value={editFormData.course_type}
                                onChange={e => setEditFormData({...editFormData, course_type: e.target.value})}
                            >
                                <option value="online">Online Course</option>
                                <option value="physical">Physical Class</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={editFormData.is_free}
                                    onChange={e => setEditFormData({...editFormData, is_free: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-gray-700 font-medium">This is a free course</span>
                            </label>
                        </div>
                    </div>

                    {!editFormData.is_free && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select 
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                                    value={editFormData.currency}
                                    onChange={e => setEditFormData({...editFormData, currency: e.target.value})}
                                >
                                    <option value="LKR">LKR (Rs.)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input 
                                    type="number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                                    value={editFormData.price}
                                    onChange={e => setEditFormData({...editFormData, price: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                            <input 
                                type="checkbox" 
                                checked={editFormData.published}
                                onChange={e => setEditFormData({...editFormData, published: e.target.checked})}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                            />
                            <div>
                                <span className="text-gray-900 font-semibold block">Publish Course</span>
                                <span className="text-gray-500 text-xs">Visible to students for enrollment</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsEditModalOpen(false)} 
                            className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={editLoading}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            {editLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}