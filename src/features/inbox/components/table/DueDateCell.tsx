import { MiniCalendar } from '@/components/common/MiniCalendar'
import { TableCell } from '@/components/ui/table'
import { useDateFormat } from '@/features/settings/hooks/useDateFormat'

interface DueDateCellProps {
  /** 期限日時（ISO 8601 or YYYY-MM-DD） */
  dueDate?: string | null
  /** 列幅 */
  width?: number
  /** 期限変更ハンドラー */
  onDueDateChange?: (dueDate: string | null) => void
}

/**
 * 期限編集セル（日付のみ）
 *
 * 期限の日付を表示・編集
 * - クリックでミニカレンダー表示
 * - 日付のみ表示（yyyy/MM/dd形式）
 * - あり: "2025/11/17"
 * - なし: "-"
 *
 * @example
 * ```tsx
 * <DueDateCell
 *   dueDate="2025-11-11T14:30:00Z"
 *   width={120}
 *   onDueDateChange={handleDueDateChange}
 * />
 * ```
 */
export function DueDateCell({ dueDate, width, onDueDateChange }: DueDateCellProps) {
  const { formatDate: formatDateWithSettings } = useDateFormat()

  const formatDateDisplay = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return null
    try {
      return formatDateWithSettings(new Date(dateTimeStr))
    } catch {
      return null
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onDueDateChange?.(null)
      return
    }

    // 既存の時刻を保持して日付のみ更新
    if (dueDate) {
      const existingDate = new Date(dueDate)
      const newDate = new Date(date)
      newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), 0, 0)
      onDueDateChange?.(newDate.toISOString())
    } else {
      // 時刻がない場合はデフォルト時刻（00:00）で設定
      const newDate = new Date(date)
      newDate.setHours(0, 0, 0, 0)
      onDueDateChange?.(newDate.toISOString())
    }
  }

  const displayText = formatDateDisplay(dueDate) || '-'
  const selectedDate = dueDate ? new Date(dueDate) : undefined
  const style = width ? { width: `${width}px`, minWidth: `${width}px` } : undefined

  return (
    <TableCell onClick={(e) => e.stopPropagation()} className="text-muted-foreground text-sm" style={style}>
      <MiniCalendar
        asPopover
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        popoverAlign="start"
        popoverTrigger={
          <div className="hover:bg-state-hover cursor-pointer rounded px-2 py-1 transition-colors">
            <span className="truncate">{displayText}</span>
          </div>
        }
      />
    </TableCell>
  )
}
