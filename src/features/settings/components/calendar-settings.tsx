'use client'

import { Button } from '@/components/shadcn-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { Switch } from '@/components/shadcn-ui/switch'
import { Label } from '@/components/shadcn-ui/label'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { formatHour } from '@/features/settings/utils/timezone-utils'
import { format } from 'date-fns'

export default function CalendarSettings() {
  const settings = useCalendarSettingsStore()
  
  const formatTimeWithSettings = (date: Date, timeFormat: '12h' | '24h') => {
    const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
    return format(date, formatString)
  }
  
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Calendar Settings</h1>
        <p className="text-muted-foreground mt-2">Configure how dates and times are displayed in your calendar</p>
      </div>
      
      {/* Time & Timezone Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Time & Timezone</h2>
          <p className="text-sm text-muted-foreground">Configure how dates and times are displayed</p>
        </div>
        
        <div className="space-y-6 rounded-lg border p-6">
          {/* タイムゾーン設定 */}
          <div className="space-y-3">
            <Label>Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => settings.updateSettings({ timezone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Tokyo">🇯🇵 Tokyo (GMT+9)</SelectItem>
                <SelectItem value="America/New_York">🇺🇸 New York (GMT-5)</SelectItem>
                <SelectItem value="Europe/London">🇬🇧 London (GMT+0)</SelectItem>
                <SelectItem value="America/Los_Angeles">🇺🇸 Los Angeles (GMT-8)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Select your timezone for calendar display</p>
          </div>
          
          {/* 時間表示形式 */}
          <div className="space-y-3">
            <Label>Time format</Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value) => settings.updateSettings({ timeFormat: value as '12h' | '24h' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24-hour (13:00)</SelectItem>
                <SelectItem value="12h">12-hour (1:00 PM)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choose between 12-hour or 24-hour time display</p>
          </div>
          
          {/* プレビュー表示 */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="space-y-2">
              <p className="font-medium">
                Current time: {formatTimeWithSettings(new Date(), settings.timeFormat)}
              </p>
              <p className="text-sm text-muted-foreground">
                Full format: {format(new Date(), 'yyyy/MM/dd HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Week & Calendar Display Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Week & Calendar Display</h2>
          <p className="text-sm text-muted-foreground">Customize how weeks and calendar views are displayed</p>
        </div>
        
        <div className="space-y-6 rounded-lg border p-6">
          {/* 週の開始曜日 */}
          <div className="space-y-3">
            <Label>Week starts on</Label>
            <Select
              value={String(settings.weekStartsOn)}
              onValueChange={(value) => settings.updateSettings({ weekStartsOn: Number(value) as 0 | 1 | 6 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choose which day your calendar week starts on</p>
          </div>
          
          {/* 週番号表示 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show week numbers</Label>
              <p className="text-sm text-muted-foreground">Display week numbers in calendar views</p>
            </div>
            <Switch
              checked={settings.showWeekNumbers}
              onCheckedChange={(checked) => settings.updateSettings({ showWeekNumbers: checked })}
            />
          </div>
          
          {/* 辞退したイベント表示 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show declined events</Label>
              <p className="text-sm text-muted-foreground">Display events that have been declined</p>
            </div>
            <Switch
              checked={settings.showDeclinedEvents}
              onCheckedChange={(checked) => settings.updateSettings({ showDeclinedEvents: checked })}
            />
          </div>
        </div>
      </div>
      
      {/* Default Task Settings Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Default Task Settings</h2>
          <p className="text-sm text-muted-foreground">Set default behavior for new tasks and events</p>
        </div>
        
        <div className="space-y-6 rounded-lg border p-6">
          {/* デフォルトのタスク時間 */}
          <div className="space-y-3">
            <Label>Default task duration</Label>
            <Select
              value={String(settings.defaultDuration)}
              onValueChange={(value) => settings.updateSettings({ defaultDuration: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1 hour 30 minutes</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Default duration when creating new tasks</p>
          </div>
        </div>
      </div>
      
      {/* Business Hours Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Business Hours</h2>
          <p className="text-sm text-muted-foreground">Define your working hours for calendar display</p>
        </div>
        
        <div className="space-y-6 rounded-lg border p-6">
          {/* 営業開始時間 */}
          <div className="space-y-3">
            <Label>Business hours start</Label>
            <Select
              value={String(settings.businessHours.start)}
              onValueChange={(value) => 
                settings.updateSettings({ 
                  businessHours: { ...settings.businessHours, start: Number(value) }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, settings.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">When your business hours begin</p>
          </div>
          
          {/* 営業終了時間 */}
          <div className="space-y-3">
            <Label>Business hours end</Label>
            <Select
              value={String(settings.businessHours.end)}
              onValueChange={(value) => 
                settings.updateSettings({ 
                  businessHours: { ...settings.businessHours, end: Number(value) }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, settings.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">When your business hours end</p>
          </div>
          
          {/* 営業時間プレビュー */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Business hours:</p>
            <p className="font-medium">
              {formatHour(settings.businessHours.start, settings.timeFormat)} - {formatHour(settings.businessHours.end, settings.timeFormat)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Reset Settings Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Reset Settings</h2>
          <p className="text-sm text-muted-foreground">Restore all calendar settings to their default values</p>
        </div>
        
        <div className="rounded-lg border p-6">
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to reset all calendar settings to their defaults?')) {
                settings.resetSettings()
              }
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}