'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { SidebarHeader } from './SidebarHeader'

interface SidebarShellProps {
  /** ページタイトル */
  title: string
  /** Sidebarのコンテンツ */
  children: ReactNode
  /** 追加のクラス名 */
  className?: string
  /** ヘッダーを非表示にする（タブレイアウトで独自ヘッダーを使う場合） */
  hideHeader?: boolean
}

/**
 * Sidebar共通シェルコンポーネント
 *
 * 全ページのSidebarで共通の外枠を提供する。
 * 各ページはchildrenとして独自のコンテンツを渡す。
 *
 * **デザイン仕様**:
 * - 背景: bg-surface-container
 * - テキスト: text-foreground
 * - 幅: 親要素に合わせる（w-full）
 * - 高さ: 親要素に合わせる（h-full）
 * - レイアウト: flexbox縦方向
 *
 * @example
 * ```tsx
 * <SidebarShell title="カレンダー">
 *   <SidebarContent />
 * </SidebarShell>
 * ```
 */
export function SidebarShell({ title, children, className, hideHeader = false }: SidebarShellProps) {
  return (
    <aside className={cn('bg-surface-container text-foreground flex h-full w-full flex-col', className)}>
      {!hideHeader && <SidebarHeader title={title} />}
      {children}
    </aside>
  )
}
