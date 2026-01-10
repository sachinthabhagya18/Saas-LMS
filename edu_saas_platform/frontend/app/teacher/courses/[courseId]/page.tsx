'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { coursesApi, teacherApi, getMediaUrl } from '../../../lib/api'
import { 
  Plus, Trash2, Video, FileText, Link as LinkIcon, 
  GripVertical, Edit2, X, Save, Clock, Image as ImageIcon, Calendar, Youtube
} from 'lucide-react'

// Helper to rename long files before upload
const sanitizeFile = (file: File): File => {
  const MAX_LENGTH = 50; 
  if (file.name.length <= MAX_LENGTH) return file;

  const extension = file.name.split('.').pop() || '';
  const newName = `file_${Date.now().toString().slice(-6)}.${extension}`;
  return new File([file], newName, { type: file.type });
}

export default function ManageCoursePage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- Modals State ---
  const [showChapterModal, setShowChapterModal] = useState<{open: boolean, mode: 'create' | 'edit', data?: any}>({ open: false, mode: 'create' })
  const [showSessionModal, setShowSessionModal] = useState<{open: boolean, mode: 'create' | 'edit', chapterId: string | null, data?: any}>({ open: false, mode: 'create', chapterId: null })
  
  // --- Form Data ---
  const [chapterForm, setChapterForm] = useState({ title: '', banner: null as File | null })
  
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '', 
    media_type: 'video',
    video_url: '', // Used for Zoom Link too
    file: null as File | null,
    banner: null as File | null,
    duration_seconds: 0,
    scheduled_at: '', // ✅ Zoom Date/Time
    recording_url: '' // ✅ YouTube Recording
  })

  useEffect(() => { if (courseId) loadData() }, [courseId])

  const loadData = async () => {
    try {
      const [c, ch] = await Promise.all([coursesApi.get(courseId as string), coursesApi.getCourseChapters(courseId as string)])
      const chaptersWithSessions = await Promise.all(ch.map(async (chap: any) => {
        const sessions = await coursesApi.getChapterSessions(chap.id)
        return { ...chap, sessions }
      }))
      setCourse(c)
      setChapters(chaptersWithSessions.sort((a, b) => a.order - b.order))
    } catch (e) { console.error("Error loading course data", e) } finally { setLoading(false) }
  }

  // --- Chapter Handlers ---

  const openChapterModal = (mode: 'create' | 'edit', data?: any) => {
    setChapterForm({ 
        title: data ? data.title : '',
        banner: null 
    })
    setShowChapterModal({ open: true, mode, data })
  }

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (showChapterModal.mode === 'create') {
        await teacherApi.createChapter({
          course: courseId,
          title: chapterForm.title,
          banner: chapterForm.banner,
          order: chapters.length + 1
        })
      } else {
        await teacherApi.updateChapter(showChapterModal.data.id, {
            title: chapterForm.title,
            banner: chapterForm.banner
        })
      }
      setShowChapterModal({ open: false, mode: 'create' })
      loadData()
    } catch (e) {
      alert('Failed to save chapter')
    }
  }

  const handleDeleteChapter = async (id: string) => { if (confirm('Delete this chapter?')) { await teacherApi.deleteChapter(id); loadData(); } }
  const handleDeleteSession = async (id: string) => { if (confirm('Delete this lesson?')) { await teacherApi.deleteSession(id); loadData(); } }

  // --- Session Handlers ---

  const openSessionModal = (mode: 'create' | 'edit', chapterId: string, data?: any) => {
    if (mode === 'edit' && data) {
      setSessionData({
        title: data.title,
        description: data.description || '',
        media_type: data.media_type,
        video_url: data.video_url || '',
        file: null,
        banner: null,
        duration_seconds: data.duration_seconds ? Math.round(data.duration_seconds / 60) : 0,
        // ✅ Load Zoom fields
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
        recording_url: data.recording_url || ''
      })
    } else {
      setSessionData({ 
        title: '', description: '', media_type: 'video', 
        video_url: '', file: null, banner: null, duration_seconds: 0,
        scheduled_at: '', recording_url: ''
      })
    }
    setShowSessionModal({ open: true, mode, chapterId, data })
  }

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showSessionModal.chapterId) return

    try {
      const payload: any = {
        ...sessionData,
        chapter: showSessionModal.chapterId,
        duration_seconds: (sessionData.duration_seconds || 0) * 60,
        // ✅ Handle optional Zoom fields
        scheduled_at: sessionData.scheduled_at || null,
        recording_url: sessionData.recording_url || null
      }

      if (showSessionModal.mode === 'create') {
        const currentChapter = chapters.find(c => c.id === showSessionModal.chapterId)
        payload.order = (currentChapter?.sessions?.length || 0) + 1
        await teacherApi.createSession(payload)
      } else {
        await teacherApi.updateSession(showSessionModal.data.id, payload)
      }
      
      setShowSessionModal({ open: false, mode: 'create', chapterId: null })
      loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to save session. Please check your inputs.')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Course Header (with Banner display) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
        {course.banner && (
            <div className="h-48 w-full overflow-hidden">
                <img src={getMediaUrl(course.banner) || ''} alt="Course Banner" className="w-full h-full object-cover" />
            </div>
        )}
        <div className="p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">{course.description}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Curriculum Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Curriculum Content</h2>
        <button onClick={() => openChapterModal('create')} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition">
          <Plus size={20} /> Add Chapter
        </button>
      </div>

      {/* Chapters List */}
      <div className="space-y-6">
        {chapters.map((chapter, idx) => (
          <div key={chapter.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Chapter Bar */}
            <div className="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-200 group">
              <div className="flex items-center gap-4">
                <GripVertical className="text-gray-400" size={20} />
                {/* Banner Preview */}
                {chapter.banner && <img src={getMediaUrl(chapter.banner) || ''} className="w-10 h-10 rounded object-cover" alt="" />}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chapter {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-lg">{chapter.title}</span>
                    <button onClick={() => openChapterModal('edit', chapter)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"><Edit2 size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openSessionModal('create', chapter.id)} className="flex items-center gap-1.5 text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"><Plus size={16} /> Add Lesson</button>
                <button onClick={() => handleDeleteChapter(chapter.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            </div>
            
            {/* Sessions List */}
            <div className="divide-y divide-gray-100">
                {chapter.sessions?.map((session: any) => (
                    <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition pl-12 group">
                        <div className="flex items-center gap-4">
                            {/* Session Banner Preview */}
                            {session.banner ? (
                                <img src={getMediaUrl(session.banner) || ''} className="w-12 h-8 rounded object-cover bg-gray-100" alt="" />
                            ) : (
                                <div className={`w-12 h-8 rounded flex items-center justify-center ${
                                    session.media_type === 'zoom' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {session.media_type === 'zoom' ? <Video size={18} /> : 
                                     session.media_type === 'video' ? <Youtube size={18} /> :
                                     <FileText size={18} />}
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-gray-900">{session.title}</div>
                                {session.media_type === 'zoom' && session.scheduled_at && (
                                    <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                        <Calendar size={10} /> 
                                        {new Date(session.scheduled_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openSessionModal('edit', chapter.id, session)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteSession(session.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Chapter Modal --- */}
      {showChapterModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{showChapterModal.mode === 'create' ? 'Add' : 'Edit'} Chapter</h3>
                <button 
                    onClick={() => setShowChapterModal({open: false, mode: 'create'})}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSaveChapter}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input className="w-full p-2 border rounded-lg" value={chapterForm.title} onChange={e => setChapterForm({...chapterForm, title: e.target.value})} required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Chapter Banner</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full text-sm" 
                    onChange={e => setChapterForm({
                        ...chapterForm, 
                        banner: e.target.files ? sanitizeFile(e.target.files[0]) : null
                    })} 
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowChapterModal({open: false, mode: 'create'})} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Session Modal --- */}
      {showSessionModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{showSessionModal.mode === 'create' ? 'Add' : 'Edit'} Lesson</h3>
                <button 
                    onClick={() => setShowSessionModal({open: false, mode: 'create', chapterId: null})}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input className="w-full p-2 border rounded-lg" value={sessionData.title} onChange={e => setSessionData({...sessionData, title: e.target.value})} required />
                </div>
                
                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea 
                        className="w-full p-2 border rounded-lg" 
                        rows={3}
                        value={sessionData.description} 
                        onChange={e => setSessionData({...sessionData, description: e.target.value})}
                        placeholder="Enter lesson summary or instructions..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Lesson Banner</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="w-full text-sm" 
                        onChange={e => setSessionData({
                            ...sessionData, 
                            banner: e.target.files ? sanitizeFile(e.target.files[0]) : null
                        })} 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select className="w-full p-2 border rounded-lg" value={sessionData.media_type} onChange={e => setSessionData({...sessionData, media_type: e.target.value as any})}>
                            <option value="video">Recorded Video</option>
                            <option value="zoom">Zoom Live Class</option> {/* ✅ ZOOM OPTION */}
                            <option value="link">External Link</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (Min)</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={sessionData.duration_seconds} onChange={e => setSessionData({...sessionData, duration_seconds: parseInt(e.target.value) || 0})} />
                    </div>
                </div>

                {/* ✅ ZOOM SPECIFIC FIELDS */}
                {sessionData.media_type === 'zoom' && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                         <div>
                             <label className="block text-sm font-bold text-blue-800 mb-1">Zoom Meeting Link</label>
                             <input className="w-full p-2 border border-blue-200 rounded-lg" placeholder="https://zoom.us/j/..." value={sessionData.video_url} onChange={e => setSessionData({...sessionData, video_url: e.target.value})} required />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-blue-800 mb-1">Class Date & Time</label>
                             <input 
                                type="datetime-local" 
                                className="w-full p-2 border border-blue-200 rounded-lg" 
                                value={sessionData.scheduled_at} 
                                onChange={e => setSessionData({...sessionData, scheduled_at: e.target.value})} 
                                required 
                             />
                         </div>
                         
                         {/* Recording URL Field */}
                         <div className="pt-2 border-t border-blue-200 mt-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Youtube size={16} className="text-red-600" /> Upload Recording Link (YouTube)
                             </label>
                             <input 
                                className="w-full p-2 border rounded-lg text-sm" 
                                placeholder="Add YouTube link after class ends..." 
                                value={sessionData.recording_url} 
                                onChange={e => setSessionData({...sessionData, recording_url: e.target.value})} 
                             />
                         </div>
                    </div>
                )}

                {sessionData.media_type === 'video' && (
                    <div><label className="block text-sm font-medium mb-1">Video URL</label><input className="w-full p-2 border rounded-lg" value={sessionData.video_url} onChange={e => setSessionData({...sessionData, video_url: e.target.value})} /></div>
                )}
                {sessionData.media_type === 'link' && (
                    <div><label className="block text-sm font-medium mb-1">Link URL</label><input className="w-full p-2 border rounded-lg" value={sessionData.video_url} onChange={e => setSessionData({...sessionData, video_url: e.target.value})} /></div>
                )}
                {sessionData.media_type === 'pdf' && (
                   <div>
                       <label className="block text-sm font-medium mb-1">PDF File</label>
                       <input type="file" accept="application/pdf" className="w-full p-2 border rounded-lg" onChange={e => setSessionData({...sessionData, file: e.target.files ? sanitizeFile(e.target.files[0]) : null})} />
                   </div>
                )}
                
                <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowSessionModal({open: false, mode: 'create', chapterId: null})} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}