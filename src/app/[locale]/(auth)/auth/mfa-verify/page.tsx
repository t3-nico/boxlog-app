'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function MFAVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)

  useEffect(() => {
    // ログイン後にMFAチャレンジを発行
    checkMFARequired()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkMFARequired = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (factors && factors.totp.length > 0) {
        // 最初の有効なTOTPファクターを使用
        const verifiedFactor = factors.totp.find((f) => f.status === 'verified')
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id)

          // MFAチャレンジを発行（これが重要！）
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          })

          if (challengeError) {
            console.error('Challenge error:', challengeError)
            setError('Failed to create MFA challenge')
          }
        } else {
          // MFAが設定されていない場合はリダイレクト
          router.push('/calendar')
        }
      } else {
        // MFAが設定されていない場合はリダイレクト
        router.push('/calendar')
      }
    } catch (err) {
      console.error('MFA check error:', err)
      setError('Failed to check MFA status')
    }
  }

  const handleVerify = async () => {
    if (!factorId || !verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // チャレンジを再度発行してから検証
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) throw challengeError

      // チャレンジIDを使って検証
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      })

      if (verifyError) throw verifyError

      // 検証成功、次のページへリダイレクト
      const next = searchParams.get('next') || '/calendar'
      router.refresh()
      router.push(next)
    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Invalid verification code')
      setVerificationCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerify()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground mt-2">Enter the 6-digit code from your authenticator app to continue</p>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
          {error && (
            <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="text-foreground block text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                className="mt-1 text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <Button onClick={handleVerify} disabled={isVerifying || verificationCode.length !== 6} className="w-full">
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have access to your authenticator app?
            <br />
            <a href="/settings/security/mfa" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
