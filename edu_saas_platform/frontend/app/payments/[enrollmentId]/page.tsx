// app/payments/[enrollmentId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { paymentsApi, coursesApi } from '../../lib/api'

export default function PaymentPage() {
  const { enrollmentId } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user && enrollmentId) {
      fetchEnrollmentDetails()
    }
  }, [user, enrollmentId])

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true)
      console.log('📄 Fetching enrollment details:', enrollmentId)
      
      // Get enrollment details from my enrollments
      const myEnrollments = await coursesApi.getMyEnrollments()
      const currentEnrollment = myEnrollments.find((e: { id: string | string[] }) => e.id === enrollmentId)
      
      if (currentEnrollment) {
        setEnrollment(currentEnrollment)
      } else {
        throw new Error('Enrollment not found')
      }
      
    } catch (error) {
      console.error('❌ Error fetching enrollment:', error)
      alert('Enrollment not found')
      router.push('/courses')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setProcessing(true)
      console.log('💳 Starting payment for enrollment:', enrollmentId)
      
      const payment = await paymentsApi.startPayment(enrollmentId as string)
      
      if (payment.payment_url) {
        // Redirect to payment gateway
        window.location.href = payment.payment_url
      } else {
        alert('Payment gateway not available. Please try again later.')
      }
      
    } catch (error: any) {
      console.error('❌ Payment initiation failed:', error)
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    router.push('/courses')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Enrollment not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Enrollment</h1>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold">
                {typeof enrollment.course === 'object' ? enrollment.course.title : 'Loading...'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-green-600">
                LKR {Number(enrollment.amount).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                enrollment.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {enrollment.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              ⚠️ Your enrollment is pending payment. Complete the payment to access the course content.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={processing}
            >
              Cancel
            </button>
            
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-green-400"
            >
              {processing ? 'Processing...' : `Pay LKR ${Number(enrollment.amount).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}