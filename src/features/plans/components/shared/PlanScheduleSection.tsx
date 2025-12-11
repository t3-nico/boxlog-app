'use client'

import { Button } from '@/components/ui/button'
import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime'
import { configToReadable, ruleToConfig } from '@/features/plans/utils/rrule'
import { Bell, Calendar, Clock, Repeat } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { DatePickerPopover } from './DatePickerPopover'
import { RecurrencePopover } from './RecurrencePopover'
import { ReminderSelect } from './ReminderSelect'
import { TimeSelect } from './TimeSelect'

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

  // 経過時間を計算（00:00形式）
  const elapsedTime = useMemo(() => {
    if (!startTime || !endTime) return null

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour! * 60 + startMin!
    const endMinutes = endHour! * 60 + endMin!

    const diffMinutes = endMinutes - startMinutes
    if (diffMinutes <= 0) return null

    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [startTime, endTime])

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

  // プロパティグリッド: ラベル幅を統一
  const labelClassName = 'text-muted-foreground flex h-8 w-24 flex-shrink-0 items-center text-sm'
  const valueClassName = 'flex h-8 flex-1 items-center'

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
          {elapsedTime && <span className="text-muted-foreground ml-2 text-sm">({elapsedTime})</span>}
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
