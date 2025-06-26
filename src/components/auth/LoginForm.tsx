'use client'

import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'

export default function LoginForm({
  onRegisterClick,
  onForgotPasswordClick,
}: {
  onRegisterClick?: () => void
  onForgotPasswordClick?: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>ログイン</Heading>
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
        />
      </Field>
      {error && <Text className="text-red-600">{error}</Text>}
      <div className="flex items-center justify-between">
        <CheckboxField>
          <Checkbox name="remember" />
          <Label>ログイン状態を保持</Label>
        </CheckboxField>
        <Text>
          <TextLink href="#" onClick={onForgotPasswordClick}>
            <Strong>パスワードを忘れた場合</Strong>
          </TextLink>
        </Text>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'ログイン中...' : 'ログイン'}
      </Button>
      <Text className="text-center">
        アカウントをお持ちでない方は{' '}
        <TextLink href="#" onClick={onRegisterClick}>
          <Strong>登録</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
