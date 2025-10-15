// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
'use client'

import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/features/auth/contexts/AuthContext'
import { useI18n } from '@/features/i18n/lib/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

import { AccountDeletionDialog } from './account-deletion-dialog'
import { DataExport } from './data-export'
import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface ProfileSettings {
  displayName: string
  email: string
  selectedIcon: string
  uploadedAvatar: string | null
}

interface SecuritySettings {
  twoFactorEnabled: boolean
}

const AccountSettings = () => {
  const { user } = useAuthContext()
  const { t } = useI18n()
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

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

  // アイコンの選択肢
  const availableIcons = [
    '👤',
    '😀',
    '😎',
    '🤓',
    '🧑‍💻',
    '👨‍💼',
    '👩‍💼',
    '🎨',
    '🎯',
    '🚀',
    '💡',
    '🔥',
    '⭐',
    '🎉',
    '💪',
    '🎸',
    '🎮',
    '📚',
    '☕',
    '🌟',
    '🦄',
    '🐱',
    '🐶',
    '🦊',
    '🐼',
    '🦁',
    '🐯',
    '🐸',
    '🦋',
    '🌈',
  ]

  // プロフィール設定の自動保存
  const profile = useAutoSaveSettings<ProfileSettings>({
    initialValues: {
      displayName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      selectedIcon: user?.user_metadata?.profile_icon || '👤',
      uploadedAvatar: user?.user_metadata?.avatar_url || null,
    },
    onSave: async (values) => {
      // プロフィール更新API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 800))
      console.log('Saving profile:', values)
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
        displayName: user.user_metadata?.full_name || '',
        email: user.email || '',
        selectedIcon: user.user_metadata?.profile_icon || '👤',
        uploadedAvatar: user.user_metadata?.avatar_url || null,
      })
      setUploadedAvatar(user.user_metadata?.avatar_url || null)
    }
  }, [user, profile])

  // jsx-no-bind optimization: Password save handler
  const handlePasswordSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (newPassword !== confirmPassword) {
        setPasswordError('パスワードが一致しません')
        return
      }
      if (newPassword.length < 6) {
        setPasswordError('パスワードは6文字以上で入力してください')
        return
      }

      setPasswordError(null)
      setIsPasswordLoading(true)

      try {
        // パスワード更新ロジック（実際の実装は後で）
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log('Updating password')

        // 成功時はフォームをリセット
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        alert(t('settings.account.passwordUpdated'))
      } catch (err) {
        console.error('Password update error:', err)
        setPasswordError('予期しないエラーが発生しました')
      } finally {
        setIsPasswordLoading(false)
      }
    },
    [newPassword, confirmPassword]
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
    const confirmed = window.confirm('2段階認証を無効にしますか？セキュリティが低下します。')
    if (!confirmed) return

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

  // jsx-no-bind optimization: Avatar remove handler
  const handleAvatarRemove = useCallback(() => {
    setUploadedAvatar(null)
    profile.updateValue('uploadedAvatar', null)
  }, [profile])

  // Profile form handlers
  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      profile.updateValue('displayName', e.target.value)
    },
    [profile]
  )

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      profile.updateValue('email', e.target.value)
    },
    [profile]
  )

  // Dynamic icon select handler
  const createIconSelectHandler = useCallback(
    (icon: string) => {
      return () => profile.updateValue('selectedIcon', icon)
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
          <SettingField
            label={t('settings.account.displayName')}
            description={t('settings.account.displayNameDesc')}
            required
          >
            <Input
              value={profile.values.displayName}
              onChange={handleDisplayNameChange}
              placeholder={t('settings.account.displayNamePlaceholder')}
              required
            />
          </SettingField>

          <SettingField label={t('settings.account.email')} description={t('settings.account.emailDesc')} required>
            <Input
              type="email"
              value={profile.values.email}
              onChange={handleEmailChange}
              placeholder={t('settings.account.emailPlaceholder')}
              required
            />
          </SettingField>

          {/* Profile Picture Section */}
          <SettingField
            label={t('settings.account.profilePicture')}
            description={t('settings.account.profilePictureDesc')}
          >
            {/* Current Avatar Display */}
            <div className="mb-4 flex items-center gap-4">
              {uploadedAvatar ? (
                <Image
                  src={uploadedAvatar}
                  alt={t('settings.account.profilePictureAlt')}
                  width={64}
                  height={64}
                  className="rounded-full border-2 object-cover"
                  style={{ borderColor: 'var(--border)' }}
                  sizes="64px"
                />
              ) : (
                <div className="bg-muted border-border flex h-16 w-16 items-center justify-center rounded-full border-2 text-4xl">
                  {profile.values.selectedIcon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-muted-foreground text-sm">
                  {uploadedAvatar ? t('settings.account.usingCustomImage') : t('settings.account.usingEmojiIcon')}
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={isUploading}>
                {isUploading ? t('settings.account.uploading') : t('settings.account.uploadImage')}
              </Button>
              {uploadedAvatar != null && (
                <Button type="button" variant="ghost" onClick={handleAvatarRemove} className="text-destructive">
                  {t('settings.account.remove')}
                </Button>
              )}
            </div>
          </SettingField>

          {/* アイコン選択セクション */}
          {!uploadedAvatar && (
            <SettingField label={t('settings.account.profileIcon')} description={t('settings.account.profileIconDesc')}>
              <div className="mb-4 flex items-center gap-4">
                <div className="text-4xl">{profile.values.selectedIcon}</div>
                <div className="text-muted-foreground text-sm">{t('settings.account.currentIcon')}</div>
              </div>
              <div className="border-border bg-muted grid grid-cols-10 gap-2 rounded-lg border p-4">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={createIconSelectHandler(icon)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border text-2xl transition-all duration-200 hover:scale-110',
                      profile.values.selectedIcon === icon
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-700'
                        : 'bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                    )}
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </SettingField>
          )}
        </div>
      </SettingsCard>

      {/* Password Section */}
      <SettingsCard title={t('settings.account.password')} description={t('settings.account.passwordDesc')}>
        <form onSubmit={handlePasswordSave} className="space-y-2">
          <Input
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder={t('settings.account.currentPassword')}
            required
          />
          <Input
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder={t('settings.account.newPassword')}
            required
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder={t('settings.account.confirmPassword')}
            required
          />
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="max-w-[150px] text-center text-lg tracking-widest"
                    />
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
