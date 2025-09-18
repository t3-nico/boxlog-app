'use client'

import { Download, MoreHorizontal, Settings, Upload } from 'lucide-react'

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
export const HeaderActions = ({
  onSettings,
  onExport,
  onImport,
  onMore,
  className,
  compact = false,
}: HeaderActionsProps) => {
  const buttonClass = cn(
    'rounded-md p-2 transition-colors',
    'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
    compact ? 'p-1.5' : 'p-2'
  )

  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 設定 */}
      {onSettings && (
        <button type="button" onClick={onSettings} className={buttonClass} title="Settings" aria-label="Settings">
          <Settings className={iconSize} />
        </button>
      )}

      {/* エクスポート */}
      {onExport && (
        <button type="button" onClick={onExport} className={buttonClass} title="Export" aria-label="Export">
          <Download className={iconSize} />
        </button>
      )}

      {/* インポート */}
      {onImport && (
        <button type="button" onClick={onImport} className={buttonClass} title="Import" aria-label="Import">
          <Upload className={iconSize} />
        </button>
      )}

      {/* その他 */}
      {onMore && (
        <button type="button" onClick={onMore} className={buttonClass} title="More" aria-label="More options">
          <MoreHorizontal className={iconSize} />
        </button>
      )}
    </div>
  )
}
