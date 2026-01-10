'use client'

import { useState, useEffect } from 'react'
import { notificationsApi, getMediaUrl } from '../../lib/api'
import { Megaphone, Plus, Trash2, Bell, CheckCircle, AlertTriangle, Send, X, Edit2, Clock, Image as ImageIcon } from 'lucide-react'

export default function TeacherNotificationsPage() {
  const [activeTab, setActiveTab] = useState('manage_notices')
  const [notices, setNotices] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<any>(null)
  const [formData, setFormData] = useState({ title: '', message: '', is_important: false, image: null as File | null })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [noticesData, activityData] = await Promise.all([
        notificationsApi.getNotices(),
        notificationsApi.getNotifications()
      ])
      setNotices(Array.isArray(noticesData) ? noticesData : noticesData.results || [])
      setActivities(Array.isArray(activityData) ? activityData : activityData.results || [])
    } catch (e) { console.error(e) } 
    finally { setLoading(false) }
  }

  const openCreateModal = () => {
      setEditingNotice(null)
      setFormData({ title: '', message: '', is_important: false, image: null })
      setShowModal(true)
  }

  const openEditModal = (notice: any) => {
      setEditingNotice(notice)
      setFormData({ 
          title: notice.title, 
          message: notice.message, 
          is_important: notice.is_important,
          image: null // Reset file input
      })
      setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingNotice) {
          await notificationsApi.updateNotice(editingNotice.id, formData)
          alert("Announcement updated!")
      } else {
          await notificationsApi.createNotice(formData)
          alert("Announcement posted!")
      }
      setShowModal(false)
      loadData()
    } catch (e) { alert("Operation failed") }
  }

  const handleDeleteNotice = async (id: string) => {
      if(confirm("Delete this announcement?")) {
          await notificationsApi.deleteNotice(id)
          loadData()
      }
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
        <button onClick={openCreateModal} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg">
            <Plus size={20} /> New Announcement
        </button>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-8">
          <button onClick={() => setActiveTab('manage_notices')} className={`pb-4 text-sm font-bold flex items-center gap-2 relative transition ${activeTab === 'manage_notices' ? 'text-blue-600' : 'text-gray-500'}`}>
             <Megaphone size={18} /> Manage Announcements
             {activeTab === 'manage_notices' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button onClick={() => setActiveTab('activity')} className={`pb-4 text-sm font-bold flex items-center gap-2 relative transition ${activeTab === 'activity' ? 'text-blue-600' : 'text-gray-500'}`}>
             <Bell size={18} /> System Activity
             {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
      </div>

      {activeTab === 'manage_notices' && (
          <div className="space-y-4">
              {notices.map((notice) => (
                  <div key={notice.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                      <div className="flex justify-between items-start gap-4">
                          {notice.image && (
                              <img src={getMediaUrl(notice.image) || ''} className="w-24 h-24 object-cover rounded-lg border border-gray-100" alt="Notice" />
                          )}
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  {notice.is_important && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={12} /> Important</span>}
                                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(notice.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                              <p className="text-gray-600 text-sm whitespace-pre-wrap">{notice.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(notice)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteNotice(notice.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 size={18} /></button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                      <h3 className="text-xl font-bold text-gray-900">{editingNotice ? 'Edit Announcement' : 'Post Announcement'}</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input required className="w-full p-3 border border-gray-300 rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea required rows={4} className="w-full p-3 border border-gray-300 rounded-xl" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} /></div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
                          <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={e => setFormData({...formData, image: e.target.files ? e.target.files[0] : null})} />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 border border-red-100 rounded-xl">
                          <input type="checkbox" className="w-5 h-5 text-red-600 rounded" checked={formData.is_important} onChange={e => setFormData({...formData, is_important: e.target.checked})} />
                          <span className="text-sm font-bold text-red-700">Mark as Important</span>
                      </label>
                      <div className="flex justify-end pt-2"><button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2"><Send size={18} /> {editingNotice ? 'Update' : 'Post Now'}</button></div>
                  </form>
              </div>
          </div>
      )}
    </div>
  )
}