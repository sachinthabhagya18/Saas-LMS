'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { teacherApi } from '../../../lib/api'
import { ArrowLeft, Save, Info , Upload} from 'lucide-react'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Matches Course Model
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'LKR',
    course_type: 'online',
    is_free: false,
    expiry_days: '', // Optional field in model
    published: false,
    banner: null as File | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Auto-generate slug from title
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      
      const payload = {
        ...formData,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        expiry_days: formData.expiry_days ? parseInt(formData.expiry_days) : null,
        slug
      }
      
      const course = await teacherApi.createCourse(payload)
      // Redirect to Curriculum Builder
      router.push(`/teacher/courses/${course.id}`)
    } catch (err) {
      alert('Failed to create course. Please check inputs.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" /> Back to Courses
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-500 mt-1">Start by setting up the basic details.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Banner</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    id="banner-upload"
                    onChange={(e) => setFormData({...formData, banner: e.target.files ? e.target.files[0] : null})}
                />
                <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">
                        {formData.banner ? formData.banner.name : "Click to upload course banner"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                </label>
            </div>
          </div>
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input 
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="e.g. Mastering Grade 11 Mathematics"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Describe what students will learn..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                value={formData.course_type}
                onChange={(e) => setFormData({...formData, course_type: e.target.value})}
              >
                <option value="online">Online Course</option>
                <option value="physical">Physical Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Duration (Days)</label>
              <div className="relative">
                <input 
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 365 (Leave empty for lifetime)"
                  value={formData.expiry_days}
                  onChange={(e) => setFormData({...formData, expiry_days: e.target.value})}
                />
                <div className="absolute right-3 top-3 text-gray-400 group relative">
                  <Info size={18} />
                  <span className="hidden group-hover:block absolute bottom-full right-0 w-48 bg-black text-white text-xs p-2 rounded mb-2">
                    Days after enrollment until access expires.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
            
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input 
                type="checkbox" 
                checked={formData.is_free}
                onChange={(e) => setFormData({...formData, is_free: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">This is a free course</span>
            </label>

            {!formData.is_free && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
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
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="2500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publishing */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
              />
              <span className="text-gray-900 font-medium">Publish immediately (Visible to students)</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
          >
            {loading ? 'Creating Course...' : <><Save size={20} /> Save & Add Content</>}
          </button>
        </form>
      </div>
    </div>
  )
}