'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { DatePickerPopover } from './DatePickerPopover'

// 15分刻みの時間オプションを生成（0:00 - 23:45）
const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(timeString)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

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

  return (
    <div className={`px-6 pt-3 pb-0 ${showBorderTop ? 'border-border/50 border-t' : ''}`}>
      <div className="flex items-center gap-3">
        <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />

        <DatePickerPopover selectedDate={selectedDate} onDateChange={onDateChange} />

        <Select value={startTime} onValueChange={onStartTimeChange}>
          <SelectTrigger className="w-auto !border-0 !bg-transparent !shadow-none hover:!bg-transparent focus:!ring-0 [&_svg]:hidden">
            <SelectValue placeholder="開始" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={`start-${time}`} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">→</span>

        <Select value={endTime} onValueChange={onEndTimeChange} disabled={!startTime}>
          <SelectTrigger className="w-auto !border-0 !bg-transparent !shadow-none hover:!bg-transparent focus:!ring-0 [&_svg]:hidden">
            <SelectValue placeholder="終了" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
            {TIME_OPTIONS.map((time) => {
              if (!startTime) return null

              const [startHour, startMin] = startTime.split(':').map(Number)
              const [endHour, endMin] = time.split(':').map(Number)
              const startMinutes = startHour * 60 + startMin
              const endMinutes = endHour * 60 + endMin

              if (endMinutes <= startMinutes) return null

              return (
                <SelectItem key={`end-${time}`} value={time}>
                  {time}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {elapsedTime && <span className="text-muted-foreground text-sm">{elapsedTime}</span>}
      </div>
    </div>
  )
}
