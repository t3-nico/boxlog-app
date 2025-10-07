// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
'use client'

import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAuthContext } from '@/features/auth/contexts/AuthContext'
import { useI18n } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

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
  const [isDeleting, setIsDeleting] = useState(false)

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

  // jsx-no-bind optimization: Delete account handler
  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      'この操作は取り消すことができません。すべてのデータが完全に削除されます。本当にアカウントを削除しますか？'
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      // アカウント削除ロジック（実際の実装は後で）
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('Deleting account')
      alert(t('settings.account.deleteNotImplemented'))
    } catch (err) {
      console.error('Account deletion error:', err)
      alert(t('settings.account.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }, [])

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
      <SettingsCard title={t('settings.account.profile')} description={t('settings.account.profileDesc')} isSaving={profile.isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.account.displayName')} description={t('settings.account.displayNameDesc')} required>
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
          <SettingField label={t('settings.account.profilePicture')} description={t('settings.account.profilePictureDesc')}>
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
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-4xl bg-neutral-100 dark:bg-neutral-800 border-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {profile.values.selectedIcon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
                <Button type="button" variant="ghost" onClick={handleAvatarRemove} className="text-red-600 dark:text-red-400">
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
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('settings.account.currentIcon')}</div>
              </div>
              <div className="grid grid-cols-10 gap-2 rounded-lg border p-4 bg-neutral-50 dark:bg-neutral-900">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={createIconSelectHandler(icon)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border text-2xl transition-all duration-200 hover:scale-110",
                      profile.values.selectedIcon === icon
                        ? "bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-700"
                        : "bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
          {passwordError ? <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? t('settings.account.updatingPassword') : t('settings.account.updatePassword')}
            </Button>
          </div>
        </form>
      </SettingsCard>

      {/* Two-Factor Authentication Section */}
      <SettingsCard title={t('settings.account.twoFactor')} description={t('settings.account.twoFactorDesc')} isSaving={security.isSaving}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-base">{t('settings.account.enable2FA')}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {security.values.twoFactorEnabled
                ? t('settings.account.twoFactorEnabled')
                : t('settings.account.twoFactorPrompt')}
            </p>
          </div>
          <Switch checked={security.values.twoFactorEnabled} onCheckedChange={handleTwoFactorChange} />
        </div>

        {security.values.twoFactorEnabled != null && (
          <div className="mt-4 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('settings.account.twoFactorActive')}</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {t('settings.account.twoFactorProtection')}
            </p>
          </div>
        )}
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard
        title={<span className="text-red-600 dark:text-red-400">{t('settings.account.dangerZone')}</span>}
        description={t('settings.account.dangerZoneDesc')}
      >
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 rounded-lg">
          <div className="flex items-start justify-between p-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 h-2 w-2 animate-pulse rounded-full"></div>
                <div className="text-red-700 dark:text-red-300 font-medium">アカウント削除</div>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                ⚠️ <strong>この操作は取り消すことができません。</strong>
                <br />
                アカウントとすべての関連データが完全に削除されます。
              </p>
              <ul className="text-red-700 dark:text-red-300 ml-4 space-y-1 text-xs">
                <li>• すべてのタスクとプロジェクトが削除されます</li>
                <li>• プロフィールと設定が削除されます</li>
                <li>• この操作は即座に実行され、取り消すことができません</li>
              </ul>
            </div>
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              variant="destructive"
              className="ml-4"
            >
              {isDeleting ? '削除中...' : '🗑️ アカウント削除'}
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

export default AccountSettings
