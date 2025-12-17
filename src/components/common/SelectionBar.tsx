'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface SelectionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: ReactNode
  /** 横幅パディングのカスタマイズ（デフォルト: "px-4"） */
  paddingX?: string
}

/**
 * 共通選択バー（Googleドライブ風）
 *
 * TagsページとInboxページで共通で使用する選択バーコンポーネント
 *
 * 構造:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 背景: bg-surface-container（選択状態を視覚的に示す）
 *
 * 構成:
 * - 左側: 選択解除ボタン（×）
 * - 選択数表示（例: 「3件選択中」）
 * - アクションボタン群（親コンポーネントから渡される）
 *
 * @example
 * ```tsx
 * <SelectionBar
 *   selectedCount={3}
 *   onClearSelection={() => clearSelection()}
 *   actions={<YourActionsComponent />}
 * />
 * ```
 */
export function SelectionBar({ selectedCount, onClearSelection, actions, paddingX = 'px-4' }: SelectionBarProps) {
  const t = useTranslations()

  if (selectedCount === 0) return null

  return (
    <div className={cn('flex h-12 shrink-0 items-end pt-2', paddingX)}>
      {/* 選択コンテナ（40px） */}
      <div className="bg-surface-container flex h-10 flex-1 items-center gap-2 rounded-md px-2">
        {/* 選択解除ボタン（左端） */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="h-9 w-9"
          aria-label={t('aria.clearSelection')}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* 選択数表示 */}
        <span className="text-base font-semibold">{t('common.selectedCount', { count: selectedCount })}</span>

        {/* アクションボタン */}
        <div className="flex items-center gap-1">{actions}</div>
      </div>
    </div>
  )
}
