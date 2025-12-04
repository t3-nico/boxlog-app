'use client'

import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { getErrorMessage } from '@/lib/errors'
import { createClient } from '@/lib/supabase/client'
import { deleteAvatar, uploadAvatar } from '@/lib/supabase/storage'
import { useTranslations } from 'next-intl'

import { useAutoSaveSettings } from '../../hooks/useAutoSaveSettings'
import { SettingField } from '../fields/SettingField'
import { SettingsCard } from '../SettingsCard'

interface ProfileSettings {
  username: string
  email: string
  uploadedAvatar: string | null
}

/**
 * プロフィールセクション
 *
 * アバター画像とユーザー名の編集
 */
export function ProfileSection() {
  const user = useAuthStore((state) => state.user)
  const t = useTranslations()
  const supabase = createClient()

  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user?.id) return

      setIsUploading(true)
      try {
        const publicUrl = await uploadAvatar(file, user.id)
        setUploadedAvatar(publicUrl)
        profile.updateValue('uploadedAvatar', publicUrl)
      } catch (error) {
        console.error('Avatar upload error:', error)
        alert(getErrorMessage(error, 'アバター画像のアップロードに失敗しました'))
      } finally {
        setIsUploading(false)
      }
    },
    [profile, user?.id]
  )

  const handleAvatarRemove = useCallback(async () => {
    if (!user?.id) return

    const confirmed = window.confirm('アバター画像を削除しますか？')
    if (!confirmed) return

    setIsUploading(true)
    try {
      await deleteAvatar(user.id)
      setUploadedAvatar(null)
      profile.updateValue('uploadedAvatar', null)
    } catch (error) {
      console.error('Avatar delete error:', error)
      alert(getErrorMessage(error, 'アバター画像の削除に失敗しました'))
    } finally {
      setIsUploading(false)
    }
  }, [profile, user?.id])

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      profile.updateValue('username', e.target.value)
    },
    [profile]
  )

  return (
    <SettingsCard title={t('settings.account.profile')} isSaving={profile.isSaving}>
      <div className="space-y-4">
        {/* Profile Picture Section */}
        <SettingField label={t('settings.account.profilePicture')}>
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
                  className="border-border bg-muted hover:bg-muted flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors"
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
  )
}
