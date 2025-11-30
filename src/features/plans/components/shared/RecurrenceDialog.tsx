'use client'

import * as Portal from '@radix-ui/react-portal'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'

import type { RecurrenceConfig } from '../../types/plan'
import { configToRRule, ruleToConfig } from '../../utils/rrule'

interface RecurrenceDialogProps {
  value: string | null // RRULE文字列
  onChange: (rrule: string | null) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef?: React.RefObject<HTMLElement>
  placement?: 'bottom' | 'right' | 'left' // ポップアップの表示位置
}

/**
 * カスタム繰り返し設定ダイアログ（Portal版）
 *
 * **機能**:
 * - 頻度選択（毎日・毎週・毎月）
 * - 間隔設定（1-365）
 * - 曜日選択（週次のみ）
 * - 日付選択（月次のみ）
 * - 終了条件（無期限・日付指定・回数指定）
 *
 * **データ形式**:
 * - RRULE文字列（RFC 5545準拠）
 * - 例: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10"
 */
export function RecurrenceDialog({
  value,
  onChange,
  open,
  onOpenChange,
  triggerRef,
  placement = 'bottom',
}: RecurrenceDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  const [config, setConfig] = useState<RecurrenceConfig>(() => {
    if (value) {
      try {
        return ruleToConfig(value)
      } catch {
        // パースエラー時はデフォルト値
        const oneMonthLater = new Date()
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
        return {
          frequency: 'daily',
          interval: 1,
          endType: 'never',
          endDate: format(oneMonthLater, 'yyyy-MM-dd'),
        }
      }
    }
    // デフォルトで1ヶ月後を設定
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
    return {
      frequency: 'daily',
      interval: 1,
      endType: 'never',
      endDate: format(oneMonthLater, 'yyyy-MM-dd'),
    }
  })

  // 位置を動的に計算（DatePickerPopover と同じ方式）
  const getPosition = () => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dialogWidth = 400 // w-[400px]

      if (placement === 'right') {
        return {
          top: rect.top + window.scrollY,
          left: rect.right + window.scrollX + 4,
        }
      } else if (placement === 'left') {
        return {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX - dialogWidth - 4,
        }
      } else {
        return {
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        }
      }
    }
    return { top: 0, left: 0 }
  }

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedTrigger = triggerRef?.current && triggerRef.current.contains(target)
      const clickedDialog = dialogRef.current && dialogRef.current.contains(target)

      // Portal要素（Selectのドロップダウン、Calendarなど）をクリックした場合は閉じない
      const isPortalElement =
        (target as Element).closest('[role="listbox"]') || // Select dropdown
        (target as Element).closest('[role="dialog"]') || // Dialog
        (target as Element).closest('.react-datepicker') // Calendar (if any)

      if (!clickedTrigger && !clickedDialog && !isPortalElement) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return undefined
  }, [open, onOpenChange, triggerRef])

  const handleSave = () => {
    const rrule = configToRRule(config)
    onChange(rrule)
    onOpenChange(false)
  }

  // 曜日トグル
  const toggleWeekday = (index: number) => {
    const current = config.byWeekday || []
    const updated = current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort()
    setConfig({ ...config, byWeekday: updated })
  }

  if (!open) return null

  return (
    <Portal.Root>
      <div
        ref={dialogRef}
        className="bg-card border-border fixed z-[9999] w-[400px] overflow-hidden rounded-xl border shadow-lg"
        style={{
          top: `${getPosition().top}px`,
          left: `${getPosition().left}px`,
        }}
      >
        {/* ヘッダー */}
        <div className="px-6 py-4">
          <h3 className="text-foreground text-base font-semibold">繰り返し</h3>
        </div>

        {/* コンテンツ */}
        <div className="space-y-6 px-6 pb-4">
          {/* 1. 間隔 */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">間隔</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={config.interval}
                onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) || 1 })}
                className="w-16"
              />
              <Select
                value={config.frequency}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    frequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly',
                    // 頻度変更時にリセット
                    byWeekday: value === 'weekly' ? config.byWeekday : undefined,
                    byMonthDay: value === 'monthly' ? config.byMonthDay || 1 : undefined,
                  })
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <Portal.Root>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="daily">日ごと</SelectItem>
                    <SelectItem value="weekly">週間ごと</SelectItem>
                    <SelectItem value="monthly">ヶ月ごと</SelectItem>
                    <SelectItem value="yearly">年ごと</SelectItem>
                  </SelectContent>
                </Portal.Root>
              </Select>
            </div>
          </div>

          {/* 2. パターン（週次・月次のみ） */}
          {config.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">パターン</Label>
              <div className="flex gap-2">
                {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => {
                  // 月=1, 火=2, ..., 日=0 に変換
                  const weekdayIndex = index === 6 ? 0 : index + 1
                  return (
                    <Button
                      key={index}
                      variant={config.byWeekday?.includes(weekdayIndex) ? 'default' : 'outline'}
                      size="sm"
                      className="h-10 w-10 rounded-full p-0 text-sm"
                      onClick={() => toggleWeekday(weekdayIndex)}
                      type="button"
                    >
                      {day}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {config.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">パターン</Label>
              <Select
                value={
                  config.bySetPos !== undefined && config.byWeekday?.[0] !== undefined
                    ? `setpos-${config.bySetPos}-${config.byWeekday[0]}`
                    : `monthday-${config.byMonthDay || 1}`
                }
                onValueChange={(value) => {
                  if (value.startsWith('setpos-')) {
                    const [, setPos, weekday] = value.split('-')
                    setConfig({
                      ...config,
                      byMonthDay: undefined,
                      bySetPos: Number(setPos),
                      byWeekday: [Number(weekday)],
                    })
                  } else {
                    const monthDay = Number(value.split('-')[1])
                    setConfig({
                      ...config,
                      byMonthDay: monthDay,
                      bySetPos: undefined,
                      byWeekday: undefined,
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <Portal.Root>
                  <SelectContent className="z-[10000]">
                    {(() => {
                      // 現在の日付から候補を生成
                      const today = new Date()
                      const day = today.getDate()
                      const weekday = today.getDay()
                      const weekdayNames = ['日', '月', '火', '水', '木', '金', '土']
                      const weekdayName = weekdayNames[weekday]

                      // その日が第何週か計算
                      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                      const weekOfMonth = Math.ceil((day + firstDayOfMonth.getDay()) / 7)

                      // 最終週かどうか判定
                      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
                      const isLastWeek = day + 7 > lastDayOfMonth

                      const options = [
                        // 選択肢1: 毎月 X 日
                        <SelectItem key={`monthday-${day}`} value={`monthday-${day}`}>
                          毎月 {day} 日
                        </SelectItem>,
                        // 選択肢2: 毎月 第 N X曜日
                        <SelectItem key={`setpos-${weekOfMonth}-${weekday}`} value={`setpos-${weekOfMonth}-${weekday}`}>
                          毎月 第{weekOfMonth}
                          {weekdayName}曜日
                        </SelectItem>,
                      ]

                      // 最終週の場合は「最終X曜日」も追加
                      if (isLastWeek) {
                        options.push(
                          <SelectItem key={`setpos--1-${weekday}`} value={`setpos--1-${weekday}`}>
                            毎月 最終{weekdayName}曜日
                          </SelectItem>
                        )
                      }

                      return options
                    })()}
                  </SelectContent>
                </Portal.Root>
              </Select>
            </div>
          )}

          {/* 3. 期間 */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">期間</Label>
            <RadioGroup
              value={config.endType}
              onValueChange={(value) => setConfig({ ...config, endType: value as 'never' | 'until' | 'count' })}
              className="space-y-2"
            >
              {/* 1. 終了日未定 */}
              <div className="flex items-center gap-2">
                <RadioGroupItem value="never" id="end-never" />
                <Label htmlFor="end-never" className="text-foreground cursor-pointer text-sm font-normal">
                  終了日未定
                </Label>
              </div>

              {/* 2. 終了日指定 */}
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="until"
                  id="end-until"
                  onClick={() => {
                    setConfig({ ...config, endType: 'until' })
                    setShowCalendar(true)
                  }}
                />
                <Label
                  htmlFor="end-until"
                  className="text-foreground cursor-pointer text-sm font-normal"
                  onClick={() => {
                    setConfig({ ...config, endType: 'until' })
                    setShowCalendar(true)
                  }}
                >
                  終了日：
                </Label>
                <span className="text-foreground text-sm">
                  {config.endDate ? format(new Date(config.endDate), 'yyyy/MM/dd', { locale: ja }) : ''}
                </span>
              </div>

              {/* カレンダー表示 */}
              {showCalendar && config.endType === 'until' && (
                <div className="mt-2 ml-6">
                  <MiniCalendar
                    selectedDate={config.endDate ? new Date(config.endDate) : undefined}
                    onDateSelect={(date) => {
                      if (date) {
                        setConfig({ ...config, endDate: format(date, 'yyyy-MM-dd') })
                        setShowCalendar(false)
                      }
                    }}
                    className="rounded-md border"
                  />
                </div>
              )}

              {/* 3. 回数指定 */}
              <div className="flex items-center gap-2">
                <RadioGroupItem value="count" id="end-count" />
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={config.count || 4}
                  onChange={(e) => setConfig({ ...config, count: Number(e.target.value) || 4, endType: 'count' })}
                  disabled={config.endType !== 'count'}
                  className="w-20"
                />
                <span className="text-foreground text-sm">回 実施</span>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* フッター */}
        <div className="border-border flex items-center justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" size="sm">
            キャンセル
          </Button>
          <Button onClick={handleSave} type="button" size="sm">
            完了
          </Button>
        </div>
      </div>
    </Portal.Root>
  )
}
