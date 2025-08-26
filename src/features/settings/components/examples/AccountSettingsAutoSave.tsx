'use client'

import React from 'react'
import { SettingsLayout, SettingsCard, SettingField } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { Input } from '@/components/shadcn-ui/input'
import { Switch } from '@/components/shadcn-ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'

interface ProfileSettings {
  displayName: string
  email: string
  timezone: string
  language: string
}

interface PrivacySettings {
  publicProfile: boolean
  showEmail: boolean
  allowNotifications: boolean
}

export default function AccountSettingsAutoSave() {
  // プロフィール設定（自動保存）
  const profile = useAutoSaveSettings<ProfileSettings>({
    initialValues: {
      displayName: '',
      email: '',
      timezone: 'Asia/Tokyo',
      language: 'ja'
    },
    onSave: async (values) => {
      // 実際のAPIコール（例）
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレート
      
      // await fetch('/api/settings/profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      console.log('Saving profile:', values)
    },
    successMessage: 'プロフィールを更新しました'
  })
  
  // プライバシー設定（自動保存）
  const privacy = useAutoSaveSettings<PrivacySettings>({
    initialValues: {
      publicProfile: false,
      showEmail: false,
      allowNotifications: true
    },
    onSave: async (values) => {
      // 実際のAPIコール（例）
      await new Promise(resolve => setTimeout(resolve, 800)) // シミュレート
      
      // await fetch('/api/settings/privacy', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      console.log('Saving privacy:', values)
    },
    successMessage: 'プライバシー設定を更新しました'
  })
  
  return (
    <SettingsLayout
      title="アカウント設定"
      description="プロフィールとアカウントの管理"
    >
      <div className="space-y-6">
        {/* プロフィール設定 */}
        <SettingsCard
          title="プロフィール"
          description="公開される基本情報"
          isSaving={profile.isSaving}
        >
          <div className="space-y-4">
            <SettingField 
              label="表示名"
              description="他のユーザーに表示される名前"
              required
            >
              <Input
                value={profile.values.displayName}
                onChange={(e) => profile.updateValue('displayName', e.target.value)}
                placeholder="山田太郎"
              />
            </SettingField>
            
            <SettingField 
              label="メールアドレス"
              required
            >
              <Input
                type="email"
                value={profile.values.email}
                onChange={(e) => profile.updateValue('email', e.target.value)}
                placeholder="email@example.com"
              />
            </SettingField>
            
            <SettingField label="タイムゾーン">
              <Select 
                value={profile.values.timezone}
                onValueChange={(value) => profile.updateValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">東京 (GMT+9)</SelectItem>
                  <SelectItem value="America/New_York">ニューヨーク (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">ロンドン (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </SettingField>
            
            <SettingField label="言語">
              <Select 
                value={profile.values.language}
                onValueChange={(value) => profile.updateValue('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </SettingField>
          </div>
        </SettingsCard>
        
        {/* プライバシー設定 */}
        <SettingsCard
          title="プライバシー"
          description="情報の公開範囲を設定"
          isSaving={privacy.isSaving}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SettingField
                label="プロフィールを公開"
                description="他のユーザーがあなたのプロフィールを閲覧できます"
              >
                <></>
              </SettingField>
              <Switch
                checked={privacy.values.publicProfile}
                onCheckedChange={(checked) => 
                  privacy.updateValue('publicProfile', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <SettingField
                label="メールアドレスを表示"
                description="プロフィールにメールアドレスを表示します"
              >
                <></>
              </SettingField>
              <Switch
                checked={privacy.values.showEmail}
                onCheckedChange={(checked) => 
                  privacy.updateValue('showEmail', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <SettingField
                label="通知を許可"
                description="システムからの通知を受け取ります"
              >
                <></>
              </SettingField>
              <Switch
                checked={privacy.values.allowNotifications}
                onCheckedChange={(checked) => 
                  privacy.updateValue('allowNotifications', checked)
                }
              />
            </div>
          </div>
        </SettingsCard>
        
        {/* デバッグ情報（開発用） */}
        <SettingsCard
          title="デバッグ情報"
          description="現在の設定値（開発用）"
        >
          <div className="space-y-2 text-xs font-mono">
            <div>Profile: {JSON.stringify(profile.values, null, 2)}</div>
            <div>Privacy: {JSON.stringify(privacy.values, null, 2)}</div>
            <div>Profile saving: {profile.isSaving ? 'Yes' : 'No'}</div>
            <div>Privacy saving: {privacy.isSaving ? 'Yes' : 'No'}</div>
          </div>
        </SettingsCard>
      </div>
    </SettingsLayout>
  )
}