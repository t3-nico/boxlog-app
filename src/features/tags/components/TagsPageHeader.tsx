'use client'

interface TagsPageHeaderProps {
  title: string
}

/**
 * タグページメインコンテンツヘッダー
 *
 * SidebarHeaderと同じ仕様:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 16px
 * - 背景: bg-background
 *
 * 現在選択中のサイドバーセクション名を表示
 * - すべてのタグ
 * - 未分類
 * - アーカイブ
 * - グループ名（例: 仕事、プライベート）
 */
export function TagsPageHeader({ title }: TagsPageHeaderProps) {
  return (
    <div className="bg-background flex h-12 shrink-0 items-end px-4 pt-2">
      {/* タイトルコンテナ（40px） */}
      <div className="flex h-10 flex-1 items-center">
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
    </div>
  )
}
