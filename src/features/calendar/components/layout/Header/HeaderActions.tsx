'use client'

import { Download, MoreHorizontal, Settings, Upload } from 'lucide-react'

import { useI18n } from '@/lib/i18n/hooks'
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
  const { t } = useI18n()
  const buttonClass = cn(
    'rounded-md p-2 transition-colors',
    'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
    compact ? 'p-1.5' : 'p-2'
  )

  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 設定 */}
      {onSettings != null ? (
        <button type="button" onClick={onSettings} className={buttonClass} title={t('calendar.headerActions.settings')} aria-label={t('calendar.headerActions.settings')}>
          <Settings className={iconSize} />
        </button>
      ) : null}

      {/* エクスポート */}
      {onExport != null ? (
        <button type="button" onClick={onExport} className={buttonClass} title={t('calendar.headerActions.export')} aria-label={t('calendar.headerActions.export')}>
          <Download className={iconSize} />
        </button>
      ) : null}

      {/* インポート */}
      {onImport != null ? (
        <button type="button" onClick={onImport} className={buttonClass} title={t('calendar.headerActions.import')} aria-label={t('calendar.headerActions.import')}>
          <Upload className={iconSize} />
        </button>
      ) : null}

      {/* その他 */}
      {onMore != null ? (
        <button type="button" onClick={onMore} className={buttonClass} title={t('calendar.headerActions.moreOptions')} aria-label={t('calendar.headerActions.moreOptions')}>
          <MoreHorizontal className={iconSize} />
        </button>
      ) : null}
    </div>
  )
}
