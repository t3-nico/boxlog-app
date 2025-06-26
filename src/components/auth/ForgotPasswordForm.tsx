'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Heading } from '@/components/heading'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        setError(error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('パスワードリセット中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Heading level={2} className="mb-4 text-green-600">
            メール送信完了
          </Heading>
          <p className="text-gray-600 mb-4">
            {email} にパスワードリセット用のメールを送信しました。
          </p>
          <p className="text-gray-500 text-sm">
            メールのリンクをクリックして、新しいパスワードを設定してください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <Heading level={2} className="text-center mb-6">
        パスワードを忘れた場合
      </Heading>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
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
          {loading ? '送信中...' : 'リセットメールを送信'}
        </Button>
      </form>
    </div>
  )
} 