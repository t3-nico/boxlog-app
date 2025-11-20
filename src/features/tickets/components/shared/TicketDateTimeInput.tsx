'use client'

import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DatePickerPopover } from './DatePickerPopover'
import { TimeSelect } from './TimeSelect'

interface TicketDateTimeInputProps {
  selectedDate: Date | undefined
  startTime: string
  endTime: string
  onDateChange: (date: Date | undefined) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  showBorderTop?: boolean
}

export function TicketDateTimeInput({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  showBorderTop = false,
}: TicketDateTimeInputProps) {
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState(false)
  const [previousStartTime, setPreviousStartTime] = useState(startTime)

  // 経過時間を計算（00:00形式）
  const elapsedTime = useMemo(() => {
    if (!startTime || !endTime) return null

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    const diffMinutes = endMinutes - startMinutes
    if (diffMinutes <= 0) return null

    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [startTime, endTime])

  // 開始時刻が変更されたら、終了時刻を自動調整（時間幅保持）
  useEffect(() => {
    if (startTime && startTime !== previousStartTime && !isEndTimeManuallySet) {
      try {
        const [startHour, startMin] = startTime.split(':').map(Number)

        if (endTime) {
          // 終了時刻が既に設定されている場合: 時間幅を保持
          const [prevStartHour, prevStartMin] = (previousStartTime || startTime).split(':').map(Number)
          const [endHour, endMin] = endTime.split(':').map(Number)

          const prevStartMinutes = prevStartHour * 60 + prevStartMin
          const endMinutes = endHour * 60 + endMin
          const durationMinutes = endMinutes - prevStartMinutes

          // 開始時刻 + 既存の時間幅
          const startMinutes = startHour * 60 + startMin
          const newEndMinutes = startMinutes + durationMinutes
          const newEndHour = Math.floor(newEndMinutes / 60) % 24
          const newEndMin = newEndMinutes % 60

          const calculatedEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`
          onEndTimeChange(calculatedEndTime)
        } else {
          // 終了時刻が未設定の場合: +1時間
          const newEndHour = (startHour + 1) % 24
          const calculatedEndTime = `${newEndHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
          onEndTimeChange(calculatedEndTime)
        }

        setPreviousStartTime(startTime)
      } catch {
        // パースエラーの場合は何もしない
      }
    }
  }, [startTime, endTime, previousStartTime, isEndTimeManuallySet, onEndTimeChange])

  // 開始時刻変更ハンドラー
  const handleStartTimeChange = (time: string) => {
    setIsEndTimeManuallySet(false) // 開始時刻を変更したら自動計算を再開
    onStartTimeChange(time)
  }

  // 終了時刻変更ハンドラー
  const handleEndTimeChange = (time: string) => {
    setIsEndTimeManuallySet(true) // 終了時刻を手動で変更したら自動計算を停止
    onEndTimeChange(time)
  }

  return (
    <div className={`flex h-[48px] items-center px-6 pt-2 pb-1 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className="flex items-center gap-3">
        <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />

        <DatePickerPopover selectedDate={selectedDate} onDateChange={onDateChange} />

        <TimeSelect value={startTime} onChange={handleStartTimeChange} label="" />

        <span className="text-muted-foreground">→</span>

        <TimeSelect value={endTime} onChange={handleEndTimeChange} label="" disabled={!startTime} />
      </div>

      {elapsedTime && (
        <span className="text-muted-foreground flex h-8 w-[48px] items-center justify-center text-sm">
          {elapsedTime}
        </span>
      )}
    </div>
  )
}
