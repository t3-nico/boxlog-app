'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/ui/input'
import { SettingSection } from '@/components/settings-section'
import { Switch } from '@/components/ui/switch'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { AuthMFAEnrollResponse, AuthMFAChallengeResponse, AuthMFAListFactorsResponse } from '@supabase/supabase-js'

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
  
  // メールアドレス変更関連
  const [newEmail, setNewEmail] = useState('')
  const [emailChangePassword, setEmailChangePassword] = useState('')
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
  
  // 2FA関連のstate
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeUri, setQrCodeUri] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [factorId, setFactorId] = useState('')

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
      
      // MFAファクターをロード
      loadMFAFactors()
    }
  }, [user])

  // MFAファクターの取得
  const loadMFAFactors = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        console.error('MFA factors load error:', error)
        return
      }
      
      setMfaFactors(data?.totp || [])
      setTwoFactorEnabled(data?.totp && data.totp.length > 0)
    } catch (err) {
      console.error('Unexpected MFA load error:', err)
    }
  }

  // アバター画像のアップロード処理
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (2MB制限)
    if (file.size > 2 * 1024 * 1024) {
      showError("Error", "File size must be 2MB or less")
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      showError("Error", "Please select an image file")
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
        showError("Error", "Upload failed")
        return
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setUploadedAvatar(publicUrl)
      success("Success", "Avatar image uploaded successfully")

    } catch (err) {
      console.error('Avatar upload error:', err)
      showError("Error", "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  // 2FA有効化処理
  const handle2FAEnable = async () => {
    setIs2FALoading(true)
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // MFAファクターを登録
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })
      
      if (enrollError) {
        showError("Error", "Failed to setup 2FA")
        return
      }
      
      setFactorId(enrollData.id)
      setQrCodeUri(enrollData.totp.qr_code)
      setSecret(enrollData.totp.secret)
      setShowQRCode(true)
      
    } catch (err) {
      console.error('2FA enable error:', err)
      showError("Error", "An unexpected error occurred")
    } finally {
      setIs2FALoading(false)
    }
  }

  // 2FA確認処理
  const handle2FAVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showError("Error", "Please enter a 6-digit verification code")
      return
    }
    
    setIs2FALoading(true)
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // チャレンジを作成
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      })
      
      if (challengeError) {
        showError("Error", "Failed to create authentication challenge")
        return
      }
      
      // 認証コードを検証
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode
      })
      
      if (verifyError) {
        showError("Error", "Invalid verification code")
        return
      }
      
      success("Success", "Two-factor authentication enabled successfully")
      setShowQRCode(false)
      setVerificationCode('')
      await loadMFAFactors()
      
    } catch (err) {
      console.error('2FA verify error:', err)
      showError("Error", "An unexpected error occurred")
    } finally {
      setIs2FALoading(false)
    }
  }

  // 2FA無効化処理
  const handle2FADisable = async () => {
    const confirmed = window.confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.')
    if (!confirmed) return
    
    setIs2FALoading(true)
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // 全てのTOTPファクターを削除
      for (const factor of mfaFactors) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factor.id
        })
        
        if (error) {
          console.error('MFA unenroll error:', error)
        }
      }
      
      success("Success", "Two-factor authentication disabled successfully")
      await loadMFAFactors()
      
    } catch (err) {
      console.error('2FA disable error:', err)
      showError("Error", "An unexpected error occurred")
    } finally {
      setIs2FALoading(false)
    }
  }

  // メールアドレス変更処理
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEmail || !emailChangePassword) {
      setEmailChangeError('Both email and password are required')
      return
    }
    
    if (newEmail === email) {
      setEmailChangeError('New email must be different from current email')
      return
    }
    
    setIsEmailLoading(true)
    setEmailChangeError(null)
    
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // まず現在のパスワードを確認（セキュリティのため）
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: emailChangePassword
      })
      
      if (signInError) {
        setEmailChangeError('Current password is incorrect')
        return
      }
      
      // メールアドレスを更新（確認メールが送信される）
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (updateError) {
        setEmailChangeError(updateError.message)
        return
      }
      
      success("Success", `A confirmation email has been sent to ${newEmail}. Please click the link in the email to complete the change.`)
      setShowEmailChange(false)
      setNewEmail('')
      setEmailChangePassword('')
      
    } catch (err) {
      console.error('Email change error:', err)
      setEmailChangeError('An unexpected error occurred')
    } finally {
      setIsEmailLoading(false)
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
        showError("Error", "Failed to update profile")
        return
      }
      
      success("Success", "Profile updated successfully")
      
      // サイドバーを確実に更新するため、少し遅延してリロード
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error('Profile update error:', err)
      showError("Error", "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
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
      
      success("Success", "Password updated successfully")
    } catch (err) {
      console.error('Password update error:', err)
      setPasswordError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to delete your account?'
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
        showError("Error", "Failed to delete account")
        return
      }
      
      success("Complete", "Account has been deleted")
      
      // ログアウトしてホームページにリダイレクト
      window.location.href = '/'
    } catch (err) {
      console.error('Account deletion error:', err)
      showError("Error", "An unexpected error occurred")
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
          <div className="space-y-2">
            <Input
              type="email"
              aria-label="Email"
              value={email}
              placeholder="Email address"
              readOnly
              className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEmailChange(!showEmailChange)}
              >
                {showEmailChange ? 'Cancel' : 'Change Email'}
              </Button>
            </div>
          </div>

          {/* メールアドレス変更フォーム */}
          {showEmailChange && (
            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Change Email Address
              </div>
              
              <form onSubmit={handleEmailChange} className="space-y-4">
                <Input
                  type="email"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Current password (for security)"
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  required
                />
                
                {emailChangeError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {emailChangeError}
                  </div>
                )}
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEmailChange(false)
                      setNewEmail('')
                      setEmailChangePassword('')
                      setEmailChangeError(null)
                    }}
                    disabled={isEmailLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isEmailLoading || !newEmail || !emailChangePassword}
                  >
                    {isEmailLoading ? 'Updating...' : 'Update Email'}
                  </Button>
                </div>
              </form>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1">
                  <li>• A confirmation email will be sent to your new address</li>
                  <li>• Your current email will remain active until confirmed</li>
                  <li>• Click the link in the confirmation email to complete the change</li>
                </ul>
              </div>
            </div>
          )}
          
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
        description="Add an extra layer of security to your account using TOTP authenticator apps."
      >
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Subheading level={3} className="!text-base">
                Enable 2FA
              </Subheading>
              <p className="mt-2 text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                {twoFactorEnabled 
                  ? 'Two-factor authentication is enabled. Verification codes from your authenticator app are required.'
                  : 'Require a verification code from an authenticator app when signing in.'
                }
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={twoFactorEnabled ? handle2FADisable : handle2FAEnable}
              disabled={is2FALoading}
            />
          </div>

          {/* 2FA有効化の場合の設定UI */}
          {!twoFactorEnabled && showQRCode && (
            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-center">
                <Subheading level={4} className="!text-sm font-medium mb-2">
                  Scan QR Code with Authenticator App
                </Subheading>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Use Google Authenticator, Microsoft Authenticator, or any other TOTP authenticator app.
                </p>
                
                {/* QRコード表示 */}
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeUri} 
                    alt="2FA QR Code" 
                    className="w-48 h-48 border border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                {/* 手動入力用シークレット */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p className="mb-1">If you can't scan the QR code, enter this secret manually:</p>
                  <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono break-all">
                    {secret}
                  </code>
                </div>
                
                {/* 認証コード入力 */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="6-digit code from authenticator app"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center font-mono text-lg tracking-widest"
                    maxLength={6}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowQRCode(false)
                        setVerificationCode('')
                        setQrCodeUri('')
                        setSecret('')
                        setFactorId('')
                      }}
                      disabled={is2FALoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handle2FAVerify}
                      disabled={is2FALoading || verificationCode.length !== 6}
                    >
                      {is2FALoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2FA有効時の情報表示 */}
          {twoFactorEnabled && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Two-Factor Authentication Enabled
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Your account is protected with an additional security layer.
                Verification codes from your authenticator app are required when signing in.
              </p>
              <div className="mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Registered devices: {mfaFactors.length}
                </p>
              </div>
            </div>
          )}
        </div>
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

