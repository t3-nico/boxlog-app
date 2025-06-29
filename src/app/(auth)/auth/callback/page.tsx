'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuth, getRedirectResult } from 'firebase/auth'
import { initFirebase } from '@/lib/firebase'
import { Heading } from '@/components/heading'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initFirebase()
    const auth = getAuth()
    const next = searchParams.get('next') ?? '/calender'
    getRedirectResult(auth)
      .then(() => router.push(next))
      .catch((err) => {
        console.error('Auth callback error:', err)
        setError('Authentication failed')
      })
      .finally(() => setLoading(false))
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <Heading level={2}>Authenticating...</Heading>
        <p>Processing authentication. Please wait.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <Heading level={2} className="text-red-600">Authentication Error</Heading>
        <p>{error}</p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Back to login
        </button>
      </div>
    )
  }

  return null
}
