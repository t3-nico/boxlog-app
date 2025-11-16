'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface InboxSelectionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: ReactNode
}

/**
 * Inbox選択バー（Googleドライブ風）
 *
 * 高さ: 48px固定（ツールバーと同じ）
 * - 8px top padding + 40px container
 *
 * 構成:
 * - 左側: 選択解除ボタン（×）
 * - 選択数表示（例: 「3件選択中」）
 * - アクションボタン群（アーカイブ、削除など）
 */
export function InboxSelectionBar({ selectedCount, onClearSelection, actions }: InboxSelectionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex h-12 shrink-0 items-end px-4 pt-2 md:px-6">
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
