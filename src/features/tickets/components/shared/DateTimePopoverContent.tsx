'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { RecurrencePopover } from '@/features/tickets/components/shared/RecurrencePopover'
import { ReminderSelect } from '@/features/tickets/components/shared/ReminderSelect'
import { TimeSelect } from '@/features/tickets/components/shared/TimeSelect'
import { addHours, parse } from 'date-fns'
import { ArrowRight, Bell, Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface DateTimePopoverContentProps {
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  startTime: string
  onStartTimeChange: (time: string) => void
  endTime: string
  onEndTimeChange: (time: string) => void
  reminderType: string
  onReminderChange: (type: string) => void
  recurrenceRule?: string | null
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'
  onRepeatTypeChange: (type: string) => void
  onRecurrenceRuleChange: (rule: string | null) => void
}

/**
 * 日付・時刻・通知・繰り返し設定のPopover内容コンポーネント
 * TicketCardとTicketKanbanBoardで共有
 */
export function DateTimePopoverContent({
  selectedDate,
  onDateSelect,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  reminderType,
  onReminderChange,
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
}: DateTimePopoverContentProps) {
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false)
  const recurrenceTriggerRef = useRef<HTMLDivElement>(null)
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState(false)
  const [previousStartTime, setPreviousStartTime] = useState(startTime)

  // バリデーション: 繰り返しは日付が必須、通知は日付と開始時刻が必須
  const isRecurrenceDisabled = !selectedDate
  const isReminderDisabled = !selectedDate || !startTime

  // 開始時刻が変更されたら、終了時刻を自動調整
  // - 終了時刻が既に設定されている場合: 時間幅を保持
  // - 終了時刻が未設定の場合: +1時間
  useEffect(() => {
    if (startTime && startTime !== previousStartTime) {
      try {
        const startDate = parse(startTime, 'HH:mm', new Date())

        if (endTime && !isEndTimeManuallySet) {
          // 終了時刻が既に設定されている場合: 時間幅を保持
          const prevStartDate = parse(previousStartTime || startTime, 'HH:mm', new Date())
          const endDate = parse(endTime, 'HH:mm', new Date())
          const durationMinutes = (endDate.getTime() - prevStartDate.getTime()) / (1000 * 60)

          // 開始時刻 + 既存の時間幅
          const newEndDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
          const calculatedEndTime = `${newEndDate.getHours().toString().padStart(2, '0')}:${newEndDate.getMinutes().toString().padStart(2, '0')}`
          onEndTimeChange(calculatedEndTime)
        } else if (!endTime && !isEndTimeManuallySet) {
          // 終了時刻が未設定の場合: +1時間
          const newEndDate = addHours(startDate, 1)
          const calculatedEndTime = `${newEndDate.getHours().toString().padStart(2, '0')}:${newEndDate.getMinutes().toString().padStart(2, '0')}`
          onEndTimeChange(calculatedEndTime)
        }

        setPreviousStartTime(startTime)
      } catch {
        // パースエラーの場合は何もしない
      }
    }
  }, [startTime, endTime, isEndTimeManuallySet, previousStartTime, onEndTimeChange])

  // 開始時刻変更ハンドラー（自動計算フラグをリセット）
  const handleStartTimeChange = (time: string) => {
    setIsEndTimeManuallySet(false) // 開始時刻を変更したら自動計算を再開
    onStartTimeChange(time)
  }

  // 終了時刻変更ハンドラー（手動設定フラグを立てる）
  const handleEndTimeChange = (time: string) => {
    setIsEndTimeManuallySet(true) // 終了時刻を手動で変更したら自動計算を停止
    onEndTimeChange(time)
  }

  return (
    <div className="space-y-4">
      {/* 日付選択 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <CalendarIcon className="mr-2 size-4" />
          <span>日付</span>
        </div>
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          className="w-fit border-none bg-transparent p-0"
        />
      </div>

      {/* 時刻設定 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Clock className="mr-2 size-4" />
          <span>時刻</span>
        </div>
        <div className="flex items-end gap-2">
          <TimeSelect value={startTime} onChange={handleStartTimeChange} label="開始" />
          <ArrowRight className="text-muted-foreground mb-2 size-4" />
          <TimeSelect value={endTime} onChange={handleEndTimeChange} label="終了" />
        </div>
      </div>

      {/* 通知設定 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Bell className="mr-2 size-4" />
          <span>通知</span>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div>
                <ReminderSelect
                  value={reminderType}
                  onChange={onReminderChange}
                  variant="button"
                  disabled={isReminderDisabled}
                />
              </div>
            </TooltipTrigger>
            {isReminderDisabled && (
              <TooltipContent>
                <p className="text-xs">日付と開始時刻を先に設定してください</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 繰り返し設定 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Repeat className="mr-2 size-4" />
          <span>繰り返し</span>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="relative" ref={recurrenceTriggerRef}>
                <button
                  type="button"
                  disabled={isRecurrenceDisabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isRecurrenceDisabled) {
                      setRecurrencePopoverOpen(!recurrencePopoverOpen)
                    }
                  }}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-fit items-center gap-1 rounded-md border bg-transparent px-2 py-0 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {recurrenceRule
                      ? 'カスタム'
                      : recurrenceType === 'daily'
                        ? '毎日'
                        : recurrenceType === 'weekly'
                          ? '毎週'
                          : recurrenceType === 'monthly'
                            ? '毎月'
                            : recurrenceType === 'yearly'
                              ? '毎年'
                              : recurrenceType === 'weekdays'
                                ? '平日'
                                : 'なし'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 opacity-50"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {!isRecurrenceDisabled && (
                  <RecurrencePopover
                    open={recurrencePopoverOpen}
                    onOpenChange={setRecurrencePopoverOpen}
                    triggerRef={recurrenceTriggerRef}
                    recurrenceRule={recurrenceRule ?? null}
                    placement="right"
                    onRepeatTypeChange={onRepeatTypeChange}
                    onRecurrenceRuleChange={onRecurrenceRuleChange}
                  />
                )}
              </div>
            </TooltipTrigger>
            {isRecurrenceDisabled && (
              <TooltipContent>
                <p className="text-xs">日付を先に設定してください</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
