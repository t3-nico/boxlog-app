'use client'

import type { ReactNode } from 'react'

interface TagsPageHeaderProps {
  title: string
  count?: number
  actions?: ReactNode
}

/**
 * タグページメインコンテンツヘッダー
 *
 * SidebarHeaderと同じ仕様:
 * - 高さ: 48px（上下8px padding + 32px container）
 * - 横幅パディング: 16px
 * - 背景: bg-background
 *
 * 現在選択中のサイドバーセクション名とタグ数を表示
 * - すべてのタグ (24)
 * - 未分類 (5)
 * - アーカイブ (10)
 * - グループ名（例: 仕事 (12)、プライベート (8)）
 *
 * actions: 右側に表示するボタン群（作成ボタン等）
 */
export function TagsPageHeader({ title, count, actions }: TagsPageHeaderProps) {
  return (
    <div className="bg-background flex h-12 shrink-0 items-center px-4 py-2">
      {/* タイトルコンテナ（32px） */}
      <div className="flex h-8 flex-1 items-center gap-1 overflow-hidden">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {count !== undefined && (
          <span className="text-muted-foreground shrink-0 text-base font-semibold">({count})</span>
        )}
      </div>

      {/* アクションボタン */}
      {actions && <div className="flex h-8 items-center gap-2">{actions}</div>}
    </div>
  )
}
