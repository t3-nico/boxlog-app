'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Switch } from '@/components/shadcn-ui/switch'
import { useAuthContext } from '@/features/auth/contexts/AuthContext'

export default function AccountSettings() {
  const { user } = useAuthContext()
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

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // プロフィール更新ロジック（実際の実装は後で）
      console.log('Saving profile:', { name, selectedIcon, uploadedAvatar })
      
      // 成功メッセージ（実際の実装は後で）
      alert('Profile updated successfully')
    } catch (err) {
      console.error('Profile update error:', err)
      alert('Failed to update profile')
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
      // パスワード更新ロジック（実際の実装は後で）
      console.log('Updating password')
      
      // 成功時はフォームをリセット
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      alert('Password updated successfully')
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
      // アカウント削除ロジック（実際の実装は後で）
      console.log('Deleting account')
      alert('Account deletion functionality will be implemented')
    } catch (err) {
      console.error('Account deletion error:', err)
      alert('Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and security settings</p>
      </div>

      {/* Profile Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Update your personal information</p>
        </div>
        
        <form onSubmit={handleNameSave} className="space-y-6 rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>
          </div>
          
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Profile Picture</label>
            
            {/* Current Avatar Display */}
            <div className="flex items-center gap-4">
              {uploadedAvatar ? (
                <img 
                  src={uploadedAvatar} 
                  alt="Profile avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-border" 
                />
              ) : (
                <div className="w-16 h-16 text-4xl flex items-center justify-center rounded-full bg-muted border-2 border-border">
                  {selectedIcon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {uploadedAvatar ? 'Custom avatar image' : 'Using emoji icon'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF up to 2MB
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={isUploading}>
                {isUploading ? 'Uploading...' : '📷 Upload Image'}
              </Button>
              {uploadedAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUploadedAvatar(null)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* アイコン選択セクション */}
          {!uploadedAvatar && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Profile Icon (Emoji)</label>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{selectedIcon}</div>
                <div className="text-sm text-muted-foreground">Current profile icon</div>
              </div>
              <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg bg-muted/50">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`
                      w-10 h-10 text-2xl rounded-lg flex items-center justify-center
                      transition-all duration-200 hover:scale-110
                      ${selectedIcon === icon 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                        : 'bg-background hover:bg-muted border border-border'
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
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-muted-foreground">Change your account password</p>
        </div>
        
        <form onSubmit={handlePasswordSave} className="space-y-4 rounded-lg border p-6">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
        
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable 2FA</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {twoFactorEnabled 
                  ? 'Two-factor authentication is enabled'
                  : 'Require a verification code when signing in'
                }
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={setTwoFactorEnabled}
              disabled={isLoading}
            />
          </div>
          
          {twoFactorEnabled && (
            <div className="mt-4 p-4 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Two-Factor Authentication Enabled
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Your account is protected with an additional security layer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
        </div>
        
        <div className="border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex justify-between items-start p-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
              </div>
              <p className="text-destructive text-sm leading-relaxed">
                ⚠️ <strong>This action cannot be undone.</strong><br />
                This will permanently delete your account and remove all associated data.
              </p>
              <ul className="text-xs text-destructive space-y-1 ml-4">
                <li>• All your tasks and projects will be deleted</li>
                <li>• Your profile and settings will be removed</li>
                <li>• This action is immediate and irreversible</li>
              </ul>
            </div>
            <Button 
              type="button" 
              onClick={handleDeleteAccount} 
              disabled={isLoading}
              variant="destructive"
              className="ml-4"
            >
              {isLoading ? 'Deleting...' : '🗑️ Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}