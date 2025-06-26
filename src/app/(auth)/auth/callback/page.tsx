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
    const next = searchParams.get('next') ?? '/calender'

    const handleAuthCallback = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Auth callback error:', error)
            setError('認証に失敗しました')
            setLoading(false)
            return
          }
          router.push(next)
          return
        }

        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          console.error('Auth callback error:', error)
          setError('認証セッションが見つかりません')
          setLoading(false)
          return
        }

        router.push(next)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('予期しないエラーが発生しました')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <Heading level={2} className="mt-4">
            認証中...
          </Heading>
          <p className="text-gray-600 mt-2">
            認証を処理しています。しばらくお待ちください。
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Heading level={2} className="text-red-600 mb-4">
            認証エラー
          </Heading>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            認証ページに戻る
          </button>
        </div>
      </div>
    )
  }

  return null
} 