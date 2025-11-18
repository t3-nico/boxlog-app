'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowUpDown, Clock, ListFilter } from 'lucide-react'

interface CalendarNavigationAreaProps {
  children?: React.ReactNode
}

/**
 * CalendarNavigationArea - カレンダーメインエリアのナビゲーション
 *
 * **配置**:
 * - CalendarHeaderとmainの間
 * - フィルター・ソート・その他のナビゲーション要素を配置
 *
 * **デザイン**:
 * - 高さ: 48px（コンテナ40px + 上padding 8px）
 * - ボーダー: 下部のみ
 */
export function CalendarNavigationArea({ children }: CalendarNavigationAreaProps) {
  // 仮コンテンツ（childrenがない場合のみ表示）
  const defaultContent = (
    <div className="flex w-full items-center gap-4">
      {/* 左側: アイコンボタン */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Clock className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListFilter className="h-4 w-4" />
        </Button>
      </div>

      {/* 右側: プログレスバー */}
      <div className="flex flex-1 items-center gap-2">
        <Progress value={65} className="h-2" />
        <span className="text-muted-foreground shrink-0 text-xs">65%</span>
      </div>
    </div>
  )

  return <nav className="flex h-12 shrink-0 items-center px-4 pt-2">{children || defaultContent}</nav>
}
