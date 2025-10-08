// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SettingField, SettingsCard, SettingsLayout } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

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

const AccountSettingsAutoSave = () => {
  const { t } = useI18n()
  // プロフィール設定（自動保存）
  const profile = useAutoSaveSettings<ProfileSettings>({
    initialValues: {
      displayName: '',
      email: '',
      timezone: 'Asia/Tokyo',
      language: 'ja',
    },
    onSave: async (values) => {
      // 実際のAPIコール（例）
      await new Promise((resolve) => setTimeout(resolve, 1000)) // シミュレート

      // await fetch('/api/settings/profile', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      console.log('Saving profile:', values)
    },
    successMessage: t('settings.account.profileUpdated'),
  })

  // プライバシー設定（自動保存）
  const privacy = useAutoSaveSettings<PrivacySettings>({
    initialValues: {
      publicProfile: false,
      showEmail: false,
      allowNotifications: true,
    },
    onSave: async (values) => {
      // 実際のAPIコール（例）
      await new Promise((resolve) => setTimeout(resolve, 800)) // シミュレート

      // await fetch('/api/settings/privacy', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      console.log('Saving privacy:', values)
    },
    successMessage: t('settings.account.privacyUpdated'),
  })

  return (
    <SettingsLayout title={t('settings.account.title')} description={t('settings.account.description')}>
      <div className="space-y-6">
        {/* プロフィール設定 */}
        <SettingsCard
          title={t('settings.account.profile')}
          description={t('settings.account.publicInfo')}
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
                onChange={(e) => profile.updateValue('displayName', e.target.value)}
                placeholder={t('settings.account.displayNamePlaceholder')}
              />
            </SettingField>

            <SettingField label={t('settings.account.email')} required>
              <Input
                type="email"
                value={profile.values.email}
                onChange={(e) => profile.updateValue('email', e.target.value)}
                placeholder="email@example.com"
              />
            </SettingField>

            <SettingField label={t('settings.calendar.timezone')}>
              <Select value={profile.values.timezone} onValueChange={(value) => profile.updateValue('timezone', value)}>
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

            <SettingField label={t('settings.preferences.language')}>
              <Select value={profile.values.language} onValueChange={(value) => profile.updateValue('language', value)}>
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
          title={t('settings.account.privacy')}
          description={t('settings.account.privacyDesc')}
          isSaving={privacy.isSaving}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SettingField
                label={t('settings.account.publicProfile')}
                description={t('settings.account.publicProfileDesc')}
              />
              <Switch
                checked={privacy.values.publicProfile}
                onCheckedChange={(checked) => privacy.updateValue('publicProfile', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <SettingField label={t('settings.account.showEmail')} description={t('settings.account.showEmailDesc')} />
              <Switch
                checked={privacy.values.showEmail}
                onCheckedChange={(checked) => privacy.updateValue('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <SettingField
                label={t('settings.account.allowNotifications')}
                description={t('settings.account.allowNotificationsDesc')}
              />
              <Switch
                checked={privacy.values.allowNotifications}
                onCheckedChange={(checked) => privacy.updateValue('allowNotifications', checked)}
              />
            </div>
          </div>
        </SettingsCard>

        {/* デバッグ情報（開発用） */}
        <SettingsCard title={t('settings.account.debugInfo')} description={t('settings.account.debugInfoDesc')}>
          <div className="space-y-2 font-mono text-xs">
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

export default AccountSettingsAutoSave
