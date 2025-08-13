'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '../contexts/AuthContext'
import { Logo } from '@/app/logo'
import { Button } from '@/components/shadcn-ui/button'
import { GoogleIcon, AppleIcon } from '@/components/custom'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Label } from '@/components/shadcn-ui/label'
import { Heading } from '@/components/custom'
import { Input } from '@/components/shadcn-ui/input'

function LoginFormComponent({ localMode = false }: { localMode?: boolean }) {
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
      console.error("LoginForm handleSubmit catch error:", err)
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
            <p className="mt-2 text-sm text-muted-foreground">
              ローカル専用モード
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "起動中..." : "アプリを開始"}
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
        <Button
          type="button"
          variant="outline"
          onClick={() => handleProviderSignIn('google')}
          className="w-full"
        >
          <GoogleIcon data-slot="icon" className="size-5" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleProviderSignIn('apple')}
          className="w-full"
        >
          <AppleIcon data-slot="icon" className="size-5" />
          Continue with Apple
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-600 font-bold text-lg text-base/6 sm:text-sm/6">{error}</p>}
      <div className="flex items-center justify-between">
        <CheckboxField>
          <Checkbox name="remember" />
          <Label>Remember me</Label>
        </CheckboxField>
        <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
          <a href="/auth/password" className="text-zinc-950 underline decoration-zinc-950/50 data-hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-hover:decoration-white">
            <strong className="font-medium text-zinc-950 dark:text-white">Forgot your password?</strong>
          </a>
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <p className="text-center text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <a href="/auth/signup" className="text-zinc-950 underline decoration-zinc-950/50 data-hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-hover:decoration-white">
          <strong className="font-medium text-zinc-950 dark:text-white">Sign up</strong>
        </a>
      </p>
    </form>
  )
}

// Named exportとDefault exportの両方をサポート
export const LoginForm = LoginFormComponent
export default LoginFormComponent
