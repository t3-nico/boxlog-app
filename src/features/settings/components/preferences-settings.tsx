'use client'

import { useCallback } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useI18n } from '@/lib/i18n/hooks'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface PreferencesSettingsData {
  theme: 'system' | 'light' | 'dark'
  animations: boolean
  sounds: boolean
  autoBackup: boolean
  developerMode: boolean
}

const PreferencesSettings = () => {
  const { t } = useI18n()
  // 設定の自動保存
  const preferences = useAutoSaveSettings<PreferencesSettingsData>({
    initialValues: {
      theme: 'system',
      animations: true,
      sounds: false,
      autoBackup: true,
      developerMode: false,
    },
    onSave: async (_values) => {
      // 環境設定API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 600))
    },
    successMessage: t('settings.preferences.settingsSaved'),
    debounceMs: 1000
  })

  // Handler functions
  const handleThemeChange = useCallback((value: string) => {
    preferences.updateValue('theme', value as 'system' | 'light' | 'dark')
  }, [preferences])

  const handleAnimationsChange = useCallback((checked: boolean) => {
    preferences.updateValue('animations', checked)
  }, [preferences])

  const handleSoundsChange = useCallback((checked: boolean) => {
    preferences.updateValue('sounds', checked)
  }, [preferences])

  const handleAutoBackupChange = useCallback((checked: boolean) => {
    preferences.updateValue('autoBackup', checked)
  }, [preferences])

  const handleDeveloperModeChange = useCallback((checked: boolean) => {
    preferences.updateValue('developerMode', checked)
  }, [preferences])

  return (
    <div className="space-y-6">
      {/* 言語とテーマ */}
      <SettingsCard
        title={t('settings.preferences.theme')}
        description={t('settings.preferences.themeDesc')}
        isSaving={preferences.isSaving}
      >
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.themeLabel')} description={t('settings.preferences.themeLabelDesc')}>
            <Select
              value={preferences.values.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.preferences.selectTheme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">🖥️ システム設定に従う</SelectItem>
                <SelectItem value="light">☀️ ライトテーマ</SelectItem>
                <SelectItem value="dark">🌙 ダークテーマ</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
        </div>
      </SettingsCard>

      {/* ユーザーエクスペリエンス */}
      <SettingsCard
        title={t('settings.preferences.userExperience')}
        description={t('settings.preferences.userExperienceDesc')}
        isSaving={preferences.isSaving}
      >
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.animations')} description={t('settings.preferences.animationsDesc')}>
            <Switch
              checked={preferences.values.animations}
              onCheckedChange={handleAnimationsChange}
            />
          </SettingField>

          <SettingField label={t('settings.preferences.soundEffects')} description={t('settings.preferences.soundEffectsDesc')}>
            <Switch
              checked={preferences.values.sounds}
              onCheckedChange={handleSoundsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* データとプライバシー */}
      <SettingsCard
        title={t('settings.preferences.dataPrivacy')}
        description={t('settings.preferences.dataPrivacyDesc')}
        isSaving={preferences.isSaving}
      >
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.autoBackup')} description={t('settings.preferences.autoBackupDesc')}>
            <Switch
              checked={preferences.values.autoBackup}
              onCheckedChange={handleAutoBackupChange}
            />
          </SettingField>

          <SettingField label={t('settings.preferences.developerMode')} description={t('settings.preferences.developerModeDesc')}>
            <Switch
              checked={preferences.values.developerMode}
              onCheckedChange={handleDeveloperModeChange}
            />
          </SettingField>
        </div>
      </SettingsCard>
    </div>
  )
}

export default PreferencesSettings