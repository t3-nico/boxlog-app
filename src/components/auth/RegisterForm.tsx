'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'

export default function RegisterForm({
  onLoginClick,
}: {
  onLoginClick?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('登録中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <Heading level={2}>登録完了</Heading>
        <Text>
          確認メールを送信しました。メールを確認してアカウントを有効化してください。
        </Text>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>アカウント登録</Heading>
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
      <Field>
        <Label>パスワード</Label>
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
        {loading ? '登録中...' : '登録'}
      </Button>
      <Text className="text-center">
        すでにアカウントをお持ちの方は{' '}
        <TextLink href="#" onClick={onLoginClick}>
          <Strong>ログイン</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
