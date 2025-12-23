'use client'

import { Bot, PanelLeftClose } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HoverTooltip } from '@/components/ui/tooltip'
import { useAIInspectorStore } from '@/features/ai'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface SidebarHeaderProps {
  title?: string
  className?: string
}

/**
 * Sidebarヘッダーコンポーネント（全ページ共通）
 *
 * - ページタイトル表示
 * - モバイル表示時のみ閉じるボタンを表示
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 左右パディング: 16px（px-4）
 * - 背景: bg-surface-container
 * - 8pxグリッドシステム準拠
 */
export function SidebarHeader({ title, className }: SidebarHeaderProps) {
  const toggle = useSidebarStore((state) => state.toggle)
  const openAIInspector = useAIInspectorStore((state) => state.openInspector)
  const t = useTranslations()

  return (
    <div className={cn('bg-surface-container flex h-12 items-center px-4 py-2', className)}>
      {/* タイトルコンテナ（32px） */}
      <div className="flex h-8 flex-1 items-center">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      {/* AIアシスタントボタン */}
      <HoverTooltip content="AIアシスタント" side="bottom">
        <Button
          onClick={() => openAIInspector()}
          size="icon"
          variant="ghost"
          aria-label={t('aria.openAIAssistant')}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <Bot className="size-4" />
        </Button>
      </HoverTooltip>

      {/* 閉じるボタン（モバイルのみ表示） */}
      <Button
        onClick={toggle}
        size="icon"
        variant="ghost"
        aria-label={t('aria.closeSidebar')}
        className={cn('text-muted-foreground shrink-0 md:hidden')}
      >
        <PanelLeftClose className="size-4" />
      </Button>
    </div>
  )
}
