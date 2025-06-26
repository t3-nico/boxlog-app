'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Heading } from '@/components/heading'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuthContext()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // URLパラメータからアクセストークンを取得
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  useEffect(() => {
    // トークンがない場合は認証ページにリダイレクト
    if (!accessToken || !refreshToken) {
      router.push('/auth')
    }
  }, [accessToken, refreshToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(password)
      
      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        // 3秒後にメインページにリダイレクト
        setTimeout(() => {
          router.push('/calender')
        }, 3000)
      }
    } catch (err) {
      setError('パスワード更新中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Heading level={2} className="text-green-600 mb-4">
            パスワード更新完了
          </Heading>
          <p className="text-gray-600 mb-4">
            パスワードが正常に更新されました。
          </p>
          <p className="text-gray-500 text-sm">
            まもなくメインページにリダイレクトされます...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <Heading level={2}>
            新しいパスワードを設定
          </Heading>
          <p className="text-gray-600 mt-2">
            新しいパスワードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="新しいパスワードを入力"
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード確認
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="パスワードを再入力"
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? '更新中...' : 'パスワードを更新'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            認証ページに戻る
          </button>
        </div>
      </div>
    </div>
  )
} 