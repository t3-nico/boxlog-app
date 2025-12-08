'use client'

import { useCallback, useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import QRCode from 'qrcode'

import { createClient } from '@/lib/supabase/client'

interface MFAState {
  hasMFA: boolean
  showMFASetup: boolean
  qrCode: string | null
  secret: string | null
  factorId: string | null
  verificationCode: string
  error: string | null
  success: string | null
  isLoading: boolean
}

interface UseMFAReturn extends MFAState {
  setVerificationCode: (code: string) => void
  enrollMFA: () => Promise<void>
  verifyMFA: () => Promise<void>
  disableMFA: () => Promise<void>
  cancelSetup: () => void
}

/**
 * MFA（二段階認証）管理フック
 *
 * Supabase MFA APIを使用して、TOTP認証の登録・検証・無効化を行う
 */
export function useMFA(): UseMFAReturn {
  const t = useTranslations()
  const [hasMFA, setHasMFA] = useState(false)
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // MFA状態チェック
  const checkMFAStatus = useCallback(async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (factors && factors.totp.length > 0) {
        const verifiedFactor = factors.totp.find((f) => f.status === 'verified')
        setHasMFA(!!verifiedFactor)
      }
    } catch (err) {
      console.error('MFA status check error:', err)
    }
  }, [supabase])

  // 初回マウント時にMFA状態チェック
  useEffect(() => {
    checkMFAStatus()
  }, [checkMFAStatus])

  // MFA登録開始
  const enrollMFA = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (enrollError) {
        throw new Error(`${t('errors.mfa.enrollFailed')}: ${enrollError.message}`)
      }

      if (data) {
        setFactorId(data.id)
        setSecret(data.totp.secret)
        const qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri)
        setQrCode(qrCodeDataUrl)
        setShowMFASetup(true)
      } else {
        throw new Error(t('errors.mfa.dataNotFound'))
      }
    } catch (err) {
      console.error('MFA enrollment error:', err)
      const errorMessage = err instanceof Error ? err.message : t('errors.mfa.setupFailed')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, t])

  // MFA検証
  const verifyMFA = useCallback(async () => {
    if (!factorId || !verificationCode) {
      setError(t('errors.mfa.enterCode'))
      return
    }

    if (verificationCode.length !== 6) {
      setError(t('errors.mfa.codeLength'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // enrollment時はchallengeを発行してからverifyする
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) {
        throw new Error(`${t('errors.mfa.challengeFailed')}: ${challengeError.message}`)
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      })

      if (verifyError) {
        throw new Error(`${t('errors.mfa.verifyFailed')}: ${verifyError.message}`)
      }

      // セッションを更新（AAL2に昇格）
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session) {
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      }

      setSuccess(t('errors.mfa.enabled'))
      setHasMFA(true)
      setShowMFASetup(false)
      setVerificationCode('')
      setQrCode(null)
      setSecret(null)
      setFactorId(null)

      await checkMFAStatus()
    } catch (err) {
      console.error('MFA verification error:', err)
      const errorMessage = err instanceof Error ? err.message : t('errors.mfa.verificationFailed')
      setError(errorMessage)
      setVerificationCode('')
    } finally {
      setIsLoading(false)
    }
  }, [factorId, verificationCode, supabase, checkMFAStatus, t])

  // MFA無効化
  const disableMFA = useCallback(async () => {
    const code = window.prompt(t('errors.mfa.disablePrompt'))
    if (!code || code.length !== 6) {
      setError(t('errors.mfa.enterCode'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()

      if (listError) {
        throw new Error(`${t('errors.mfa.factorListFailed')}: ${listError.message}`)
      }

      if (!factors || factors.totp.length === 0) {
        setError(t('errors.mfa.noFactorFound'))
        return
      }

      const verifiedFactor = factors.totp.find((f) => f.status === 'verified')

      if (!verifiedFactor) {
        setError(t('errors.mfa.noVerifiedFactor'))
        return
      }

      // MFAチャレンジを実行してAAL2に昇格
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      })

      if (challengeError) {
        throw new Error(`${t('errors.mfa.challengeFailed')}: ${challengeError.message}`)
      }

      // チャレンジを検証してAAL2に昇格
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code: code,
      })

      if (verifyError) {
        throw new Error(t('errors.mfa.codeInvalid'))
      }

      // AAL2セッションでMFA無効化
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      })

      if (unenrollError) {
        throw new Error(`${t('errors.mfa.disableFailed')}: ${unenrollError.message}`)
      }

      setSuccess(t('errors.mfa.disabled'))
      setHasMFA(false)

      await checkMFAStatus()
    } catch (err) {
      console.error('MFA disable error:', err)
      const errorMessage = err instanceof Error ? err.message : t('errors.mfa.disableGeneralFailed')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, checkMFAStatus, t])

  // セットアップキャンセル
  const cancelSetup = useCallback(() => {
    setShowMFASetup(false)
    setQrCode(null)
    setSecret(null)
    setFactorId(null)
    setVerificationCode('')
  }, [])

  return {
    hasMFA,
    showMFASetup,
    qrCode,
    secret,
    factorId,
    verificationCode,
    error,
    success,
    isLoading,
    setVerificationCode,
    enrollMFA,
    verifyMFA,
    disableMFA,
    cancelSetup,
  }
}
