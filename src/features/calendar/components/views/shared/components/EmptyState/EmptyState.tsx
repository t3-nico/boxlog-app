'use client'

/**
 * カレンダー用EmptyStateコンポーネント
 *
 * @deprecated 共通コンポーネント `@/components/common/EmptyState` を使用してください
 */

import { memo } from 'react'

import { useTranslations } from 'next-intl'

import { EmptyState as BaseEmptyState } from '@/components/common'

import type { EmptyStateProps } from '../../types/view.types'

/**
 * カレンダービュー用EmptyState
 *
 * 共通EmptyStateのラッパー。i18nのデフォルト値を提供。
 */
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

  // アイコンがコンポーネント型かどうかを判定
  const isIconComponent =
    typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon && 'render' in icon)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = isIconComponent ? (icon as any) : undefined

  return (
    <BaseEmptyState
      title={displayTitle}
      description={displayDescription ?? undefined}
      icon={IconComponent}
      actions={actions}
      hint={hint ?? undefined}
      className={className}
    />
  )
})
