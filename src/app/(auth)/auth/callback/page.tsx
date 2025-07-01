'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Heading } from '@/components/heading'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/calendar'

    const handleAuthCallback = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Auth callback error:', error)
            setError('Authentication failed')
            setLoading(false)
            return
          }
          router.push(next)
          return
        }

        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          console.error('Auth callback error:', error)
          setError('Authentication session not found')
          setLoading(false)
          return
        }

        router.push(next)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    handleAuthCallback()
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
          Back to sign in
        </button>
      </div>
    )
  }

  return null
} 
