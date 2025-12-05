'use client'

import Link from 'next/link'

import { cn } from '@/lib/utils'

import type { ItemProps } from './types'

/**
 * AppBarの個別アイテムコンポーネント
 *
 * - アイコン（24px）+ 名前（11px）の縦型レイアウト
 * - 8pxグリッド準拠のスペーシング
 * - ホバー・アクティブ状態のビジュアルフィードバック
 *
 * @example
 * ```tsx
 * <Item
 *   icon={Calendar}
 *   label="カレンダー"
 *   url="/ja/calendar"
 *   isActive={true}
 * />
 * ```
 */
export function Item({ icon: Icon, label, url, isActive, onClick }: ItemProps) {
  return (
    <Link
      href={url}
      {...(onClick && { onClick })}
      {...(isActive && { 'aria-current': 'page' as const })}
      className="flex flex-col items-center gap-1"
    >
      {/* アイコン（ハイライト対象） */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          'hover:bg-state-hover',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          isActive && 'bg-state-selected text-foreground'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      </div>

      {/* 名前（ハイライトなし） */}
      <span className={cn('text-center text-xs leading-tight break-words', isActive && 'font-semibold')}>{label}</span>
    </Link>
  )
}
