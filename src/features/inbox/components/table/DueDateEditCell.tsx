import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell } from '@/components/ui/table'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { X } from 'lucide-react'
import { useState } from 'react'

interface DueDateEditCellProps {
  /** 現在の期限日 */
  dueDate?: string | null
  /** 列幅 */
  width?: number
  /** 期限日変更時のコールバック */
  onDueDateChange: (date: string | null) => void
}

/**
 * 期限日編集可能セル
 *
 * クリックでポップオーバーを開き、期限日を変更可能
 * - ホバーで編集可能であることを示す
 * - クリックでカレンダーUI表示
 * - 行クリックイベントの伝播を防止
 *
 * @example
 * ```tsx
 * <DueDateEditCell
 *   dueDate={item.due_date}
 *   width={column?.width}
 *   onDueDateChange={(newDate) => updateDueDate(item.id, newDate)}
 * />
 * ```
 */
export function DueDateEditCell({ dueDate, width, onDueDateChange }: DueDateEditCellProps) {
  const [open, setOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDueDateChange(date.toISOString())
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDueDateChange(null)
    setOpen(false)
  }

  const style = width ? { width: `${width}px` } : undefined

  return (
    <TableCell
      onClick={(e) => e.stopPropagation()}
      className="group hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              {dueDate
                ? formatDistanceToNow(new Date(dueDate), {
                    addSuffix: true,
                    locale: ja,
                  })
                : '-'}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">期限日を選択</p>
              {dueDate && (
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-auto p-1">
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <MiniCalendar selectedDate={dueDate ? new Date(dueDate) : undefined} onDateSelect={handleDateSelect} />
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}
