'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { useAuthContext } from '../contexts/AuthContext'

// OAuth Provider Icons
const GoogleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5" {...props}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C35.9 2.5 30.1 0 24 0 15.5 0 8 5.9 3.5 14.5l7.4 5.9C12 15.9 17.5 9.5 24 9.5Z"
    />
    <path
      fill="#4285F4"
      d="M47.3 24.9c0-1.8-.2-3.6-.5-5.3H24v10h13.1c-.6 3-2.2 5.6-4.8 7.3l7.7 6C44.6 39.8 47.3 33.7 47.3 24.9Z"
    />
    <path
      fill="#FBBC05"
      d="M9.9 28.9a15 15 0 0 1-.5-4.9c0-1.7.3-3.4.8-5l-7.8-6.5A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.3-5.9Z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.6 0 12.2-2.2 16.3-6l-7.7-6c-2.1 1.4-4.9 2.3-8.6 2.3-6.6 0-12.1-4.4-14.1-10.4L2 32.8C5.4 41.5 12.9 48 24 48Z"
    />
  </svg>
)

const AppleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" {...props}>
    <path
      d="M16.5 1.5c-1.3 0-2.8.9-3.6 2-.8 1-1.4 2.5-1.1 3.9 1.5 0 3-.9 3.8-2 0.8-1 1.5-2.6 1.5-3.9Z"
      fill="currentColor"
    />
    <path
      d="M19 14.2c-.1-3 2.3-4.4 2.4-4.5-1.4-2-3.5-2.3-4.2-2.4-1.8-.2-3.4 1-4.3 1-1 0-2.6-1-4.2-.9-2.1 0-4.2 1.2-5.3 3-2.2 3.7-.6 9 1.7 12 1 1.4 2.1 3 3.7 2.9 1.5 0 2.1-1 4.1-1 2 0 2.5 1 4.2 1 1.7 0 2.7-1.5 3.6-2.8 1.1-1.7 1.5-3.3 1.5-3.4-0.1 0-3.3-1.2-3.4-4.9Z"
      fill="currentColor"
    />
  </svg>
)

export interface LoginFormProps extends React.ComponentPropsWithoutRef<'form'> {
  /** ローカル専用モード（認証スキップ） */
  localMode?: boolean
}

/**
 * ログインフォームコンポーネント
 *
 * shadcn/ui公式認証Block基準の実装
 *
 * @example
 * ```tsx
 * <LoginForm />
 * ```
 */
export function LoginForm({ localMode = false, className, ...props }: LoginFormProps) {
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
      setError(t('auth.errors.unexpectedError'))
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
            <p className="text-muted-foreground mt-2 text-sm">{t('auth.localMode.description')}</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.localMode.loading') : t('auth.loginForm.startApp')}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      {/* ヘッダー */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
        <p className="text-muted-foreground text-sm text-balance">{t('auth.login.description')}</p>
      </div>

      {/* OAuth */}
      <div className="grid gap-2">
        <Button type="button" variant="outline" onClick={() => handleProviderSignIn('google')} className="w-full">
          <GoogleIcon />
          {t('auth.login.continueWithGoogle')}
        </Button>
        <Button type="button" variant="outline" onClick={() => handleProviderSignIn('apple')} className="w-full">
          <AppleIcon />
          {t('auth.login.continueWithApple')}
        </Button>
      </div>

      {/* 区切り線 */}
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">{t('auth.login.orContinueWith')}</span>
      </div>

      {/* Email/Password */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">{t('auth.login.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.login.password')}</Label>
            <Link href="/auth/password" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t('auth.login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember" className="text-sm font-normal">
            {t('auth.login.rememberMe')}
          </Label>
        </div>

        {/* エラーメッセージ */}
        {error != null && <div className="text-destructive text-center text-sm">{error}</div>}

        {/* ログインボタン */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
        </Button>
      </div>

      {/* サインアップリンク */}
      <div className="text-center text-sm">
        {t('auth.login.noAccount')}{' '}
        <Link href="/auth/signup" className="underline underline-offset-4">
          {t('auth.login.signUp')}
        </Link>
      </div>
    </form>
  )
}

// Default export（後方互換性）
export default LoginForm
