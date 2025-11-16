import { TableCell } from '@/components/ui/table'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface DurationRangeCellProps {
  /** 開始時刻（ISO 8601） */
  startTime?: string | null
  /** 終了時刻（ISO 8601） */
  endTime?: string | null
  /** 列幅 */
  width?: number
}

/**
 * 期間表示セル（開始-終了時刻）
 *
 * 開始時刻と終了時刻を範囲表示
 * - 両方ある場合: "14:30 - 16:00"
 * - 開始のみ: "14:30 -"
 * - 終了のみ: "- 16:00"
 * - なし: "-"
 *
 * @example
 * ```tsx
 * <DurationRangeCell
 *   startTime="2025-11-11T14:30:00Z"
 *   endTime="2025-11-11T16:00:00Z"
 *   width={200}
 * />
 * ```
 */
export function DurationRangeCell({ startTime, endTime, width }: DurationRangeCellProps) {
  const formatTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return null
    try {
      return format(new Date(dateTimeStr), 'HH:mm', { locale: ja })
    } catch {
      return null
    }
  }

  const startFormatted = formatTime(startTime)
  const endFormatted = formatTime(endTime)

  let displayText = '-'
  if (startFormatted && endFormatted) {
    displayText = `${startFormatted} - ${endFormatted}`
  } else if (startFormatted) {
    displayText = `${startFormatted} -`
  } else if (endFormatted) {
    displayText = `- ${endFormatted}`
  }

  const style = width ? { width: `${width}px`, minWidth: `${width}px` } : undefined

  return (
    <TableCell className="text-muted-foreground text-sm" style={style}>
      <div className="truncate">{displayText}</div>
    </TableCell>
  )
}
