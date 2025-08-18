'use client'

import { Settings, Download, Upload, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderActionsProps {
  onSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  onMore?: () => void
  className?: string
  compact?: boolean
}

/**
 * ヘッダーアクションボタン群
 * 設定、インポート/エクスポート、その他のアクション
 */
export function HeaderActions({
  onSettings,
  onExport,
  onImport,
  onMore,
  className,
  compact = false
}: HeaderActionsProps) {
  const buttonClass = cn(
    'p-2 rounded-md transition-colors',
    'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
    compact ? 'p-1.5' : 'p-2'
  )

  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 設定 */}
      {onSettings && (
        <button
          onClick={onSettings}
          className={buttonClass}
          title="設定"
          aria-label="Settings"
        >
          <Settings className={iconSize} />
        </button>
      )}

      {/* エクスポート */}
      {onExport && (
        <button
          onClick={onExport}
          className={buttonClass}
          title="エクスポート"
          aria-label="Export"
        >
          <Download className={iconSize} />
        </button>
      )}

      {/* インポート */}
      {onImport && (
        <button
          onClick={onImport}
          className={buttonClass}
          title="インポート"
          aria-label="Import"
        >
          <Upload className={iconSize} />
        </button>
      )}

      {/* その他 */}
      {onMore && (
        <button
          onClick={onMore}
          className={buttonClass}
          title="その他"
          aria-label="More options"
        >
          <MoreHorizontal className={iconSize} />
        </button>
      )}
    </div>
  )
}