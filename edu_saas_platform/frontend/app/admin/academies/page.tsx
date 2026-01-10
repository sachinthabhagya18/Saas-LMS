'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '../../lib/api'
import { Building2, ExternalLink, Trash2, Search, RefreshCw, Edit2, X, Save, Lock, Globe } from 'lucide-react'

export default function AdminAcademiesPage() {
  const [academies, setAcademies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAcademy, setEditingAcademy] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    domain: '',
    password: ''
  })

  useEffect(() => {
    loadAcademies()
  }, [])

  const loadAcademies = async () => {
    try {
      const data = await superAdminApi.getTenantDomains()
      setAcademies(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Failed to load academies", e)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAcademies()
    setRefreshing(false)
  }

  const handleDelete = async (id: string) => {
      if(confirm("⚠️ DANGER: Are you sure? This will permanently delete the academy.")) {
          try {
             alert("Delete functionality requires backend implementation.")
          } catch(e) {
             alert("Failed to delete academy.")
          }
      }
  }

  // --- Edit Handlers ---
  const handleEditClick = (academy: any) => {
    setEditingAcademy(academy)
    setEditFormData({
      domain: academy.domain,
      password: '' // Empty initially
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateAcademy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAcademy) return

    setEditLoading(true)
    try {
        // Only send password if it's not empty
        const payload: any = { domain: editFormData.domain }
        if (editFormData.password) {
            payload.password = editFormData.password
        }

        await superAdminApi.updateTenant(editingAcademy.id, payload)
        
        alert('Academy updated successfully!')
        setIsEditModalOpen(false)
        setEditingAcademy(null)
        loadAcademies()
    } catch (error: any) {
        console.error(error)
        alert(error.message || 'Failed to update academy.')
    } finally {
        setEditLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Academies</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage registered classes</p>
        </div>
        <Link 
          href="/admin/academies/create"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
        >
          <Building2 size={20} /> Register New Academy
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search academies..." 
            className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg focus:ring-0"
          />
        </div>
        <button 
            onClick={handleRefresh}
            className={`p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 border border-gray-200 rounded-lg transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Academy</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Schema</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {academies.map((academy, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{academy.domain.split('.')[0]} Academy</div>
                                    <a href={`http://${academy.domain}`} target="_blank" className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 mt-0.5">
                                        {academy.domain} <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{academy.teacher_email}</td>
                         <td className="px-6 py-4">
                             <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600">
                                 {academy.schema_name}
                             </span>
                         </td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => handleEditClick(academy)}
                                    className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
                                    title="Edit Academy"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(academy.id)} 
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition" 
                                    title="Delete Academy"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {academies.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">No academies found.</div>
        )}
      </div>

      {/* ✅ Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Academy</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdateAcademy} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain URL</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                className="w-full pl-10 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                value={editFormData.domain}
                                onChange={e => setEditFormData({...editFormData, domain: e.target.value})}
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Include port if using localhost (e.g. :8000)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reset Owner Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password"
                                className="w-full pl-10 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="Leave empty to keep current"
                                value={editFormData.password}
                                onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsEditModalOpen(false)} 
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={editLoading}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"
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