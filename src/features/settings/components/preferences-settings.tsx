'use client'

import { useCallback } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/theme-context'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useTranslations } from 'next-intl'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface PreferencesSettingsData {
  animations: boolean
  sounds: boolean
  autoBackup: boolean
  developerMode: boolean
}

export function PreferencesSettings() {
  const t = useTranslations()
  const { theme, setTheme } = useTheme()

  // 設定の自動保存（テーマ以外）
  const preferences = useAutoSaveSettings<PreferencesSettingsData>({
    initialValues: {
      animations: true,
      sounds: false,
      autoBackup: true,
      developerMode: false,
    },
    onSave: async (_values) => {
      // 環境設定API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 600))
    },
    successMessage: t('settings.preferences.settingsSaved'),
    debounceMs: 1000,
  })

  // Handler functions
  const handleThemeChange = useCallback(
    (value: string) => {
      setTheme(value as 'system' | 'light' | 'dark')
    },
    [setTheme]
  )

  const handleAnimationsChange = useCallback(
    (checked: boolean) => {
      preferences.updateValue('animations', checked)
    },
    [preferences]
  )

  const handleSoundsChange = useCallback(
    (checked: boolean) => {
      preferences.updateValue('sounds', checked)
    },
    [preferences]
  )

  const handleAutoBackupChange = useCallback(
    (checked: boolean) => {
      preferences.updateValue('autoBackup', checked)
    },
    [preferences]
  )

  const handleDeveloperModeChange = useCallback(
    (checked: boolean) => {
      preferences.updateValue('developerMode', checked)
    },
    [preferences]
  )

  return (
    <div className="space-y-6">
      {/* 言語とテーマ */}
      <SettingsCard title={t('settings.preferences.theme')} isSaving={preferences.isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.themeLabel')}>
            <Select value={theme} onValueChange={handleThemeChange}>
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
      <SettingsCard title={t('settings.preferences.userExperience')} isSaving={preferences.isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.animations')}>
            <Switch checked={preferences.values.animations} onCheckedChange={handleAnimationsChange} />
          </SettingField>

          <SettingField label={t('settings.preferences.soundEffects')}>
            <Switch checked={preferences.values.sounds} onCheckedChange={handleSoundsChange} />
          </SettingField>
        </div>
      </SettingsCard>

      {/* データとプライバシー */}
      <SettingsCard title={t('settings.preferences.dataPrivacy')} isSaving={preferences.isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.preferences.autoBackup')}>
            <Switch checked={preferences.values.autoBackup} onCheckedChange={handleAutoBackupChange} />
          </SettingField>

          <SettingField label={t('settings.preferences.developerMode')}>
            <Switch checked={preferences.values.developerMode} onCheckedChange={handleDeveloperModeChange} />
          </SettingField>
        </div>
      </SettingsCard>
    </div>
  )
}
