'use client'

import { Calendar, CalendarDays, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  type?: 'no-events' | 'no-data' | 'loading-error' | 'custom'
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * 空状態表示
 * データがない場合の表示コンポーネント
 */
export function EmptyState({
  type = 'no-events',
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'no-events':
        return {
          icon: <Calendar className="h-12 w-12 text-muted-foreground" />,
          title: 'イベントがありません',
          description: '新しいイベントを作成して予定を管理しましょう'
        }
      case 'no-data':
        return {
          icon: <CalendarDays className="h-12 w-12 text-muted-foreground" />,
          title: 'データがありません',
          description: 'この期間にはデータが存在しません'
        }
      case 'loading-error':
        return {
          icon: <Calendar className="h-12 w-12 text-destructive" />,
          title: '読み込みエラー',
          description: 'データの読み込み中にエラーが発生しました'
        }
      default:
        return {
          icon: <Calendar className="h-12 w-12 text-muted-foreground" />,
          title: '',
          description: ''
        }
    }
  }

  const defaultContent = getDefaultContent()
  const displayIcon = icon || defaultContent.icon
  const displayTitle = title || defaultContent.title
  const displayDescription = description || defaultContent.description

  return (
    <div className={cn(
      'flex-1 flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      {/* アイコン */}
      <div className="mb-4">
        {displayIcon}
      </div>

      {/* タイトル */}
      {displayTitle && (
        <h3 className="text-lg font-medium text-foreground mb-2">
          {displayTitle}
        </h3>
      )}

      {/* 説明 */}
      {displayDescription && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {displayDescription}
        </p>
      )}

      {/* アクションボタン */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-2 px-4 py-2',
            'bg-primary text-primary-foreground',
            'rounded-md hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  )
}