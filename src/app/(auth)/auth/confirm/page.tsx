'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Heading } from '@/components/heading'

export default function ConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const supabase = createClient()

    if (!token_hash || !type) {
      setStatus('error')
      setMessage('Missing authentication information')
      return
    }

    const verify = async () => {
      setStatus('loading')
      setMessage('Verifying...')
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })
      if (error) {
        setStatus('error')
        setMessage('Verification failed: ' + error.message)
      } else {
        setStatus('success')
        setMessage('Email verified. Logging you in...')
        setTimeout(() => {
          router.push('/calender')
        }, 3000)
      }
    }
    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 text-center">
      <Heading level={2}>Email Verification</Heading>
      <p>{message}</p>
      {status === 'loading' && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      )}
      {status === 'error' && (
        <button
          onClick={() => router.push('/auth')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to sign in
        </button>
      )}
    </div>
  )
}
