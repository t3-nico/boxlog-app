import { TableCell } from '@/components/ui/table'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar } from 'lucide-react'

interface DateTimeEditCellProps {
  /** 日時（ISO 8601形式） */
  dateTime: string | null | undefined
  /** 列幅 */
  width?: number
  /** 日時変更ハンドラー */
  onDateTimeChange?: (dateTime: string | null) => void
}

/**
 * 日時編集セル
 *
 * 日時の表示と編集を行うセル
 * - ISO 8601形式の日時を「YYYY/MM/DD HH:mm」形式で表示
 * - クリックで編集可能（将来実装予定）
 *
 * @example
 * ```tsx
 * <DateTimeEditCell
 *   dateTime="2024-01-15T10:30:00Z"
 *   width={160}
 *   onDateTimeChange={handleDateTimeChange}
 * />
 * ```
 */
export function DateTimeEditCell({ dateTime, width, onDateTimeChange }: DateTimeEditCellProps) {
  const style = width ? { width: `${width}px` } : undefined

  // 日時フォーマット（時刻があれば HH:mm も表示、なければ日付のみ）
  const formattedDateTime = dateTime ? format(new Date(dateTime), 'yyyy/MM/dd HH:mm', { locale: ja }) : null

  return (
    <TableCell onClick={(e) => e.stopPropagation()} className="text-muted-foreground text-sm" style={style}>
      {formattedDateTime ? (
        <div className="flex items-center gap-1">
          <Calendar className="size-3 shrink-0" />
          <span className="truncate">{formattedDateTime}</span>
        </div>
      ) : (
        <span className="text-muted-foreground/50">-</span>
      )}
    </TableCell>
  )
}
