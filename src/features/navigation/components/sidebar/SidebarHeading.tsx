'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SidebarHeadingProps {
  /** 見出しテキスト */
  children: ReactNode
  /** 右側に表示するアクション要素（ボタン等） */
  action?: ReactNode
  /** 追加のクラス名 */
  className?: string
}

/**
 * SidebarHeading - サイドバー共通見出しコンポーネント
 *
 * 全サイドバーで統一されたセクション見出しを提供。
 * 折りたたみなしの静的な見出しに使用。
 *
 * **デザイン仕様（8pxグリッド準拠）**:
 * - 高さ: 32px（h-8相当、py-2で実現）
 * - 左パディング: 8px（pl-2）
 * - 右パディング: 2px（pr-0.5）- アクションボタン配置用
 * - フォント: text-xs font-semibold
 * - 色: text-muted-foreground
 *
 * @example
 * ```tsx
 * // シンプルな見出し
 * <SidebarHeading>グループ</SidebarHeading>
 *
 * // アクション付き見出し
 * <SidebarHeading action={<Button size="icon-sm"><Plus /></Button>}>
 *   グループ
 * </SidebarHeading>
 * ```
 */
export function SidebarHeading({ children, action, className }: SidebarHeadingProps) {
  return (
    <div className={cn('text-muted-foreground flex items-center justify-between py-2 pr-0.5 pl-2', className)}>
      <span className="text-xs font-semibold">{children}</span>
      {action}
    </div>
  )
}
