'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '../../lib/api'
import { Search, Globe, ExternalLink, CheckCircle, Calendar, Server, RefreshCw, Edit2, X, Save, Lock } from 'lucide-react'

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({ domain: '', password: '' })

  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    try {
      setLoading(true)
      const data = await superAdminApi.getTenantDomains()
      setDomains(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Failed to load domains", e)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDomains()
    setRefreshing(false)
  }

  const filteredDomains = domains.filter(domain => 
    domain.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.teacher_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.schema_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- Edit Handlers ---
  const handleEditClick = (domainItem: any) => {
    setEditingDomain(domainItem)
    setEditFormData({
      domain: domainItem.domain,
      password: '' 
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDomain) return

    setEditLoading(true)
    try {
        const payload: any = { domain: editFormData.domain }
        if (editFormData.password) payload.password = editFormData.password

        await superAdminApi.updateTenant(editingDomain.id, payload)
        
        alert('Domain info updated successfully!')
        setIsEditModalOpen(false)
        setEditingDomain(null)
        loadDomains()
    } catch (error: any) {
        console.error(error)
        alert(error.message || 'Failed to update domain info.')
    } finally {
        setEditLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Domain Management</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of all active academy domains and database schemas</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleRefresh}
                className={`p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm transition-all ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh List"
            >
                <RefreshCw size={18} />
            </button>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm border border-blue-100">
                <Globe size={18} />
                Total Domains: {domains.length}
            </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search by domain, email, or schema..." 
            className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Domain URL</th>
                        <th className="px-6 py-4">Database Schema</th>
                        <th className="px-6 py-4">Owner Email</th>
                        <th className="px-6 py-4">Created Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                    Loading domains...
                                </div>
                            </td>
                        </tr>
                    ) : filteredDomains.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <a 
                                            href={`http://${item.domain}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                                        >
                                            {item.domain}
                                            <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                        <span className="text-xs text-gray-500">{item.is_primary ? 'Primary Domain' : 'Alias'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Server size={14} className="text-gray-400" />
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        {item.schema_name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                                {item.teacher_email}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    {item.created_on ? new Date(item.created_on).toLocaleDateString() : 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleEditClick(item)}
                                    className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
                                    title="Edit Domain"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* ✅ Edit Modal (Same Design) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Domain</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdateDomain} className="space-y-5">
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