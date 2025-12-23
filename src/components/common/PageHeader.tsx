'use client'

import type { ReactNode } from 'react'

import { Bot } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HoverTooltip } from '@/components/ui/tooltip'
import { useAIInspectorStore } from '@/features/ai'
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
 * - 高さ: 48px固定（8px padding + 32px container）
 * - 上下パディング: 8px（py-2）
 * - 横幅パディング: 16px (px-4)
 * - 背景: bg-background
 * - 8pxグリッドシステム準拠
 *
 * @example
 * ```tsx
 * // 基本的な使用
 * <PageHeader title="タグ" />
 *
 * // アクション付き
 * <PageHeader title="タグ" actions={<Button>作成</Button>} />
 * ```
 */
export function PageHeader({
  title,
  count: _count,
  subtitle,
  actions,
  children,
  showMobileMenu = true,
  className,
}: PageHeaderProps) {
  const openAIInspector = useAIInspectorStore((state) => state.openInspector)
  const t = useTranslations()

  return (
    <div className={cn('bg-background flex h-12 shrink-0 items-center px-4 py-2', className)}>
      {/* タイトルコンテナ（32px） */}
      <div className="flex h-8 flex-1 items-center gap-2 overflow-hidden">
        {/* モバイル: ハンバーガーメニュー */}
        {showMobileMenu && <MobileMenuButton className="md:hidden" />}
        <h1 className="truncate text-lg leading-8 font-semibold">{title}</h1>
        {/* count表示は一旦削除 - 必要であれば復活 */}
        {subtitle && <span className="text-muted-foreground truncate text-sm">{subtitle}</span>}
        {children}
      </div>

      {/* アクションボタン */}
      {actions && <div className="flex h-8 items-center gap-2">{actions}</div>}

      {/* AIアシスタントボタン（PC版のみ） */}
      <HoverTooltip content={t('aria.openAIAssistant')} side="bottom">
        <Button
          onClick={() => openAIInspector()}
          size="icon"
          variant="ghost"
          aria-label={t('aria.openAIAssistant')}
          className="text-muted-foreground hover:text-foreground ml-2 hidden shrink-0 md:flex"
        >
          <Bot className="size-5" />
        </Button>
      </HoverTooltip>
    </div>
  )
}
