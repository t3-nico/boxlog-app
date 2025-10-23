// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
'use client'

import { useCallback, useEffect, useState } from 'react'

import { Eye, EyeOff, InfoIcon } from 'lucide-react'
import Image from 'next/image'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import { addPasswordToHistory, isPasswordReused } from '@/lib/auth/password-history'
import { checkPasswordPwned } from '@/lib/auth/pwned-password'
import { createClient } from '@/lib/supabase/client'
import { deleteAvatar, uploadAvatar } from '@/lib/supabase/storage'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

import { AccountDeletionDialog } from './account-deletion-dialog'
import { DataExport } from './data-export'
import { EmailChangeDialog } from './email-change-dialog'
import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface ProfileSettings {
  username: string
  email: string
  uploadedAvatar: string | null
}

interface SecuritySettings {
  twoFactorEnabled: boolean
}

const AccountSettings = () => {
  const user = useAuthStore((state) => state.user)
  const { t } = useI18n()
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // Email change dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  // MFA関連のstate
  const [hasMFA, setHasMFA] = useState(false)
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null)
  const [isMFALoading, setIsMFALoading] = useState(false)

  const supabase = createClient()

  // プロフィール設定の自動保存
  const profile = useAutoSaveSettings<ProfileSettings>({
    initialValues: {
      username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      uploadedAvatar: user?.user_metadata?.avatar_url || null,
    },
    onSave: async (values) => {
      if (!user?.id) {
        throw new Error('ユーザーIDが見つかりません')
      }

      // Supabase直接でプロフィール更新
      // @ts-expect-error - Supabase型定義の問題
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          avatar_url: values.uploadedAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        throw new Error(`プロフィールの更新に失敗しました: ${profileError.message}`)
      }

      // auth.users の user_metadata も更新
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: values.username,
          avatar_url: values.uploadedAvatar,
        },
      })

      if (authError) {
        console.error('Auth metadata update error:', authError)
      }
    },
    successMessage: t('settings.account.profileUpdated'),
    debounceMs: 1000,
  })

  // セキュリティ設定の自動保存
  const security = useAutoSaveSettings<SecuritySettings>({
    initialValues: {
      twoFactorEnabled: false,
    },
    onSave: async (values) => {
      // セキュリティ設定更新API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 600))
      console.log('Saving security settings:', values)
    },
    successMessage: '2FA設定を更新しました',
    debounceMs: 500,
  })

  // ユーザー情報を初期値として設定
  useEffect(() => {
    if (user) {
      profile.updateValues({
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        uploadedAvatar: user.user_metadata?.avatar_url || null,
      })
      setUploadedAvatar(user.user_metadata?.avatar_url || null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email])

  // jsx-no-bind optimization: Password save handler
  const handlePasswordSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // バリデーション
      if (newPassword !== confirmPassword) {
        setPasswordError(t('settings.account.passwordMismatch'))
        return
      }
      if (newPassword.length < 8) {
        setPasswordError(t('settings.account.passwordMinLength'))
        return
      }

      setPasswordError(null)
      setIsPasswordLoading(true)

      try {
        // ステップ1: 現在のパスワードで再認証（セキュリティ強化）
        if (!user?.email) {
          throw new Error('メールアドレスが見つかりません')
        }

        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })

        if (reAuthError) {
          throw new Error(t('settings.account.passwordIncorrect'))
        }

        // ステップ2: パスワード履歴チェック（OWASP推奨）
        if (!user?.id) {
          throw new Error('ユーザーIDが見つかりません')
        }

        const isReused = await isPasswordReused(user.id, newPassword)
        if (isReused) {
          throw new Error(t('settings.account.passwordReused'))
        }

        // ステップ2.5: 漏洩パスワードチェック（NIST推奨）
        const isPwned = await checkPasswordPwned(newPassword)
        if (isPwned) {
          throw new Error(t('settings.account.passwordPwned'))
        }

        // ステップ3: パスワード更新
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (error) {
          throw new Error(error.message)
        }

        // ステップ4: パスワード履歴に追加（OWASP推奨）
        await addPasswordToHistory(user.id, newPassword)

        // ステップ5: 他のデバイスのセッションを無効化（セキュリティ強化）
        // Supabase v2.149+では自動的にセッション無効化されるが、明示的に実行
        await supabase.auth.signOut({ scope: 'others' })

        // 成功時はフォームをリセット
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        alert(t('settings.account.passwordUpdated'))
      } catch (err) {
        console.error('Password update error:', err)
        const errorMessage = err instanceof Error ? err.message : t('settings.account.passwordUpdateFailed')
        setPasswordError(errorMessage)
      } finally {
        setIsPasswordLoading(false)
      }
    },
    [currentPassword, newPassword, confirmPassword, user?.email, user?.id, t, supabase]
  )

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

  // MFA登録開始
  const handleEnrollMFA = useCallback(async () => {
    setIsMFALoading(true)
    setMfaError(null)
    setMfaSuccess(null)

    try {
      console.log('MFA登録を開始...')

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (error) {
        console.error('Enrollment error:', error)
        throw new Error(`登録エラー: ${error.message}`)
      }

      if (data) {
        console.log('MFAファクター作成成功:', data.id)
        setFactorId(data.id)
        setSecret(data.totp.secret)
        const qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri)
        setQrCode(qrCodeDataUrl)
        setShowMFASetup(true)
      } else {
        throw new Error('MFAデータが取得できませんでした')
      }
    } catch (err) {
      console.error('MFA enrollment error:', err)
      const errorMessage = err instanceof Error ? err.message : '2段階認証の設定開始に失敗しました'
      setMfaError(errorMessage)
    } finally {
      setIsMFALoading(false)
    }
  }, [supabase])

  // MFA検証
  const handleVerifyMFA = useCallback(async () => {
    if (!factorId || !verificationCode) {
      setMfaError('6桁のコードを入力してください')
      return
    }

    if (verificationCode.length !== 6) {
      setMfaError('コードは6桁で入力してください')
      return
    }

    setIsMFALoading(true)
    setMfaError(null)

    try {
      console.log('MFA検証を開始... Factor ID:', factorId)

      // enrollment時はchallengeを発行してからverifyする
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) {
        console.error('Challenge error:', challengeError)
        throw new Error(`チャレンジエラー: ${challengeError.message}`)
      }

      console.log('Challenge作成成功:', challengeData.id)

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      })

      if (verifyError) {
        console.error('Verify error:', verifyError)
        throw new Error(`検証エラー: ${verifyError.message}`)
      }

      console.log('MFA enrollment verified successfully:', verifyData)

      // ✅ 重要: verify成功後、セッションを更新（AAL2に昇格）
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionData?.session) {
        console.log('セッション更新成功。AALレベル確認...')
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        console.log('現在のAALレベル:', aalData)
      }

      setMfaSuccess('2段階認証が有効になりました！')
      setHasMFA(true)
      setShowMFASetup(false)
      setVerificationCode('')
      setQrCode(null)
      setSecret(null)
      setFactorId(null)

      // 状態を再確認
      await checkMFAStatus()
    } catch (err) {
      console.error('MFA verification error:', err)
      const errorMessage = err instanceof Error ? err.message : 'コードの検証に失敗しました。もう一度お試しください'
      setMfaError(errorMessage)
      setVerificationCode('')
    } finally {
      setIsMFALoading(false)
    }
  }, [factorId, verificationCode, supabase, checkMFAStatus])

  // MFA無効化
  const handleDisableMFA = useCallback(async () => {
    const code = window.prompt('2段階認証を無効にするには、認証アプリの6桁のコードを入力してください:')
    if (!code || code.length !== 6) {
      setMfaError('6桁のコードを入力してください')
      return
    }

    setIsMFALoading(true)
    setMfaError(null)
    setMfaSuccess(null)

    try {
      console.log('MFA無効化を開始...')

      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()

      if (listError) {
        console.error('Factor list error:', listError)
        throw new Error(`ファクター取得エラー: ${listError.message}`)
      }

      console.log('取得したファクター:', factors)

      if (!factors || factors.totp.length === 0) {
        setMfaError('有効なMFAファクターが見つかりません')
        return
      }

      const verifiedFactor = factors.totp.find((f) => f.status === 'verified')

      if (!verifiedFactor) {
        setMfaError('検証済みのMFAファクターが見つかりません')
        return
      }

      console.log('無効化するファクターID:', verifiedFactor.id)

      // まずMFAチャレンジを実行してAAL2に昇格
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      })

      if (challengeError) {
        console.error('Challenge error:', challengeError)
        throw new Error(`チャレンジエラー: ${challengeError.message}`)
      }

      // チャレンジを検証してAAL2に昇格
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code: code,
      })

      if (verifyError) {
        console.error('Verify error:', verifyError)
        throw new Error('コードが正しくありません。もう一度お試しください。')
      }

      console.log('AAL2に昇格成功。MFAを無効化します...')

      // AAL2セッションでMFA無効化
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      })

      if (unenrollError) {
        console.error('Unenroll error:', unenrollError)
        throw new Error(`無効化エラー: ${unenrollError.message}`)
      }

      console.log('MFA無効化成功')
      setMfaSuccess('2段階認証を無効にしました')
      setHasMFA(false)

      // 状態を再確認
      await checkMFAStatus()
    } catch (err) {
      console.error('MFA disable error:', err)
      const errorMessage = err instanceof Error ? err.message : '2段階認証の無効化に失敗しました'
      setMfaError(errorMessage)
    } finally {
      setIsMFALoading(false)
    }
  }, [supabase, checkMFAStatus])

  // 初回マウント時にMFA状態チェック
  useEffect(() => {
    checkMFAStatus()
  }, [checkMFAStatus])

  // jsx-no-bind optimization: Avatar upload handler
  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user?.id) return

      setIsUploading(true)
      try {
        // Supabase Storageにアップロード
        const publicUrl = await uploadAvatar(file, user.id)

        // プロフィールを更新
        setUploadedAvatar(publicUrl)
        profile.updateValue('uploadedAvatar', publicUrl)
        setAvatarFile(file)
      } catch (error) {
        console.error('Avatar upload error:', error)
        const errorMessage = error instanceof Error ? error.message : 'アバター画像のアップロードに失敗しました'
        alert(errorMessage)
      } finally {
        setIsUploading(false)
      }
    },
    [profile, user?.id]
  )

  // jsx-no-bind optimization: Avatar remove handler
  const handleAvatarRemove = useCallback(async () => {
    if (!user?.id) return

    const confirmed = window.confirm('アバター画像を削除しますか？')
    if (!confirmed) return

    setIsUploading(true)
    try {
      // Supabase Storageから削除
      await deleteAvatar(user.id)

      // プロフィールを更新
      setUploadedAvatar(null)
      setAvatarFile(null)
      profile.updateValue('uploadedAvatar', null)
    } catch (error) {
      console.error('Avatar delete error:', error)
      const errorMessage = error instanceof Error ? error.message : 'アバター画像の削除に失敗しました'
      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [profile, user?.id])

  // Profile form handlers
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('Username changing:', e.target.value)
      profile.updateValue('username', e.target.value)
    },
    [profile]
  )

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      profile.updateValue('email', e.target.value)
    },
    [profile]
  )

  // Password form handlers
  const handleCurrentPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value)
  }, [])

  const handleNewPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
  }, [])

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }, [])

  // Security settings handler
  const handleTwoFactorChange = useCallback(
    (checked: boolean) => {
      security.updateValue('twoFactorEnabled', checked)
    },
    [security]
  )

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <SettingsCard
        title={t('settings.account.profile')}
        description={t('settings.account.profileDesc')}
        isSaving={profile.isSaving}
      >
        <div className="space-y-4">
          {/* Profile Picture Section */}
          <SettingField
            label={t('settings.account.profilePicture')}
            description={t('settings.account.profilePictureDesc')}
          >
            <div className="flex items-start gap-6">
              {/* Avatar Preview */}
              <div className="group relative">
                {uploadedAvatar ? (
                  <div className="relative">
                    <Image
                      src={uploadedAvatar}
                      alt={t('settings.account.profilePictureAlt')}
                      width={80}
                      height={80}
                      className="ring-border rounded-full object-cover ring-2"
                      sizes="80px"
                    />
                    {/* Hover overlay */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="text-xs font-medium text-white">変更</span>
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="avatar-upload"
                    className="border-border bg-muted hover:bg-muted/80 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors"
                  >
                    <span className="text-muted-foreground text-xs">+</span>
                  </label>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-1 flex-col gap-3">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                      <span>{isUploading ? 'アップロード中...' : '画像を選択'}</span>
                    </Button>
                  </label>
                  {uploadedAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAvatarRemove}
                      disabled={isUploading}
                      className="text-destructive hover:text-destructive"
                    >
                      削除
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">JPG, PNG、5MB以下</p>
              </div>
            </div>
          </SettingField>

          <SettingField label="ユーザー名" description="アプリ内で表示される名前です" required>
            <Input value={profile.values.username} onChange={handleUsernameChange} placeholder="username" required />
          </SettingField>
        </div>
      </SettingsCard>

      {/* Email Section */}
      <SettingsCard title={t('settings.account.email')} description="ログインとアカウント回復に使用されます">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{profile.values.email}</p>
            <p className="text-muted-foreground text-xs">確認済み</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
            変更
          </Button>
        </div>
      </SettingsCard>

      {/* Email Change Dialog */}
      <EmailChangeDialog open={showEmailDialog} onOpenChange={setShowEmailDialog} currentEmail={profile.values.email} />

      {/* Password Section */}
      <SettingsCard title={t('settings.account.password')} description={t('settings.account.passwordDesc')}>
        <form onSubmit={handlePasswordSave} className="space-y-2">
          <InputGroup>
            <InputGroupInput
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              placeholder={t('settings.account.currentPassword')}
              required
              minLength={8}
              maxLength={64}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    variant="ghost"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    size="icon-xs"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>{showCurrentPassword ? 'パスワードを隠す' : 'パスワードを表示'}</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton variant="ghost" aria-label="Info" size="icon-xs">
                    <InfoIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>現在のパスワードを入力してください</p>
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupInput
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder={t('settings.account.newPassword')}
              required
              minLength={8}
              maxLength={64}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    variant="ghost"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    size="icon-xs"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>{showNewPassword ? 'パスワードを隠す' : 'パスワードを表示'}</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton variant="ghost" aria-label="Info" size="icon-xs">
                    <InfoIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('settings.account.passwordMinLength')}</p>
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupInput
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder={t('settings.account.confirmPassword')}
              required
              minLength={8}
              maxLength={64}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    variant="ghost"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    size="icon-xs"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>{showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <InputGroupButton variant="ghost" aria-label="Info" size="icon-xs">
                    <InfoIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>新しいパスワードを再入力してください</p>
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>

          {passwordError ? <p className="text-destructive text-sm">{passwordError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? t('settings.account.updatingPassword') : t('settings.account.updatePassword')}
            </Button>
          </div>
        </form>
      </SettingsCard>

      {/* Two-Factor Authentication Section */}
      <SettingsCard
        title={t('settings.account.twoFactor')}
        description={t('settings.account.twoFactorDesc')}
        isSaving={isMFALoading}
      >
        <div className="space-y-4">
          {/* エラー・成功メッセージ */}
          {mfaError && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
              {mfaError}
            </div>
          )}
          {mfaSuccess && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
              {mfaSuccess}
            </div>
          )}

          {/* MFA未設定時の表示 */}
          {!hasMFA && !showMFASetup && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-medium">Two-Factor Authentication (MFA)</div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  認証アプリを使って、ログイン時に追加のセキュリティ層を追加します
                </p>
              </div>
              <Button type="button" variant="outline" onClick={handleEnrollMFA} disabled={isMFALoading}>
                {isMFALoading ? '読み込み中...' : 'MFAを有効にする'}
              </Button>
            </div>
          )}

          {/* MFA設定中の表示 */}
          {!hasMFA && showMFASetup && qrCode && (
            <div className="border-border bg-card space-y-4 rounded-lg border p-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">2段階認証を設定</h3>
                <p className="text-muted-foreground text-sm">
                  以下の手順に従って、認証アプリで2段階認証を設定してください。
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">1. QRコードをスキャン</p>
                  <div className="border-border flex justify-center rounded-lg border bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Google Authenticator、Microsoft Authenticator、Authyなどの認証アプリでスキャンしてください
                  </p>
                </div>

                {secret && (
                  <div>
                    <p className="mb-2 text-sm font-medium">またはこのコードを手動で入力:</p>
                    <code className="bg-muted block rounded p-2 text-xs">{secret}</code>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-medium">2. 認証アプリに表示された6桁のコードを入力</p>
                  <div className="flex items-center gap-4">
                    <InputOTP maxLength={6} value={verificationCode} onChange={(value) => setVerificationCode(value)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <Button onClick={handleVerifyMFA} disabled={isMFALoading || verificationCode.length !== 6}>
                      {isMFALoading ? '検証中...' : '確認'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMFASetup(false)
                        setQrCode(null)
                        setSecret(null)
                        setFactorId(null)
                        setVerificationCode('')
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MFA有効時の表示 */}
          {hasMFA && (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    2段階認証が有効になっています
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500">
                  ログイン時に認証アプリで生成されるコードが必要になります
                </p>
              </div>

              <div className="flex justify-end">
                <Button variant="destructive" onClick={handleDisableMFA} disabled={isMFALoading}>
                  {isMFALoading ? '処理中...' : 'MFAを無効にする'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Data Export & Privacy Section */}
      <SettingsCard
        title={t('settings.account.dataExport.title')}
        description={t('settings.account.dataExport.description')}
      >
        <DataExport />
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard
        title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}
        description={t('settings.account.dangerZoneDesc')}
      >
        <AccountDeletionDialog />
      </SettingsCard>
    </div>
  )
}

export default AccountSettings
