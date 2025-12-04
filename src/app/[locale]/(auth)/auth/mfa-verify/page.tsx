'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/features/i18n/lib/hooks'
import { createClient } from '@/lib/supabase/client'

export default function MFAVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || 'ja'
  const { t } = useI18n(locale as 'en' | 'ja')
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
      const next = searchParams?.get('next') || `/${locale}/calendar`
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
      <div className="w-full md:max-w-5xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="bg-primary/12 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold">{t('auth.mfaVerify.title')}</h1>
                    <p className="text-muted-foreground text-balance">{t('auth.mfaVerify.description')}</p>
                  </div>

                  {error && (
                    <div className="text-destructive text-center text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3">
                    <FieldLabel className="text-center">{t('auth.mfaVerify.verificationCode')}</FieldLabel>
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

                  <Field>
                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="w-full"
                    >
                      {isVerifying && <Spinner className="mr-2" />}
                      {isVerifying ? t('auth.mfaVerify.verifying') : t('auth.mfaVerify.verifyButton')}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    {t('auth.mfaVerify.lostAccess')}{' '}
                    <a href="#" className="hover:text-primary hover:underline">
                      {t('auth.mfaVerify.useRecoveryCode')}
                    </a>
                  </FieldDescription>

                  <FieldDescription className="text-center">
                    <a href={`/${locale}/auth/login`} className="hover:text-primary hover:underline">
                      {t('auth.mfaVerify.backToLogin')}
                    </a>
                  </FieldDescription>
                </FieldGroup>
              </div>
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/placeholder.svg"
                  alt="Image"
                  fill
                  className="object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            {t('auth.mfaVerify.termsAndPrivacy')} <a href="#">{t('auth.mfaVerify.termsOfService')}</a>{' '}
            {t('auth.mfaVerify.and')} <a href="#">{t('auth.mfaVerify.privacyPolicy')}</a>
            {t('auth.mfaVerify.agree')}
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
