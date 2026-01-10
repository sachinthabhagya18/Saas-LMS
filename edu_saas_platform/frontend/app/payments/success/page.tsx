'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

// ✅ FIX: Removed broken imports that were causing the build fail.
// This page just needs to show a success message.

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your enrollment has been confirmed. You can now access your course materials.
        </p>
        
        <Link 
          href="/student/dashboard"
          className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}