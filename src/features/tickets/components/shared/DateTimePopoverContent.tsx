'use client'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { RecurrencePopover } from '@/features/tickets/components/shared/RecurrencePopover'
import { ReminderSelect } from '@/features/tickets/components/shared/ReminderSelect'
import { ArrowRight, Bell, Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react'
import { useRef, useState } from 'react'

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
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">開始</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
            />
          </div>
          <ArrowRight className="text-muted-foreground mb-2 size-4" />
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs">終了</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
            />
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Bell className="mr-2 size-4" />
          <span>通知</span>
        </div>
        <ReminderSelect value={reminderType} onChange={onReminderChange} variant="button" />
      </div>

      {/* 繰り返し設定 */}
      <div className="space-y-2">
        <div className="flex items-center text-sm font-medium">
          <Repeat className="mr-2 size-4" />
          <span>繰り返し</span>
        </div>
        <div className="relative" ref={recurrenceTriggerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setRecurrencePopoverOpen(!recurrencePopoverOpen)
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

          <RecurrencePopover
            open={recurrencePopoverOpen}
            onOpenChange={setRecurrencePopoverOpen}
            triggerRef={recurrenceTriggerRef}
            recurrenceRule={recurrenceRule ?? null}
            placement="right"
            onRepeatTypeChange={onRepeatTypeChange}
            onRecurrenceRuleChange={onRecurrenceRuleChange}
          />
        </div>
      </div>
    </div>
  )
}
