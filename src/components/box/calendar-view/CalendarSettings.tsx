'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { getTimeZones, formatInTimeZone, formatHour } from '@/utils/timezone-utils'
import { format } from 'date-fns'

interface CalendarSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalendarSettings({ open, onOpenChange }: CalendarSettingsProps) {
  const settings = useCalendarSettingsStore()
  const timezones = getTimeZones()
  
  const formatTimeWithSettings = (date: Date, timeFormat: '12h' | '24h') => {
    const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
    return format(date, formatString)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>カレンダー設定</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* タイムゾーン設定 */}
          <div className="space-y-2">
            <Label htmlFor="timezone">タイムゾーン</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => settings.updateSettings({ timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* 主要なタイムゾーンを上部に表示 */}
                <SelectItem value="Asia/Tokyo">
                  🇯🇵 東京 (GMT+9)
                </SelectItem>
                <SelectItem value="America/New_York">
                  🇺🇸 ニューヨーク (GMT-5)
                </SelectItem>
                <SelectItem value="Europe/London">
                  🇬🇧 ロンドン (GMT+0)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  🇺🇸 ロサンゼルス (GMT-8)
                </SelectItem>
                
                <div className="my-2 border-t" />
                
                {/* その他のタイムゾーン */}
                {timezones.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              現在時刻: {formatInTimeZone(new Date(), settings.timezone, 'yyyy/MM/dd HH:mm')}
            </p>
          </div>
          
          {/* 時間表示形式 */}
          <div className="space-y-2">
            <Label>時間の表示形式</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  value="12h"
                  checked={settings.timeFormat === '12h'}
                  onChange={() => settings.updateSettings({ timeFormat: '12h' })}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  12時間表示 (1:00 PM)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  value="24h"
                  checked={settings.timeFormat === '24h'}
                  onChange={() => settings.updateSettings({ timeFormat: '24h' })}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  24時間表示 (13:00)
                </span>
              </label>
            </div>
            {/* プレビュー */}
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">表示例:</p>
              <p className="font-medium">
                {formatTimeWithSettings(new Date(), settings.timeFormat)}
              </p>
            </div>
          </div>
          
          {/* 週の開始曜日 */}
          <div className="space-y-2">
            <Label htmlFor="weekStart">週の開始曜日</Label>
            <Select
              value={String(settings.weekStartsOn)}
              onValueChange={(value) => settings.updateSettings({ weekStartsOn: Number(value) as 0 | 1 | 6 })}
            >
              <SelectTrigger id="weekStart">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">日曜日</SelectItem>
                <SelectItem value="1">月曜日</SelectItem>
                <SelectItem value="6">土曜日</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* デフォルトのタスク時間 */}
          <div className="space-y-2">
            <Label htmlFor="defaultDuration">新規タスクのデフォルト時間</Label>
            <Select
              value={String(settings.defaultDuration)}
              onValueChange={(value) => settings.updateSettings({ defaultDuration: Number(value) })}
            >
              <SelectTrigger id="defaultDuration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15分</SelectItem>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">1時間</SelectItem>
                <SelectItem value="90">1時間30分</SelectItem>
                <SelectItem value="120">2時間</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 営業時間 */}
          <div className="space-y-2">
            <Label>営業時間の設定</Label>
            <div className="flex items-center gap-2">
              <Select
                value={String(settings.businessHours.start)}
                onValueChange={(value) => 
                  settings.updateSettings({ 
                    businessHours: { ...settings.businessHours, start: Number(value) }
                  })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {formatHour(i, settings.timeFormat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm">〜</span>
              
              <Select
                value={String(settings.businessHours.end)}
                onValueChange={(value) => 
                  settings.updateSettings({ 
                    businessHours: { ...settings.businessHours, end: Number(value) }
                  })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {formatHour(i, settings.timeFormat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* その他の設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showWeekNumbers" className="cursor-pointer">
                週番号を表示
              </Label>
              <Checkbox
                id="showWeekNumbers"
                checked={settings.showWeekNumbers}
                onCheckedChange={(checked) => 
                  settings.updateSettings({ showWeekNumbers: checked as boolean })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showDeclined" className="cursor-pointer">
                辞退したイベントを表示
              </Label>
              <Checkbox
                id="showDeclined"
                checked={settings.showDeclinedEvents}
                onCheckedChange={(checked) => 
                  settings.updateSettings({ showDeclinedEvents: checked as boolean })
                }
              />
            </div>
          </div>
          
          {/* リセットボタン */}
          <div className="pt-4 border-t">
            <button
              onClick={() => {
                settings.resetSettings()
                onOpenChange(false)
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              設定をリセット
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}