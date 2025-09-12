'use client'

import { format } from 'date-fns'

import { Button } from '@/components/shadcn-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { Switch } from '@/components/shadcn-ui/switch'
import { colors, spacing } from '@/config/theme'
import { SettingsCard, SettingField } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { formatHour } from '@/features/settings/utils/timezone-utils'

interface CalendarAutoSaveSettings {
  timezone: string
  timeFormat: '12h' | '24h'
  weekStartsOn: 0 | 1 | 6
  showWeekNumbers: boolean
  showDeclinedEvents: boolean
  defaultDuration: number
  snapInterval: 5 | 10 | 15 | 30
  businessHours: {
    start: number
    end: number
  }
}

export default function CalendarSettings() {
  const settings = useCalendarSettingsStore()
  
  const formatTimeWithSettings = (date: Date, timeFormat: '12h' | '24h') => {
    const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
    return format(date, formatString)
  }

  // 自動保存システム
  const autoSave = useAutoSaveSettings<CalendarAutoSaveSettings>({
    initialValues: {
      timezone: settings.timezone,
      timeFormat: settings.timeFormat,
      weekStartsOn: settings.weekStartsOn,
      showWeekNumbers: settings.showWeekNumbers,
      showDeclinedEvents: settings.showDeclinedEvents,
      defaultDuration: settings.defaultDuration,
      snapInterval: settings.snapInterval,
      businessHours: settings.businessHours,
    },
    onSave: async (values) => {
      // カレンダー設定更新API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Saving calendar settings:', values)
      // 実際のstore更新
      settings.updateSettings(values)
    },
    successMessage: 'カレンダー設定を保存しました',
    debounceMs: 800
  })

  const handleResetSettings = () => {
    if (confirm('カレンダー設定をすべてデフォルトに戻しますか？')) {
      settings.resetSettings()
      // 自動保存の値もリセット
      autoSave.updateValues({
        timezone: 'Asia/Tokyo',
        timeFormat: '24h',
        weekStartsOn: 1,
        showWeekNumbers: false,
        showDeclinedEvents: false,
        defaultDuration: 60,
        snapInterval: 15,
        businessHours: { start: 9, end: 18 },
      })
    }
  }

  return (
    <div className={spacing.stackGap.lg}>
      {/* Time & Timezone Section */}
      <SettingsCard
        title="時間とタイムゾーン"
        description="日付と時間の表示方法を設定"
        isSaving={autoSave.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="タイムゾーン" description="カレンダー表示に使用するタイムゾーン">
            <Select
              value={autoSave.values.timezone}
              onValueChange={(value) => autoSave.updateValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="タイムゾーンを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Tokyo">🇯🇵 東京 (GMT+9)</SelectItem>
                <SelectItem value="America/New_York">🇺🇸 ニューヨーク (GMT-5)</SelectItem>
                <SelectItem value="Europe/London">🇬🇧 ロンドン (GMT+0)</SelectItem>
                <SelectItem value="America/Los_Angeles">🇺🇸 ロサンゼルス (GMT-8)</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
          
          <SettingField label="時間表示形式" description="12時間表記または24時間表記を選択">
            <Select
              value={autoSave.values.timeFormat}
              onValueChange={(value) => autoSave.updateValue('timeFormat', value as '12h' | '24h')}
            >
              <SelectTrigger>
                <SelectValue placeholder="時間表示形式を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24時間表記 (13:00)</SelectItem>
                <SelectItem value="12h">12時間表記 (1:00 PM)</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
          
          {/* プレビュー表示 */}
          <div className={`p-4 ${colors.background.muted} rounded-lg`}>
            <p className={`text-sm ${colors.text.secondary} mb-2`}>プレビュー:</p>
            <div className={spacing.stackGap.xs}>
              <p className="font-medium">
                現在時刻: {formatTimeWithSettings(new Date(), autoSave.values.timeFormat)}
              </p>
              <p className={`text-sm ${colors.text.secondary}`}>
                完全表記: {format(new Date(), 'yyyy/MM/dd HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>
      
      {/* Week & Calendar Display Section */}
      <SettingsCard
        title="週とカレンダー表示"
        description="週の表示方法とカレンダーのカスタマイズ"
        isSaving={autoSave.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="週の開始曜日" description="カレンダーの週の開始日を選択">
            <Select
              value={String(autoSave.values.weekStartsOn)}
              onValueChange={(value) => autoSave.updateValue('weekStartsOn', Number(value) as 0 | 1 | 6)}
            >
              <SelectTrigger>
                <SelectValue placeholder="開始日を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">日曜日</SelectItem>
                <SelectItem value="1">月曜日</SelectItem>
                <SelectItem value="6">土曜日</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
          
          <SettingField label="週番号を表示" description="カレンダービューで週番号を表示">
            <Switch
              checked={autoSave.values.showWeekNumbers}
              onCheckedChange={(checked) => autoSave.updateValue('showWeekNumbers', checked)}
            />
          </SettingField>
          
          <SettingField label="辞退したイベントを表示" description="辞退したイベントもカレンダーに表示">
            <Switch
              checked={autoSave.values.showDeclinedEvents}
              onCheckedChange={(checked) => autoSave.updateValue('showDeclinedEvents', checked)}
            />
          </SettingField>
        </div>
      </SettingsCard>
      
      {/* Default Task Settings Section */}
      <SettingsCard
        title="デフォルトタスク設定"
        description="新しいタスクとイベントのデフォルト動作"
        isSaving={autoSave.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="デフォルトタスク時間" description="新しいタスク作成時のデフォルト時間">
            <Select
              value={String(autoSave.values.defaultDuration)}
              onValueChange={(value) => autoSave.updateValue('defaultDuration', Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="時間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15分</SelectItem>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">1時間</SelectItem>
                <SelectItem value="90">1時間30分</SelectItem>
                <SelectItem value="120">2時間</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
          
          <SettingField label="ドラッグ&ドロップのスナップ間隔" description="カレンダーでイベントをドラッグする際のグリッド間隔">
            <Select
              value={String(autoSave.values.snapInterval)}
              onValueChange={(value) => autoSave.updateValue('snapInterval', Number(value) as 5 | 10 | 15 | 30)}
            >
              <SelectTrigger>
                <SelectValue placeholder="間隔を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5分</SelectItem>
                <SelectItem value="10">10分</SelectItem>
                <SelectItem value="15">15分</SelectItem>
                <SelectItem value="30">30分</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
        </div>
      </SettingsCard>
      
      {/* Business Hours Section */}
      <SettingsCard
        title="営業時間"
        description="作業時間をカレンダーに定義"
        isSaving={autoSave.isSaving}
      >
        <div className={spacing.stackGap.md}>
          <SettingField label="営業開始時間" description="営業時間の開始時間">
            <Select
              value={String(autoSave.values.businessHours.start)}
              onValueChange={(value) => 
                autoSave.updateValue('businessHours', { 
                  ...autoSave.values.businessHours, 
                  start: Number(value) 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="開始時間" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, autoSave.values.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>
          
          <SettingField label="営業終了時間" description="営業時間の終了時間">
            <Select
              value={String(autoSave.values.businessHours.end)}
              onValueChange={(value) => 
                autoSave.updateValue('businessHours', { 
                  ...autoSave.values.businessHours, 
                  end: Number(value) 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="終了時間" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, autoSave.values.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>
          
          {/* 営業時間プレビュー */}
          <div className={`p-4 ${colors.background.muted} rounded-lg`}>
            <p className={`text-sm ${colors.text.secondary} mb-2`}>営業時間:</p>
            <p className="font-medium">
              {formatHour(autoSave.values.businessHours.start, autoSave.values.timeFormat)} - {formatHour(autoSave.values.businessHours.end, autoSave.values.timeFormat)}
            </p>
          </div>
        </div>
      </SettingsCard>
      
      {/* Reset Settings Section */}
      <SettingsCard
        title="設定のリセット"
        description="すべてのカレンダー設定をデフォルト値に戻す"
      >
        <Button
          variant="destructive"
          onClick={handleResetSettings}
        >
          デフォルトに戻す
        </Button>
      </SettingsCard>
    </div>
  )
}