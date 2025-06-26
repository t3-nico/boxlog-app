'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'

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
      <div className="space-y-6 text-center">
        <Heading level={2} className="text-green-600">パスワード更新完了</Heading>
        <Text>パスワードが正常に更新されました。</Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>新しいパスワードを設定</Heading>
      <Field>
        <Label>新しいパスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </Field>
      <Field>
        <Label>パスワード確認</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </Field>
      {error && <Text className="text-red-600">{error}</Text>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '更新中...' : 'パスワードを更新'}
      </Button>
      <button type="button" onClick={() => router.push('/auth')} className="text-blue-600 hover:text-blue-700 text-sm">
        認証ページに戻る
      </button>
    </form>
  )
}
