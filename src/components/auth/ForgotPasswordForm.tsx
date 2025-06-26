'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'

export default function ForgotPasswordForm({
  onLoginClick,
}: {
  onLoginClick?: () => void
}) {
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
      <div className="text-center space-y-6">
        <Heading level={2} className="text-green-600">メール送信完了</Heading>
        <Text>{email} にパスワードリセット用のメールを送信しました。</Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>パスワードをリセット</Heading>
      <Text>登録済みのメールアドレスを入力してください。</Text>
      <Field>
        <Label>メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      {error && <Text className="text-red-600">{error}</Text>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '送信中...' : 'リセットメールを送信'}
      </Button>
      <Text className="text-center">
        <TextLink href="#" onClick={onLoginClick}>
          <Strong>ログインページに戻る</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
