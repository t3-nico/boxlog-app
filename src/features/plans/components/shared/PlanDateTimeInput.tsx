'use client'

import { useAutoAdjustEndTime } from '@/features/plans/hooks/useAutoAdjustEndTime'
import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { DatePickerPopover } from './DatePickerPopover'
import { TimeSelect } from './TimeSelect'

interface PlanDateTimeInputProps {
  selectedDate: Date | undefined
  startTime: string
  endTime: string
  onDateChange: (date: Date | undefined) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  showBorderTop?: boolean
}

export function PlanDateTimeInput({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  showBorderTop = false,
}: PlanDateTimeInputProps) {
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

  return (
    <div className={`flex h-12 items-center px-6 pt-2 pb-1 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className="flex items-center gap-3">
        <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />

        <DatePickerPopover selectedDate={selectedDate} onDateChange={onDateChange} />

        <TimeSelect value={startTime} onChange={handleStartTimeChange} label="" />

        <span className="text-muted-foreground">→</span>

        <TimeSelect value={endTime} onChange={handleEndTimeChange} label="" disabled={!startTime} minTime={startTime} />
      </div>

      {elapsedTime && (
        <span className="text-muted-foreground flex h-8 w-12 items-center justify-center text-sm">
          {elapsedTime}
        </span>
      )}
    </div>
  )
}
