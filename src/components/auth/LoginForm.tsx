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
  const { signIn, signInWithOAuth } = useAuthContext()

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
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError(null)
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Sign in</Heading>
      <Field>
        <Label>Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field>
        <Label>Password</Label>
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
          <Label>Remember me</Label>
        </CheckboxField>
        <Text>
          <TextLink href="#" onClick={onForgotPasswordClick}>
            <Strong>Forgot your password?</Strong>
          </TextLink>
        </Text>
      </div>
      <Button
        type="button"
        outline
        onClick={() => handleProviderSignIn('google')}
        className="w-full"
      >
        Continue with Google
      </Button>
      <Button
        type="button"
        outline
        onClick={() => handleProviderSignIn('apple')}
        className="w-full"
      >
        Continue with Apple
      </Button>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      <Text className="text-center">
        Don’t have an account?{' '}
        <TextLink href="#" onClick={onRegisterClick}>
          <Strong>Sign up</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
