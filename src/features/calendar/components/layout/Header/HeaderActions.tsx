'use client'

import { Download, MoreHorizontal, Settings, Upload } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface HeaderActionsProps {
  onSettings?: (() => void) | undefined
  onExport?: (() => void) | undefined
  onImport?: (() => void) | undefined
  onMore?: (() => void) | undefined
  className?: string | undefined
  compact?: boolean | undefined
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
  const t = useTranslations()
  const buttonClass = cn(
    'rounded-md p-2 transition-colors',
    'hover:bg-state-hover text-muted-foreground',
    compact ? 'p-2' : 'p-2'
  )

  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 設定 */}
      {onSettings != null ? (
        <button
          type="button"
          onClick={onSettings}
          className={buttonClass}
          title={t('calendar.headerActions.settings')}
          aria-label={t('calendar.headerActions.settings')}
        >
          <Settings className={iconSize} />
        </button>
      ) : null}

      {/* エクスポート */}
      {onExport != null ? (
        <button
          type="button"
          onClick={onExport}
          className={buttonClass}
          title={t('calendar.headerActions.export')}
          aria-label={t('calendar.headerActions.export')}
        >
          <Download className={iconSize} />
        </button>
      ) : null}

      {/* インポート */}
      {onImport != null ? (
        <button
          type="button"
          onClick={onImport}
          className={buttonClass}
          title={t('calendar.headerActions.import')}
          aria-label={t('calendar.headerActions.import')}
        >
          <Upload className={iconSize} />
        </button>
      ) : null}

      {/* その他 */}
      {onMore != null ? (
        <button
          type="button"
          onClick={onMore}
          className={buttonClass}
          title={t('calendar.headerActions.moreOptions')}
          aria-label={t('calendar.headerActions.moreOptions')}
        >
          <MoreHorizontal className={iconSize} />
        </button>
      ) : null}
    </div>
  )
}
