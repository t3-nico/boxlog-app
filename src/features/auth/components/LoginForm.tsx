'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Logo } from '@/app/logo'
import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

// OAuth Provider Icons
const GoogleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C35.9 2.5 30.1 0 24 0 15.5 0 8 5.9 3.5 14.5l7.4 5.9C12 15.9 17.5 9.5 24 9.5Z" />
    <path fill="#4285F4" d="M47.3 24.9c0-1.8-.2-3.6-.5-5.3H24v10h13.1c-.6 3-2.2 5.6-4.8 7.3l7.7 6C44.6 39.8 47.3 33.7 47.3 24.9Z" />
    <path fill="#FBBC05" d="M9.9 28.9a15 15 0 0 1-.5-4.9c0-1.7.3-3.4.8-5l-7.8-6.5A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.3-5.9Z" />
    <path fill="#34A853" d="M24 48c6.6 0 12.2-2.2 16.3-6l-7.7-6c-2.1 1.4-4.9 2.3-8.6 2.3-6.6 0-12.1-4.4-14.1-10.4L2 32.8C5.4 41.5 12.9 48 24 48Z" />
  </svg>
)

const AppleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" {...props}>
    <path d="M16.5 1.5c-1.3 0-2.8.9-3.6 2-.8 1-1.4 2.5-1.1 3.9 1.5 0 3-.9 3.8-2 0.8-1 1.5-2.6 1.5-3.9Z" fill="currentColor" />
    <path d="M19 14.2c-.1-3 2.3-4.4 2.4-4.5-1.4-2-3.5-2.3-4.2-2.4-1.8-.2-3.4 1-4.3 1-1 0-2.6-1-4.2-.9-2.1 0-4.2 1.2-5.3 3-2.2 3.7-.6 9 1.7 12 1 1.4 2.1 3 3.7 2.9 1.5 0 2.1-1 4.1-1 2 0 2.5 1 4.2 1 1.7 0 2.7-1.5 3.6-2.8 1.1-1.7 1.5-3.3 1.5-3.4-0.1 0-3.3-1.2-3.4-4.9Z" fill="currentColor" />
  </svg>
)

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuthContext } from '../contexts/AuthContext'

const LoginFormComponent = ({ localMode = false }: { localMode?: boolean }) => {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithOAuth, user, error: authError } = useAuthContext()
  const router = useRouter()

  // 認証成功後のリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/calendar')
    }
  }, [user, router])

  // authErrorが変更されたらLoginFormのerrorステートを更新
  useEffect(() => {
    setError(authError)
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // ローカルモードの場合は認証をスキップ
    if (localMode) {
      router.push('/calendar')
      return
    }

    try {
      await signIn(email, password)
    } catch (err) {
      console.error('LoginForm handleSubmit catch error:', err)
      setError(t('auth.errors.unexpectedError')) // 予期せぬエラーの場合のフォールバック
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError(null)
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  // ローカルモード用の簡易UI
  if (localMode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">BoxLog</h2>
            <p className="text-muted-foreground mt-2 text-sm">ローカル専用モード</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '起動中...' : t('auth.loginForm.startApp')}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Login</Heading>
      <div className="mb-6 flex flex-col gap-2">
        <Button type="button" variant="outline" onClick={() => handleProviderSignIn('google')} className="w-full">
          <GoogleIcon data-slot="icon" className="size-5" />
          Continue with Google
        </Button>
        <Button type="button" variant="outline" onClick={() => handleProviderSignIn('apple')} className="w-full">
          <AppleIcon data-slot="icon" className="size-5" />
          Continue with Apple
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error != null && (
        <p className="text-red-600 dark:text-red-400 font-bold text-lg sm:text-base">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        <p className="text-base sm:text-sm text-neutral-600 dark:text-neutral-400">
          <a
            href="/auth/password"
            className="text-neutral-900 dark:text-neutral-100 decoration-current/50 underline hover:decoration-current"
          >
            <strong className="font-medium text-neutral-900 dark:text-neutral-100">Forgot your password?</strong>
          </a>
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <p className="text-center text-base sm:text-sm text-neutral-600 dark:text-neutral-400">
        Don&apos;t have an account?{' '}
        <a
          href="/auth/signup"
          className="text-neutral-900 dark:text-neutral-100 decoration-current/50 underline hover:decoration-current"
        >
          <strong className="font-medium text-neutral-900 dark:text-neutral-100">Sign up</strong>
        </a>
      </p>
    </form>
  )
}

// Named exportとDefault exportの両方をサポート
export const LoginForm = LoginFormComponent
export default LoginFormComponent
