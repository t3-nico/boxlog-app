'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function MFASetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // MFA状態
  const [hasMFA, setHasMFA] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)

  // 検証コード入力
  const [verificationCode, setVerificationCode] = useState('')

  // MFA状態を確認
  useEffect(() => {
    checkMFAStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkMFAStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // MFAファクターを取得
      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (factors && factors.totp.length > 0) {
        setHasMFA(true)
      }
    } catch (err) {
      console.error('MFA status check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // MFA登録開始
  const handleEnrollMFA = async () => {
    setIsEnrolling(true)
    setError(null)

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (enrollError) throw enrollError

      if (data) {
        setFactorId(data.id)
        setSecret(data.totp.secret)

        // QRコード生成
        const qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri)
        setQrCode(qrCodeDataUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll MFA')
    } finally {
      setIsEnrolling(false)
    }
  }

  // MFA検証
  const handleVerifyMFA = async () => {
    if (!factorId || !verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode,
      })

      if (verifyError) throw verifyError

      setSuccess('2-Factor Authentication enabled successfully!')
      setHasMFA(true)
      setQrCode(null)
      setSecret(null)
      setFactorId(null)
      setVerificationCode('')

      // 3秒後にリダイレクト
      setTimeout(() => {
        router.push('/settings')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setIsVerifying(false)
    }
  }

  // MFA無効化
  const handleUnenrollMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (factors && factors.totp.length > 0) {
        const factorToUnenroll = factors.totp[0]

        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: factorToUnenroll.id,
        })

        if (unenrollError) throw unenrollError

        setSuccess('2-Factor Authentication disabled successfully!')
        setHasMFA(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
        <p className="text-muted-foreground mt-2">Add an extra layer of security to your account</p>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 成功メッセージ */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-green-900 dark:bg-green-900/10 dark:text-green-400">
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* MFA未設定 */}
      {!hasMFA && !qrCode && (
        <div className="bg-card border-border space-y-4 rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary rounded-full p-3">
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
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Enable 2FA</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Use an authenticator app like Google Authenticator or Authy to generate verification codes.
              </p>
            </div>
          </div>

          <Button onClick={handleEnrollMFA} disabled={isEnrolling} className="w-full">
            {isEnrolling ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </Button>
        </div>
      )}

      {/* QRコード表示（登録中） */}
      {qrCode && (
        <div className="bg-card border-border space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-lg font-semibold">Scan QR Code</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Scan this QR code with your authenticator app, then enter the 6-digit code below.
            </p>
          </div>

          <div className="flex justify-center">
            <Image src={qrCode} alt="QR Code" className="rounded-lg border" width={256} height={256} unoptimized />
          </div>

          {secret && (
            <div className="bg-muted rounded-md p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium">Or enter this code manually:</p>
              <code className="block font-mono text-sm break-all">{secret}</code>
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
                className="mt-1"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleVerifyMFA}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify and Enable'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQrCode(null)
                  setSecret(null)
                  setFactorId(null)
                  setVerificationCode('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MFA設定済み */}
      {hasMFA && !qrCode && (
        <div className="bg-card border-border space-y-4 rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">2FA Enabled</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          </div>

          <Button variant="destructive" onClick={handleUnenrollMFA} className="w-full">
            Disable Two-Factor Authentication
          </Button>
        </div>
      )}

      <div className="border-border border-t pt-6">
        <Button variant="outline" onClick={() => router.push('/settings')}>
          Back to Settings
        </Button>
      </div>
    </div>
  )
}
