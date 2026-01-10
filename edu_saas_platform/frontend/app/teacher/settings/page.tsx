'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi, settingsApi, getMediaUrl } from '../../lib/api'
import { 
  Save, User, Palette, LayoutTemplate, Phone, Upload, Image,CreditCard as ImageIcon, 
  Trash2, Plus, Loader2, X, Camera, RefreshCw, 
  CreditCard
} from 'lucide-react'

// Helper to rename long files before upload
const sanitizeFile = (file: File): File => {
  const MAX_LENGTH = 50; 
  if (file.name.length <= MAX_LENGTH) return file;
  const extension = file.name.split('.').pop() || '';
  const newName = `img_${Date.now().toString().slice(-6)}.${extension}`;
  return new File([file], newName, { type: file.type });
}

export default function TeacherSettingsPage() {
  const { user, refreshAuth } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' })
  const [academyData, setAcademyData] = useState<any>({})
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [heroPreview, setHeroPreview] = useState<string | null>(null)

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    try {
      if (user) {
        setProfileData(prev => ({ ...prev, first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' }))
      }
      const settings = await settingsApi.get()
      if (settings) {
          const { logo, hero_image, favicon, ...textData } = settings
          setAcademyData((prev: any) => ({ ...prev, ...textData }))
          if (logo) setLogoPreview(getMediaUrl(logo))
          if (hero_image) setHeroPreview(getMediaUrl(hero_image))
      }
      
      // ✅ FIXED: Handle Pagination Response
      const galleryData = await settingsApi.getGallery()
      let galleryList = []
      if (Array.isArray(galleryData)) {
          galleryList = galleryData
      } else if (galleryData && Array.isArray(galleryData.results)) {
          galleryList = galleryData.results // Handle DRF Pagination
      }
      
      console.log("📸 Gallery Data:", galleryList) // Debug Log
      setGalleryImages(galleryList)

    } catch (e) {
      console.error("Failed to load data", e)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
        alert("Passwords do not match"); setLoading(false); return
    }
    try {
      const payload: any = { first_name: profileData.first_name, last_name: profileData.last_name }
      if (profileData.password) payload.password = profileData.password
      await authApi.updateProfile(payload)
      if (refreshAuth) await refreshAuth()
      alert('Profile updated successfully')
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error: any) { alert(error.message || 'Failed to update profile') } finally { setLoading(false) }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(academyData).forEach(([key, value]) => {
          if (!['logo', 'hero_image', 'favicon'].includes(key)) formData.append(key, value as string || '')
      })
      if (logoFile) formData.append('logo', logoFile)
      if (heroImageFile) formData.append('hero_image', heroImageFile)
      await settingsApi.update(formData)
      alert('Academy settings updated successfully!')
      loadData()
    } catch (error: any) { alert(error.message || 'Failed to update settings.') } finally { setLoading(false) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'logo') { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
      else { setHeroImageFile(file); setHeroPreview(URL.createObjectURL(file)); }
    }
  }

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        setPendingFiles(prev => [...prev, ...newFiles])
    }
    e.target.value = ''
  }

  const removePendingFile = (index: number) => {
      setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadAll = async () => {
      if (pendingFiles.length === 0) return;
      setLoading(true)
      let successCount = 0;
      
      // Sequential Upload
      for (const file of pendingFiles) {
          try {
              const cleanFile = sanitizeFile(file)
              const formData = new FormData()
              formData.append('image', cleanFile)
              formData.append('caption', cleanFile.name.split('.')[0])
              await settingsApi.uploadGalleryImage(formData)
              successCount++;
          } catch(err) {
              console.error(`Failed to upload ${file.name}`, err)
          }
      }
      
      setLoading(false)
      if (successCount > 0) {
          alert(`Uploaded ${successCount} images successfully!`)
          setPendingFiles([]) // Clear queue
          loadData() // Refresh List from DB
      } else {
          alert("Upload failed. Please try again.")
      }
  }

  const handleDeleteImage = async (id: string) => {
      if(confirm("Delete this image?")) {
          try {
              await settingsApi.deleteGalleryImage(id)
              loadData()
          } catch(err) { alert('Failed to delete image') }
      }
  }

  if (initialLoading) return <div className="p-12 text-center">Loading settings...</div>

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Academy Settings</h1>

      <div className="flex overflow-x-auto gap-2 mb-8 border-b border-gray-200 pb-1">
        {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'content', label: 'Home Page', icon: LayoutTemplate },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
            { id: 'contact', label: 'Contact', icon: Phone },
            { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
        ].map(tab => {
            const Icon = tab.icon
            return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-slate-900 text-slate-900 bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                    <Icon size={18} /> {tab.label}
                </button>
            )
        })}
      </div>

      {activeTab === 'profile' && (
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">First Name</label><input className="w-full p-2.5 border rounded-lg" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium mb-1">Last Name</label><input className="w-full p-2.5 border rounded-lg" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">New Password</label><input type="password" className="w-full p-2.5 border rounded-lg" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Confirm</label><input type="password" className="w-full p-2.5 border rounded-lg" value={profileData.confirmPassword} onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})} /></div>
                <div className="flex justify-end pt-4"><button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Save Profile</button></div>
            </form>
         </div>
      )}

            {/* ✅ NEW: PAYMENTS TAB */}
      {activeTab === 'payments' && (
          <form onSubmit={handleSettingsSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
              <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="text-blue-600" /> PayHere Configuration
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                          <input className="w-full p-2.5 border rounded-lg" value={academyData.payhere_merchant_id || ''} onChange={e => setAcademyData({...academyData, payhere_merchant_id: e.target.value})} placeholder="e.g. 121XXXX" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Secret</label>
                          <input type="password" className="w-full p-2.5 border rounded-lg" value={academyData.payhere_secret || ''} onChange={e => setAcademyData({...academyData, payhere_secret: e.target.value})} placeholder="xxxxxxxx" />
                      </div>
                  </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="text-orange-600" /> OnePay Configuration
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                          <input className="w-full p-2.5 border rounded-lg" value={academyData.onepay_merchant_id || ''} onChange={e => setAcademyData({...academyData, onepay_merchant_id: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                          <input className="w-full p-2.5 border rounded-lg" value={academyData.onepay_app_id || ''} onChange={e => setAcademyData({...academyData, onepay_app_id: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Hash Salt</label>
                          <input type="password" className="w-full p-2.5 border rounded-lg" value={academyData.onepay_api_key || ''} onChange={e => setAcademyData({...academyData, onepay_api_key: e.target.value})} />
                      </div>
                  </div>
              </div>

              <div className="flex justify-end pt-4"><button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Save Settings</button></div>
          </form>
      )}

      {activeTab !== 'profile' && activeTab !== 'gallery' && (
          <form onSubmit={handleSettingsSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            {activeTab === 'branding' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Logo</label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center">
                                {logoPreview ? <img src={logoPreview} className="h-24 mx-auto object-contain" /> : <div className="h-24 flex items-center justify-center text-gray-400">No Logo</div>}
                                <input type="file" className="mt-2 w-full text-sm" onChange={e => handleFileChange(e, 'logo')} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium">Academy Name</label><input className="w-full p-2 border rounded" value={academyData.academy_name} onChange={e => setAcademyData({...academyData, academy_name: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium">Primary Color</label><input type="color" className="w-full h-10 cursor-pointer" value={academyData.primary_color} onChange={e => setAcademyData({...academyData, primary_color: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium">Secondary Color</label><input type="color" className="w-full h-10 cursor-pointer" value={academyData.secondary_color} onChange={e => setAcademyData({...academyData, secondary_color: e.target.value})} /></div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'content' && (
                <div className="space-y-6">
                    <div><label className="block text-sm font-medium">Hero Title</label><input className="w-full p-2 border rounded" value={academyData.hero_title} onChange={e => setAcademyData({...academyData, hero_title: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium">Hero Subtitle</label><textarea className="w-full p-2 border rounded" value={academyData.hero_subtitle} onChange={e => setAcademyData({...academyData, hero_subtitle: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium mb-2">Hero Image</label>
                        <div className="border-2 border-dashed rounded-xl p-4">
                            {heroPreview && <img src={heroPreview} className="h-32 mx-auto object-cover rounded mb-2" />}
                            <input type="file" className="w-full text-sm" onChange={e => handleFileChange(e, 'hero')} />
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'contact' && (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="p-2 border rounded" placeholder="Email" value={academyData.email} onChange={e => setAcademyData({...academyData, email: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Phone" value={academyData.phone} onChange={e => setAcademyData({...academyData, phone: e.target.value})} />
                    </div>
                    <textarea className="w-full p-2 border rounded" placeholder="Address" value={academyData.address} onChange={e => setAcademyData({...academyData, address: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="Facebook URL" value={academyData.facebook_url} onChange={e => setAcademyData({...academyData, facebook_url: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="YouTube URL" value={academyData.youtube_url} onChange={e => setAcademyData({...academyData, youtube_url: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="WhatsApp Number" value={academyData.whatsapp_number} onChange={e => setAcademyData({...academyData, whatsapp_number: e.target.value})} />
                </div>
            )}
            <div className="flex justify-end pt-4"><button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Save Settings</button></div>
          </form>
      )}

      {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {/* Upload Section */}
              <div className="mb-8 border-b border-gray-100 pb-8">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Add New Images</h2>
                      <div className="flex gap-3">
                         {/* Select Button */}
                         <label className="bg-gray-100 text-slate-900 border border-gray-300 px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-gray-200 transition flex items-center gap-2 shadow-sm">
                             <Plus size={18} /> Select Images
                             <input type="file" className="hidden" accept="image/*" multiple onChange={handleSelectFiles} disabled={loading} />
                         </label>
                         
                         {/* Upload Button */}
                         <button 
                            onClick={handleUploadAll} 
                            disabled={loading || pendingFiles.length === 0}
                            className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md ${
                                loading || pendingFiles.length === 0 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                         >
                            {loading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18} />}
                            {loading ? 'Uploading...' : `Upload ${pendingFiles.length > 0 ? pendingFiles.length : ''} Images`}
                         </button>
                      </div>
                  </div>

                  {/* Pending Previews */}
                  {pendingFiles.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-wrap gap-3">
                          {pendingFiles.map((file, idx) => (
                              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-blue-200 group">
                                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                                  <button onClick={() => removePendingFile(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600"><X size={14}/></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Existing Gallery */}
              <div>
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-semibold text-gray-900">Uploaded Gallery ({galleryImages.length})</h2>
                     <button onClick={loadData} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><RefreshCw size={14}/> Refresh</button>
                  </div>
                  
                  {galleryImages.length === 0 ? (
                      <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No images yet.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {galleryImages.map((img) => (
                              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                  <img 
                                    src={getMediaUrl(img.image) || ''} 
                                    className="w-full h-full object-cover" 
                                    alt="Gallery" 
                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error'}
                                  />
                                  <button 
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                    title="Delete Image"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  )
}