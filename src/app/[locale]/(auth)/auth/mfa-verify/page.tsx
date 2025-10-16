'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { createClient } from '@/lib/supabase/client'

export default function MFAVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()

  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)

  useEffect(() => {
    // ログイン後にMFAチャレンジを発行
    checkMFARequired()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkMFARequired = async () => {
    try {
      console.log('MFA検証ページ: ファクターをチェック中...')
      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (factors && factors.totp.length > 0) {
        // 最初の有効なTOTPファクターを使用
        const verifiedFactor = factors.totp.find((f) => f.status === 'verified')
        if (verifiedFactor) {
          console.log('検証済みファクター発見:', verifiedFactor.id)
          setFactorId(verifiedFactor.id)

          // MFAチャレンジを発行（公式ベストプラクティス）
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          })

          if (challengeError) {
            console.error('Challenge error:', challengeError)
            setError('MFAチャレンジの作成に失敗しました')
            return
          }

          if (challengeData) {
            console.log('チャレンジ作成成功:', challengeData.id)
            setChallengeId(challengeData.id)
          }
        } else {
          // MFAが設定されていない場合はリダイレクト
          console.log('検証済みファクターなし、カレンダーへリダイレクト')
          router.push('/calendar')
        }
      } else {
        // MFAが設定されていない場合はリダイレクト
        console.log('TOTPファクターなし、カレンダーへリダイレクト')
        router.push('/calendar')
      }
    } catch (err) {
      console.error('MFA check error:', err)
      setError('MFA状態の確認に失敗しました')
    }
  }

  const handleVerify = async () => {
    if (!factorId || !challengeId || !verificationCode) {
      setError('6桁のコードを入力してください')
      return
    }

    if (verificationCode.length !== 6) {
      setError('コードは6桁である必要があります')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      console.log('MFA検証開始:', { factorId, challengeId, codeLength: verificationCode.length })

      // 公式ベストプラクティス: 保存済みのchallengeIdを使用
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verificationCode,
      })

      if (verifyError) {
        console.error('Verify error:', verifyError)
        throw new Error(verifyError.message)
      }

      console.log('MFA検証成功:', verifyData)

      // 検証成功、次のページへリダイレクト
      const next = searchParams.get('next') || `/${locale}/calendar`
      router.refresh()
      router.push(next)
    } catch (err) {
      console.error('Verification error:', err)
      const errorMessage = err instanceof Error ? err.message : '無効なコードです。もう一度お試しください'
      setError(errorMessage)
      setVerificationCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full md:max-w-xl">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
                <p className="text-muted-foreground text-balance">
                  Enter the 6-digit code from your authenticator app to continue
                </p>
              </div>

              {error && (
                <div className="text-destructive text-center text-sm" role="alert">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel className="text-center">Verification Code</FieldLabel>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                    onComplete={handleVerify}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </Field>

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

              <div className="bg-muted/50 rounded-lg p-3 text-center text-sm">
                <p className="text-muted-foreground text-xs">
                  Don&apos;t have access to your authenticator app?
                  <br />
                  <a href="/settings/security/mfa" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
