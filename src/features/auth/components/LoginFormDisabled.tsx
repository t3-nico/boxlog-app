'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { useAuthContext } from '../contexts/AuthContext'

export const LoginForm = ({ className, ...props }: React.ComponentProps<'form'>) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithOAuth, user, error: authError } = useAuthContext()
  const router = useRouter()

  // 2FA関連のstate
  const [requiresMFA, setRequiresMFA] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')

  // MFAステータスのチェック
  const checkMFAStatus = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (error) {
        console.error('MFA status check error:', error)
        router.push('/calendar')
        return
      }

      // AAL1 = MFA未設定または未認証、AAL2 = MFA認証済み
      if (data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2') {
        // MFAが必要な場合、チャレンジを開始
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (factors?.totp && factors.totp.length > 0) {
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: factors.totp[0].id,
          })

          if (!challengeError && challengeData) {
            setFactorId(factors.totp[0].id)
            setChallengeId(challengeData.id)
            setRequiresMFA(true)
            return
          }
        }
      }

      // MFAが不要またはすでに認証済みの場合はリダイレクト
      router.push('/calendar')
    } catch (err) {
      console.error('Unexpected MFA check error:', err)
      router.push('/calendar')
    }
  }, [router])

  // 認証成功後のリダイレクト
  useEffect(() => {
    if (user) {
      checkMFAStatus()
    }
  }, [user, checkMFAStatus])

  // authErrorが変更されたらLoginFormのerrorステートを更新
  useEffect(() => {
    setError(authError)
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      console.error('LoginForm handleSubmit catch error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await signInWithOAuth('google')
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await signInWithOAuth('apple')
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  // MFA検証処理
  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mfaCode || mfaCode.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: mfaCode,
      })

      if (error) {
        setError('Invalid verification code')
        return
      }

      // MFA認証成功後はカレンダーページにリダイレクト
      router.push('/calendar')
    } catch (err) {
      console.error('MFA verify error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // MFAが必要な場合は2FA認証フォームを表示
  if (requiresMFA) {
    return (
      <form className={cn('flex flex-col gap-6', className)} onSubmit={handleMFAVerify} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-balance text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="mfaCode">Verification Code</Label>
            <Input
              id="mfaCode"
              type="text"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center font-mono text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>
          {error && <div className="text-destructive text-center text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setRequiresMFA(false)
              setMfaCode('')
              setFactorId('')
              setChallengeId('')
              setError(null)
            }}
            disabled={loading}
          >
            Back
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-balance text-sm">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="/auth/password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-destructive text-center text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleAppleSignIn} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Apple
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="/auth/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}
