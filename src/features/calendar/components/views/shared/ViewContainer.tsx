'use client'

import { cn } from '@/lib/utils'

interface ViewContainerProps {
  children: React.ReactNode
  className?: string
  viewType?: string
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

/**
 * ビューのラッパーコンテナ
 * 各カレンダービュー（日/週/月など）の共通ラッパー
 */
export function ViewContainer({
  children,
  className,
  viewType,
  loading = false,
  error = null,
  onRefresh
}: ViewContainerProps) {
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-destructive text-lg font-medium mb-2">
            エラーが発生しました
          </div>
          <div className="text-muted-foreground mb-4">
            {error}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              再読み込み
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'flex-1 relative',
        'bg-background',
        viewType && `calendar-view-${viewType}`,
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">読み込み中...</span>
          </div>
        </div>
      )}
      
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  )
}