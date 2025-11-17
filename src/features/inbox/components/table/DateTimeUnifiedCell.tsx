import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableCell } from '@/components/ui/table'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowRight, Bell, Calendar as CalendarIcon, Clock, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DateTimeData {
  /** 日付（YYYY-MM-DD） */
  date: string | null
  /** 開始時刻（HH:mm） */
  startTime: string | null
  /** 終了時刻（HH:mm） */
  endTime: string | null
  /** リマインダー設定 */
  reminder: ReminderConfig | null
  /** 繰り返し設定 */
  recurrence: RecurrenceType | null
}

interface ReminderConfig {
  type: '5min' | '15min' | '30min' | '1hour' | '1day' | 'custom'
  customMinutes?: number
  enabled: boolean
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

interface DateTimeUnifiedCellProps {
  /** 日付時刻データ */
  data: DateTimeData
  /** 列幅 */
  width?: number
  /** 変更ハンドラー */
  onChange?: (data: DateTimeData) => void
}

/**
 * 統合日時セル（Notion風）
 *
 * 1つのカラムで日付・時刻・リマインダー・繰り返しを管理
 * - クリックでメニュー表示
 * - 日付のみ / 日付+時刻 / 日付+時刻範囲 に対応
 * - リマインダー・繰り返しのオプション設定
 *
 * @example
 * ```tsx
 * <DateTimeUnifiedCell
 *   data={{
 *     date: "2025-01-15",
 *     startTime: "14:30",
 *     endTime: "16:00",
 *     reminder: { type: '15min', enabled: true },
 *     recurrence: 'weekly'
 *   }}
 *   onChange={handleChange}
 * />
 * ```
 */
export function DateTimeUnifiedCell({ data, width, onChange }: DateTimeUnifiedCellProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.date ? new Date(data.date) : undefined)
  const [startTime, setStartTime] = useState(data.startTime || '')
  const [endTime, setEndTime] = useState(data.endTime || '')
  const [reminderType, setReminderType] = useState<ReminderConfig['type'] | 'none'>(data.reminder?.type || 'none')
  const [recurrence, setRecurrence] = useState<RecurrenceType>(data.recurrence || 'none')

  // 表示コンテンツを生成
  const getDisplayContent = () => {
    if (!data.date) return <span>-</span>

    const dateStr = format(new Date(data.date), 'yyyy/MM/dd', { locale: ja })
    const hasReminder = data.reminder?.enabled
    const hasRecurrence = data.recurrence && data.recurrence !== 'none'

    let timeStr = ''
    if (data.startTime && data.endTime) {
      timeStr = ` ${data.startTime} → ${data.endTime}`
    } else if (data.startTime) {
      timeStr = ` ${data.startTime}`
    }

    return (
      <span className="flex items-center gap-1">
        <span>
          {dateStr}
          {timeStr}
        </span>
        {hasReminder && <Bell className="size-3.5" />}
        {hasRecurrence && <Repeat className="size-3.5" />}
      </span>
    )
  }

  // 値が変更されたら即座に反映
  const handleChange = () => {
    const newData: DateTimeData = {
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      startTime: startTime || null,
      endTime: endTime || null,
      reminder:
        reminderType !== 'none'
          ? {
              type: reminderType as ReminderConfig['type'],
              enabled: true,
            }
          : null,
      recurrence,
    }
    onChange?.(newData)
  }

  // クリアハンドラー
  const handleClear = () => {
    const clearedData: DateTimeData = {
      date: null,
      startTime: null,
      endTime: null,
      reminder: null,
      recurrence: null,
    }
    onChange?.(clearedData)
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('none')
    setRecurrence('none')
    setOpen(false)
  }

  const style = width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined

  return (
    <TableCell onClick={(e) => e.stopPropagation()} className="text-muted-foreground text-sm" style={style}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1 transition-colors">
            {getDisplayContent()}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <div className="space-y-4">
            {/* 日付選択 */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <CalendarIcon className="mr-2 size-4" />
                <span>日付</span>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  handleChange()
                }}
                locale={ja}
                classNames={{
                  day: '!aspect-auto',
                  today: '!bg-transparent',
                }}
                className="w-fit border-none bg-transparent p-0 [&_.group\/day]:!aspect-auto [&_button]:!aspect-auto [&_button]:!h-8 [&_button]:!w-8 [&_button]:text-xs [&_nav]:!h-10 [&_table]:!mt-0 [&_table]:text-sm [&_td]:!aspect-auto [&_td]:!h-8 [&_td]:!w-8 [&_td]:p-0 [&_th]:!h-8 [&_th]:!w-8 [&_th]:p-0 [&_tr]:!mt-0"
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
                    onChange={(e) => {
                      setStartTime(e.target.value)
                      handleChange()
                    }}
                    className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
                  />
                </div>
                <ArrowRight className="text-muted-foreground mb-2 size-4" />
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">終了</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value)
                      handleChange()
                    }}
                    className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
                  />
                </div>
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Bell className="mr-2 size-4" />
                <span>リマインダー</span>
              </div>
              <Select
                value={reminderType}
                onValueChange={(value) => {
                  setReminderType(value as any)
                  handleChange()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="リマインダーなし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  <SelectItem value="5min">5分前</SelectItem>
                  <SelectItem value="15min">15分前</SelectItem>
                  <SelectItem value="30min">30分前</SelectItem>
                  <SelectItem value="1hour">1時間前</SelectItem>
                  <SelectItem value="1day">1日前</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 繰り返し設定 */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Repeat className="mr-2 size-4" />
                <span>繰り返し</span>
              </div>
              <Select
                value={recurrence}
                onValueChange={(value) => {
                  setRecurrence(value as RecurrenceType)
                  handleChange()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="繰り返しなし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                  <SelectItem value="monthly">毎月</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end">
              <Button onClick={handleClear} variant="secondary" size="sm">
                <Trash2 className="mr-2 size-4" />
                クリア
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}
