'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { Switch } from '@/components/shadcn-ui/switch'
import { spacing } from '@/config/theme'
import { SettingsCard, SettingField } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

interface PreferencesSettings {
  language: 'ja' | 'en'
  theme: 'system' | 'light' | 'dark'
  animations: boolean
  sounds: boolean
  autoBackup: boolean
  developerMode: boolean
}

export default function PreferencesSettings() {
  // 設定の自動保存
  const preferences = useAutoSaveSettings<PreferencesSettings>({
    initialValues: {
      language: 'ja',
      theme: 'system',
      animations: true,
      sounds: false,
      autoBackup: true,
      developerMode: false,
    },
    onSave: async (values) => {
      // 環境設定API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 600))
      console.log('Saving preferences:', values)
    },
    successMessage: '環境設定を保存しました',
    debounceMs: 1000
  })

  return (
    <div className={spacing.stackGap.lg}>
      {/* 言語とテーマ */}
      <SettingsCard
        title="言語とテーマ"
        description="アプリケーションの表示言語と外観の設定"
        isSaving={preferences.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="言語" description="アプリケーションで使用する言語">
            <Select
              value={preferences.values.language}
              onValueChange={(value) => preferences.updateValue('language', value as 'ja' | 'en')}
            >
              <SelectTrigger>
                <SelectValue placeholder="言語を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField label="テーマ" description="アプリケーションの外観テーマ">
            <Select
              value={preferences.values.theme}
              onValueChange={(value) => preferences.updateValue('theme', value as 'system' | 'light' | 'dark')}
            >
              <SelectTrigger>
                <SelectValue placeholder="テーマを選択" />
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
        title="ユーザーエクスペリエンス"
        description="アニメーションやサウンドの設定"
        isSaving={preferences.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="アニメーション" description="画面遷移やボタンのアニメーション効果を有効にする">
            <Switch
              checked={preferences.values.animations}
              onCheckedChange={(checked) => preferences.updateValue('animations', checked)}
            />
          </SettingField>

          <SettingField label="サウンド効果" description="通知音やクリック音を再生する">
            <Switch
              checked={preferences.values.sounds}
              onCheckedChange={(checked) => preferences.updateValue('sounds', checked)}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* データとプライバシー */}
      <SettingsCard
        title="データとプライバシー"
        description="データのバックアップと開発者向け機能"
        isSaving={preferences.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="自動バックアップ" description="データを定期的に自動でバックアップする">
            <Switch
              checked={preferences.values.autoBackup}
              onCheckedChange={(checked) => preferences.updateValue('autoBackup', checked)}
            />
          </SettingField>

          <SettingField label="開発者モード" description="高度な機能とデバッグ情報を表示する">
            <Switch
              checked={preferences.values.developerMode}
              onCheckedChange={(checked) => preferences.updateValue('developerMode', checked)}
            />
          </SettingField>
        </div>
      </SettingsCard>
    </div>
  )
}