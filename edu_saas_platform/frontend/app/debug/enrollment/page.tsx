// app/debug/enrollment/page.tsx - Temporary debug page
'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { coursesApi } from '../../lib/api'

export default function EnrollmentDebugPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadEnrollments = async () => {
    setLoading(true)
    try {
      const data = await coursesApi.getMyEnrollments()
      setEnrollments(data)
      console.log('📋 All enrollments:', data)
    } catch (error) {
      console.error('❌ Failed to load enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPendingEnrollment = () => {
    const pending = localStorage.getItem('pendingEnrollment')
    console.log('📦 Pending enrollment in localStorage:', pending)
    if (pending) {
      alert('Pending enrollment found: ' + pending)
    } else {
      alert('No pending enrollment found')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Enrollment Debug</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={loadEnrollments}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Load My Enrollments
        </button>
        
        <button
          onClick={checkPendingEnrollment}
          className="bg-green-500 text-white px-4 py-2 rounded ml-4"
        >
          Check Pending Enrollment
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid gap-4">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{enrollment.course_title || 'No title'}</h3>
            <p>Status: <span className={`font-bold ${
              enrollment.status === 'paid' ? 'text-green-600' : 
              enrollment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
            }`}>{enrollment.status}</span></p>
            <p>ID: {enrollment.id}</p>
            <p>Course ID: {typeof enrollment.course === 'string' ? enrollment.course : enrollment.course?.id}</p>
            <p>Amount: {enrollment.amount}</p>
            <p>Created: {new Date(enrollment.enrolled_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}