'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/ui/input'
import { SettingSection } from '@/components/settings-section'
import { Switch } from '@/components/ui/switch'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'

export default function AccountSettings() {
  const { user, updatePassword } = useAuthContext()
  const { success, error: showError } = useToast()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('👤')
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // アイコンの選択肢
  const availableIcons = [
    '👤', '😀', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🎨', '🎯', '🚀',
    '💡', '🔥', '⭐', '🎉', '💪', '🎸', '🎮', '📚', '☕', '🌟',
    '🦄', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐸', '🦋', '🌈'
  ]

  // ユーザー情報を初期値として設定
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '')
      setEmail(user.email || '')
      setSelectedIcon(user.user_metadata?.profile_icon || '👤')
      setUploadedAvatar(user.user_metadata?.avatar_url || null)
    }
  }, [user])

  // アバター画像のアップロード処理
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (2MB制限)
    if (file.size > 2 * 1024 * 1024) {
      showError("エラー", "ファイルサイズは2MB以下にしてください")
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      showError("エラー", "画像ファイルを選択してください")
      return
    }

    setIsUploading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // ファイル名を生成（ユーザーIDベース）
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${user?.id}-${Date.now()}.${fileExt}`

      // Supabase Storageにアップロード
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        showError("エラー", "アップロードに失敗しました")
        return
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setUploadedAvatar(publicUrl)
      success("成功", "アバター画像をアップロードしました")

    } catch (err) {
      console.error('Avatar upload error:', err)
      showError("エラー", "予期せぬエラーが発生しました")
    } finally {
      setIsUploading(false)
    }
  }

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Supabaseでプロフィール更新
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: name,
          profile_icon: selectedIcon,
          avatar_url: uploadedAvatar
        }
      })
      
      if (error) {
        showError("エラー", "プロフィールの更新に失敗しました")
        return
      }
      
      success("成功", "プロフィールを更新しました")
      
      // サイドバーを確実に更新するため、少し遅延してリロード
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error('Profile update error:', err)
      showError("エラー", "予期せぬエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('パスワードが一致しません')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('パスワードは6文字以上である必要があります')
      return
    }
    
    setPasswordError(null)
    setIsLoading(true)
    
    try {
      const { error } = await updatePassword(newPassword)
      
      if (error) {
        setPasswordError(error.message)
        return
      }
      
      // 成功時はフォームをリセット
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      success("成功", "パスワードを更新しました")
    } catch (err) {
      console.error('Password update error:', err)
      setPasswordError('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'この操作は取り消せません。すべてのデータが削除されます。本当にアカウントを削除しますか？'
    )
    
    if (!confirmed) return
    
    setIsLoading(true)
    
    try {
      // Supabaseでアカウント削除
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // まずアカウントデータを削除（必要に応じて）
      // TODO: profiles テーブルからのデータ削除など
      
      // 認証アカウントを削除
      const { error } = await supabase.rpc('delete_user')
      
      if (error) {
        showError("エラー", "アカウント削除に失敗しました")
        return
      }
      
      success("完了", "アカウントが削除されました")
      
      // ログアウトしてホームページにリダイレクト
      window.location.href = '/'
    } catch (err) {
      console.error('Account deletion error:', err)
      showError("エラー", "予期せぬエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <Heading>Account</Heading>

      <SettingSection title="Profile" description="Update your personal information.">
        <form onSubmit={handleNameSave} className="space-y-6 px-4 py-4">
          <Input
            aria-label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
          <Input
            type="email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />
          
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Picture
            </label>
            
            {/* Current Avatar Display */}
            <div className="flex items-center gap-4">
              {uploadedAvatar ? (
                <img 
                  src={uploadedAvatar} 
                  alt="Profile avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" 
                />
              ) : (
                <div className="w-16 h-16 text-4xl flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                  {selectedIcon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadedAvatar ? 'Custom avatar image' : 'Using emoji icon'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  JPG, PNG, GIF up to 2MB
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isUploading}
                  className="pointer-events-none"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      📷 Upload Image
                    </>
                  )}
                </Button>
              </label>
              {uploadedAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUploadedAvatar(null)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* アイコン選択セクション */}
          {!uploadedAvatar && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Icon (Emoji)
              </label>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{selectedIcon}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current profile icon
                </div>
              </div>
              <div className="grid grid-cols-10 gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`
                      w-10 h-10 text-2xl rounded-lg flex items-center justify-center
                      transition-all duration-200 hover:scale-110
                      ${selectedIcon === icon 
                        ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2' 
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save profile'}
            </Button>
          </div>
        </form>
      </SettingSection>

      <SettingSection title="Password" description="Change your account password.">
        <form onSubmit={handlePasswordSave} className="space-y-4 px-4 py-4">
          <Input
            type="password"
            aria-label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
          <Input
            type="password"
            aria-label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <Input
            type="password"
            aria-label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          {passwordError && <p className="text-red-600 text-base/6 text-sm/6">{passwordError}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </SettingSection>

      <SettingSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <Subheading level={3} className="!text-base">
              Enable 2FA
            </Subheading>
            <p className="mt-2 text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Require a second step to sign in.</p>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </div>
        {twoFactorEnabled && (
          <div className="flex justify-end px-4 pb-4">
            <Button type="button">Set up 2FA</Button>
          </div>
        )}
      </SettingSection>

      <SettingSection
        title="Danger Zone"
        description="Irreversible and destructive actions"
      >
        <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
          <div className="flex justify-between items-start px-4 py-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <Subheading level={3} className="!text-base text-red-700 dark:text-red-400 font-semibold">
                  Delete Account
                </Subheading>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm leading-relaxed">
                ⚠️ <strong>This action cannot be undone.</strong><br />
                This will permanently delete your account and remove all associated data from our servers.
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-4">
                <li>• All your tasks and projects will be deleted</li>
                <li>• Your profile and settings will be removed</li>
                <li>• This action is immediate and irreversible</li>
              </ul>
            </div>
            <Button 
              type="button" 
              onClick={handleDeleteAccount} 
              disabled={isLoading}
              className="ml-4 bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  🗑️ Delete Account
                </>
              )}
            </Button>
          </div>
        </div>
      </SettingSection>
    </div>
  )
}

