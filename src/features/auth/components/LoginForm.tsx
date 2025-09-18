'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Logo } from '@/app/logo'
import { AppleIcon, GoogleIcon, Heading } from '@/components/custom'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { colors, typography } from '@/config/theme'

import { useAuthContext } from '../contexts/AuthContext'

const LoginFormComponent = ({ localMode = false }: { localMode?: boolean }) => {
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
      setError('予期せぬエラーが発生しました') // 予期せぬエラーの場合のフォールバック
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
              {loading ? '起動中...' : 'アプリを開始'}
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
      {error && (
        <p
          className={`${colors.text.error} font-bold ${typography.body.lg} ${typography.body.base} sm:${typography.body.sm}`}
        >
          {error}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        <p className={`${typography.body.base} ${colors.text.muted} sm:${typography.body.sm}`}>
          <a
            href="/auth/password"
            className={`${colors.text.primary} decoration-current/50 underline hover:decoration-current`}
          >
            <strong className={`font-medium ${colors.text.primary}`}>Forgot your password?</strong>
          </a>
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <p className={`text-center ${typography.body.base} ${colors.text.muted} sm:${typography.body.sm}`}>
        Don&apos;t have an account?{' '}
        <a
          href="/auth/signup"
          className={`${colors.text.primary} decoration-current/50 underline hover:decoration-current`}
        >
          <strong className={`font-medium ${colors.text.primary}`}>Sign up</strong>
        </a>
      </p>
    </form>
  )
}

// Named exportとDefault exportの両方をサポート
export const LoginForm = LoginFormComponent
export default LoginFormComponent
