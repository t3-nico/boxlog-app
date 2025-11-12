'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface TagsSelectionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: ReactNode
}

/**
 * タグページ選択バー（Googleドライブ風）
 *
 * TagsPageHeaderと同じ構造:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 24px
 * - 背景: bg-muted（選択状態を視覚的に示す）
 *
 * 構成:
 * - 左側: 選択解除ボタン（×）
 * - 選択数表示（例: 「3件選択中」）
 * - アイコンボタン群（グループ移動、アーカイブ、削除）
 */
export function TagsSelectionBar({ selectedCount, onClearSelection, actions }: TagsSelectionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex h-12 shrink-0 items-end px-6 pt-2">
      {/* 選択コンテナ（40px） */}
      <div className="bg-muted flex h-10 flex-1 items-center gap-2 rounded-md px-2">
        {/* 選択解除ボタン（左端） */}
        <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-9 w-9" aria-label="選択を解除">
          <X className="h-4 w-4" />
        </Button>

        {/* 選択数表示 */}
        <span className="text-base font-semibold">{selectedCount}件選択中</span>

        {/* アクションボタン */}
        <div className="flex items-center gap-1">{actions}</div>
      </div>
    </div>
  )
}
