'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { coursesApi, paymentsApi, getMediaUrl } from '../../../lib/api'
import { processPayHerePayment } from '../../../lib/payhere'
import { CheckCircle, Clock, BookOpen, PlayCircle, Upload, X, FileText, Zap, AlertCircle } from 'lucide-react'

export default function CourseOverviewPage() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  
  const [course, setCourse] = useState<any>(null)
  const [status, setStatus] = useState<any>({ is_enrolled: false, status: null })
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user && courseId) loadData()
  }, [user, courseId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [courseData, statusData] = await Promise.all([
          coursesApi.get(courseId as string),
          coursesApi.checkEnrollment(courseId as string)
      ])
      setCourse(courseData)
      setStatus(statusData)
      
      if (statusData.status === 'pending_approval') {
          setShowPaymentOptions(false)
      }

    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // ✅ Updated Handlers to use 'courseId' from params
  const handlePayHere = async () => {
      try {
          const params = await paymentsApi.initPayHerePayment(courseId as string)
          processPayHerePayment(params)
      } catch(e) { alert("Payment Gateway Error") }
  }

  const handleOnePay = async () => {
      try {
          const res = await paymentsApi.initOnePayPayment(courseId as string)
          if(res.url && res.params) {
              const form = document.createElement('form');
              form.method = 'GET'; form.action = res.url;
              Object.keys(res.params).forEach(key => {
                  const input = document.createElement('input');
                  input.type = 'hidden'; input.name = key; input.value = res.params[key];
                  form.appendChild(input);
              });
              document.body.appendChild(form);
              form.submit();
          }
      } catch(e) { alert("OnePay Error") }
  }

  const handleManualUpload = async () => {
      if (!receiptFile) return
      try {
          setUploading(true)
          // ✅ Passing courseId directly
          await paymentsApi.uploadReceipt(courseId as string, receiptFile)
          
          alert("Receipt uploaded! Please wait for approval.")
          setShowUploadModal(false)
          setShowPaymentOptions(false)
          loadData() 
      } catch(e: any) {
          alert(e.message || "Upload failed.")
      } finally {
          setUploading(false)
      }
  }

  const handleEnroll = () => {
      setShowPaymentOptions(true)
  }

  const handleContinue = () => {
    if (status.status === 'paid') {
      router.push(`/student/courses/${courseId}/learn`)
    }
  }

  if (loading) return <div className="p-12 text-center">Loading...</div>
  if (!course) return <div className="p-12 text-center">Course not found</div>

  return (
    <div className="min-h-screen bg-white">
       <div className="relative bg-gray-900 text-white">
         {course.banner ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img src={getMediaUrl(course.banner) || ''} className="w-full h-full object-cover opacity-50 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            </div>
        ) : <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>}

        <div className="relative container mx-auto max-w-4xl py-20 px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-200 mb-8">{course.description}</p>
                <div className="flex flex-wrap gap-6 mb-8 text-sm">
                    <div className="flex items-center gap-2"><Clock size={18} className="text-blue-400" /><span>Self-paced</span></div>
                    <div className="flex items-center gap-2"><BookOpen size={18} className="text-blue-400" /><span>Online Content</span></div>
                </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/20 min-w-[320px] h-fit backdrop-blur-md shadow-2xl">
                <div className="text-3xl font-bold mb-4 text-white">
                    {course.is_free ? 'Free' : `${course.currency} ${course.price}`}
                </div>

                {status.status === 'paid' ? (
                     <div className="space-y-3">
                        <div className="p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-center font-bold">✅ Active Student</div>
                        <button onClick={handleContinue} className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2">
                           <PlayCircle size={20}/> Go to Course
                        </button>
                    </div>
                ) : status.status === 'pending_approval' ? (
                     <div className="p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-center font-bold text-sm">
                        ⏳ Payment Under Review
                     </div>
                ) : showPaymentOptions ? (
                     <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-blue-100 font-medium mb-2 text-center">Select Payment Method:</p>
                        <button onClick={handlePayHere} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2"><Zap size={18} /> PayHere</button>
                        <button onClick={handleOnePay} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2"><Zap size={18} /> OnePay</button>
                        <button onClick={() => setShowUploadModal(true)} className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 border border-white/10"><Upload size={18} /> Upload Slip</button>
                        <button onClick={() => setShowPaymentOptions(false)} className="w-full text-xs text-gray-300 hover:text-white mt-2 underline">Cancel</button>
                    </div>
                ) : (
                    <button 
                        onClick={handleEnroll}
                        disabled={enrollLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
                    >
                        Enroll Now
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold">Upload Bank Slip</h3>
                    <button onClick={() => setShowUploadModal(false)}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-100">
                        <p className="font-bold mb-2">Bank Details:</p>
                        <p>Bank: Commercial Bank</p>
                        <p>Account Name: {typeof window !== 'undefined' ? window.location.hostname : 'Academy'}</p>
                        <p>Account No: 123456789</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer group">
                        <input type="file" className="hidden" id="slip" accept="image/*" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                        <label htmlFor="slip" className="cursor-pointer block w-full h-full">
                            <FileText className="mx-auto text-gray-400 mb-3" size={40} />
                            <span className="text-blue-600 font-bold block">{receiptFile ? receiptFile.name : 'Select Image'}</span>
                        </label>
                    </div>
                    <button onClick={handleManualUpload} disabled={uploading || !receiptFile} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                        {uploading ? 'Uploading...' : 'Submit Receipt'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}