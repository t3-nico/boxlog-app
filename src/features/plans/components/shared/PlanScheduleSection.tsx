'use client'

import { Button } from '@/components/ui/button'
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime'
import { configToReadable, ruleToConfig } from '@/features/plans/utils/rrule'
import { addDays, addWeeks, isToday, isTomorrow, startOfWeek } from 'date-fns'
import { Bell, Calendar, Clock, Repeat } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { DatePickerPopover } from './DatePickerPopover'
import { RecurrencePopover } from './RecurrencePopover'
import { ReminderSelect } from './ReminderSelect'
import { TimeSelect } from './TimeSelect'

// 日付クイックオプション
const DATE_QUICK_OPTIONS = [
  { label: '今日', getValue: () => new Date() },
  { label: '明日', getValue: () => addDays(new Date(), 1) },
  { label: '来週', getValue: () => addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1) },
] as const

// 所要時間プリセット（分単位）
const DURATION_PRESETS = [
  { label: '30分', minutes: 30 },
  { label: '1時間', minutes: 60 },
  { label: '2時間', minutes: 120 },
] as const

interface PlanScheduleSectionProps {
  // 日付・時刻
  selectedDate: Date | undefined
  startTime: string
  endTime: string
  onDateChange: (date: Date | undefined) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  // 繰り返し
  recurrenceRule: string | null
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null
  onRepeatTypeChange: (type: string) => void
  onRecurrenceRuleChange: (rule: string | null) => void
  // リマインダー
  reminderType: string
  onReminderChange: (type: string) => void
  // オプション
  showBorderTop?: boolean
  disabled?: boolean
}

/**
 * 日付・時刻・繰り返し・リマインダーの統一セクション
 *
 * PlanInspectorとPlanCreatePopoverで共通使用
 */
export function PlanScheduleSection({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  reminderType,
  onReminderChange,
  showBorderTop = false,
  disabled = false,
}: PlanScheduleSectionProps) {
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false)
  const recurrenceTriggerRef = useRef<HTMLButtonElement>(null)

  // 時刻自動調整フック
  const { handleStartTimeChange: autoStartTimeChange, handleEndTimeChange: autoEndTimeChange } = useAutoAdjustEndTime(
    startTime,
    endTime,
    onEndTimeChange
  )

  // 開始時刻変更ハンドラー
  const handleStartTimeChange = (time: string) => {
    autoStartTimeChange(time)
    onStartTimeChange(time)
  }

  // 終了時刻変更ハンドラー
  const handleEndTimeChange = (time: string) => {
    autoEndTimeChange(time)
    onEndTimeChange(time)
  }

  // 繰り返し表示テキスト
  const recurrenceDisplayText = useMemo(() => {
    if (recurrenceRule) {
      return configToReadable(ruleToConfig(recurrenceRule))
    }
    if (recurrenceType && recurrenceType !== 'none') {
      const typeMap: Record<string, string> = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月',
        yearly: '毎年',
        weekdays: '平日',
      }
      return typeMap[recurrenceType] || '繰り返し'
    }
    return '繰り返し'
  }, [recurrenceRule, recurrenceType])

  // 繰り返しが設定されているか
  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none')

  // 選択中の日付がクイックオプションに該当するかチェック
  const getActiveQuickOption = () => {
    if (!selectedDate) return null
    if (isToday(selectedDate)) return '今日'
    if (isTomorrow(selectedDate)) return '明日'
    return null
  }
  const activeQuickOption = getActiveQuickOption()

  // 所要時間プリセットを適用
  const applyDurationPreset = (minutes: number) => {
    if (!startTime) return

    const [hour, min] = startTime.split(':').map(Number)
    const startMinutes = hour! * 60 + min!
    let endMinutes = startMinutes + minutes

    // 24時を超えた場合は23:59に制限
    if (endMinutes >= 24 * 60) {
      endMinutes = 23 * 60 + 59
    }

    const endHour = Math.floor(endMinutes / 60)
    const endMin = endMinutes % 60
    const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
    onEndTimeChange(newEndTime)
  }

  // 現在の所要時間（分）を取得
  const getCurrentDurationMinutes = () => {
    if (!startTime || !endTime) return null
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    return endHour! * 60 + endMin! - (startHour! * 60 + startMin!)
  }
  const currentDuration = getCurrentDurationMinutes()

  // プロパティグリッド: ラベル幅を統一
  const labelClassName = 'text-muted-foreground flex h-8 w-24 flex-shrink-0 items-center text-sm'
  const valueClassName = 'flex h-8 flex-1 items-center'

  // クイックオプションのスタイル
  const quickOptionClassName = (isActive: boolean) =>
    `h-6 rounded-md px-2 text-xs transition-colors ${
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <div className={showBorderTop ? 'border-border/50 border-t' : ''}>
      {/* 日付行 */}
      <div className="flex h-10 items-center px-6">
        <div className={labelClassName}>
          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
          日付
        </div>
        <div className={valueClassName}>
          <DatePickerPopover selectedDate={selectedDate} onDateChange={onDateChange} />
          {/* クイックオプション */}
          <div className="ml-2 flex items-center gap-1">
            {DATE_QUICK_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                disabled={disabled}
                onClick={() => onDateChange(option.getValue())}
                className={quickOptionClassName(activeQuickOption === option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 時間行 */}
      <div className="flex h-10 items-center px-6">
        <div className={labelClassName}>
          <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
          時間
        </div>
        <div className={valueClassName}>
          <TimeSelect value={startTime} onChange={handleStartTimeChange} label="" disabled={disabled} />
          <span className="text-muted-foreground mx-1">→</span>
          <TimeSelect
            value={endTime}
            onChange={handleEndTimeChange}
            label=""
            disabled={disabled || !startTime}
            minTime={startTime}
          />
          {/* 所要時間プリセット */}
          {startTime && (
            <div className="ml-2 flex items-center gap-1">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyDurationPreset(preset.minutes)}
                  className={quickOptionClassName(currentDuration === preset.minutes)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 繰り返し行 */}
      <div className="flex h-10 items-center px-6">
        <div className={labelClassName}>
          <Repeat className="mr-2 h-4 w-4 flex-shrink-0" />
          繰り返し
        </div>
        <div className={valueClassName}>
          <Button
            ref={recurrenceTriggerRef}
            variant="ghost"
            size="sm"
            className={`h-8 pr-2 pl-0 ${hasRecurrence ? 'text-foreground' : 'text-muted-foreground'}`}
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              setRecurrencePopoverOpen(!recurrencePopoverOpen)
            }}
          >
            <span className="text-sm">{hasRecurrence ? recurrenceDisplayText : 'なし'}</span>
          </Button>

          <RecurrencePopover
            open={recurrencePopoverOpen}
            onOpenChange={setRecurrencePopoverOpen}
            triggerRef={recurrenceTriggerRef}
            recurrenceRule={recurrenceRule}
            onRepeatTypeChange={onRepeatTypeChange}
            onRecurrenceRuleChange={onRecurrenceRuleChange}
            currentValue={hasRecurrence ? recurrenceDisplayText : ''}
          />
        </div>
      </div>

      {/* リマインダー行 */}
      <div className="flex h-10 items-center px-6">
        <div className={labelClassName}>
          <Bell className="mr-2 h-4 w-4 flex-shrink-0" />
          通知
        </div>
        <div className={valueClassName}>
          <ReminderSelect value={reminderType} onChange={onReminderChange} variant="inspector" disabled={disabled} />
        </div>
      </div>
    </div>
  )
}
