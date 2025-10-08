'use client'

import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'

import { cn } from '@/lib/utils'

interface DayDateHeaderProps {
  date: Date
  timezone?: string
  className?: string
}

/**
 * DayView専用の日付ヘッダー
 * シンプルな日付表示
 */
export const DayDateHeader = ({ date, timezone, className }: DayDateHeaderProps) => {
  const today = isToday(date)

  return (
    <div className={cn('bg-background flex items-center justify-between border-b px-6 py-4', className)}>
      <div className="flex items-center gap-4">
        {/* 日付表示 */}
        <div className="flex items-baseline gap-2">
          <h1 className={cn('text-2xl font-semibold', today && 'text-blue-600 dark:text-blue-400')}>
            {format(date, 'yyyy年M月d日', { locale: ja })}
          </h1>
          <span className={cn('text-muted-foreground text-lg', today && 'text-blue-600/70 dark:text-blue-400/70')}>
            {format(date, 'EEEE', { locale: ja })}
          </span>
        </div>

        {/* 今日のインジケーター */}
        {today != null && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            今日
          </span>
        )}
      </div>

      {/* タイムゾーン表示 */}
      {timezone != null && <div className="text-muted-foreground text-sm">{timezone}</div>}
    </div>
  )
}

export default DayDateHeader
