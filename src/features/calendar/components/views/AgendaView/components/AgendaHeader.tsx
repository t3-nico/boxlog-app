'use client'

import React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock, LocateFixed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadcn-ui/button'
import type { AgendaHeaderProps } from '../AgendaView.types'

/**
 * AgendaHeader - リストのヘッダー
 * 
 * @description
 * アジェンダビューの上部ヘッダー：
 * - 表示期間の情報
 * - 総イベント数
 * - 今日へのジャンプボタン
 */
export function AgendaHeader({
  startDate,
  endDate,
  totalEvents,
  todayIndex,
  onScrollToToday,
  className
}: AgendaHeaderProps) {
  
  // 期間の表示テキストを生成
  const periodText = React.useMemo(() => {
    const start = format(startDate, 'M月d日', { locale: ja })
    const end = format(endDate, 'M月d日', { locale: ja })
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    
    // 同じ日の場合
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return `${startYear}年 ${start}`
    }
    
    // 同じ年の場合
    if (startYear === endYear) {
      return `${startYear}年 ${start} - ${end}`
    }
    
    // 異なる年の場合
    return `${startYear}年${start} - ${endYear}年${end}`
  }, [startDate, endDate])
  
  // 今日が期間内にあるかどうか
  const hasTodayInPeriod = todayIndex !== -1
  
  return (
    <div className={cn(
      'agenda-header border-b bg-background/95 backdrop-blur-sm',
      'sticky top-0 z-20 px-4 py-3',
      className
    )}>
      <div className="flex items-center justify-between">
        {/* 期間と統計情報 */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              予定表
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{periodText}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalEvents}件の予定
              </span>
            </div>
          </div>
        </div>
        
        {/* アクション */}
        <div className="flex items-center gap-2">
          {/* 今日へジャンプボタン */}
          {hasTodayInPeriod && onScrollToToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={onScrollToToday}
              className="flex items-center gap-2"
            >
              <LocateFixed className="w-4 h-4" />
              今日へ
            </Button>
          )}
          
          {/* 今日が期間外の場合の案内 */}
          {!hasTodayInPeriod && (
            <div className="text-xs text-muted-foreground">
              今日は表示期間外
            </div>
          )}
        </div>
      </div>
      
      {/* イベント数の詳細（多い場合の警告など） */}
      {totalEvents > 50 && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded">
          ⚠️ 予定が多く表示されています。期間を短くするとパフォーマンスが向上します。
        </div>
      )}
      
      {/* 空の状態の場合のヒント */}
      {totalEvents === 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          この期間には予定がありません
        </div>
      )}
    </div>
  )
}