'use client'

/**
 * 空状態表示コンポーネント
 */

import { memo } from 'react'

import { useTranslations } from 'next-intl'

import type { EmptyStateProps } from '../../types/view.types'

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  title,
  description,
  icon,
  actions,
  hint,
  className = '',
}) {
  const t = useTranslations()

  // デフォルト値を翻訳から取得
  const displayTitle = title ?? t('calendar.emptyState.defaultTitle')
  const displayDescription = description ?? t('calendar.emptyState.defaultDescription')
  // アイコンの処理：コンポーネント型の場合はJSX要素として展開
  const renderIcon = () => {
    if (!icon) {
      // デフォルトアイコン
      return (
        <div className="text-muted-foreground mx-auto mb-4 h-16 w-16">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="h-full w-full">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )
    }

    // アイコンがコンポーネント型の場合（function または forwardRef）
    // forwardRefコンポーネントは $$typeof プロパティを持つオブジェクト
    const isComponent =
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && '$$typeof' in icon && 'render' in icon)

    if (isComponent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const IconComponent = icon as React.ComponentType<any>
      return (
        <div className="bg-surface-container mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <IconComponent className="text-muted-foreground h-8 w-8" />
        </div>
      )
    }

    // ReactNodeの場合はそのまま表示
    return icon
  }

  return (
    <div className={`flex h-full flex-col items-center justify-center p-8 text-center ${className}`}>
      {/* アイコン */}
      {renderIcon()}

      {/* タイトル */}
      <h3 className="text-foreground mb-2 text-lg font-medium">{displayTitle}</h3>

      {/* 説明 */}
      {displayDescription != null && (
        <p className="text-muted-foreground mb-6 max-w-md text-sm">{displayDescription}</p>
      )}

      {/* アクションボタン */}
      {actions != null && <div className="mb-6">{actions}</div>}

      {/* ヒント */}
      {hint != null && (
        <div className="text-muted-foreground mt-8 max-w-sm text-xs">
          <p>{hint}</p>
        </div>
      )}
    </div>
  )
})
