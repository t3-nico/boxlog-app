'use client'

import type { ReactNode } from 'react'

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** ページタイトル */
  title: string
  /** タイトル横のカウント表示 */
  count?: number
  /** タイトル横のサブタイトル */
  subtitle?: string
  /** 右側に表示するアクション（ボタン等） */
  actions?: ReactNode
  /** タイトル右側に表示するカスタムコンテンツ */
  children?: ReactNode
  /** モバイルメニューボタンを表示するか（デフォルト: true） */
  showMobileMenu?: boolean
  /** 追加のクラス名 */
  className?: string
}

/**
 * 共通ページヘッダーコンポーネント
 *
 * 全ページのメインコンテンツヘッダーで共通の仕様を提供
 *
 * **デザイン仕様（SidebarHeaderと同じ）:**
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 16px (px-4)
 * - 背景: bg-background
 *
 * @example
 * ```tsx
 * // 基本的な使用
 * <PageHeader title="タグ" count={24} />
 *
 * // アクション付き
 * <PageHeader title="タグ" actions={<Button>作成</Button>} />
 *
 * // カスタムコンテンツ付き
 * <PageHeader title="Inbox">
 *   <DisplayModeSwitcher />
 * </PageHeader>
 * ```
 */
export function PageHeader({
  title,
  count,
  subtitle,
  actions,
  children,
  showMobileMenu = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('bg-background flex h-12 shrink-0 items-end px-4 pt-2', className)}>
      {/* モバイル: ハンバーガーメニュー */}
      {showMobileMenu && <MobileMenuButton className="mr-2 md:hidden" />}

      {/* タイトルコンテナ（40px） */}
      <div className="flex h-10 flex-1 items-center gap-2 overflow-hidden">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {count !== undefined && (
          <span className="text-muted-foreground shrink-0 text-base font-semibold">({count})</span>
        )}
        {subtitle && <span className="text-muted-foreground truncate text-sm">{subtitle}</span>}
        {children}
      </div>

      {/* アクションボタン */}
      {actions && <div className="flex h-10 items-center gap-2">{actions}</div>}
    </div>
  )
}
