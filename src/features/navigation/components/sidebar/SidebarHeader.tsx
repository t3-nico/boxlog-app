'use client'

interface SidebarHeaderProps {
  title?: string
}

/**
 * Sidebarヘッダーコンポーネント（全ページ共通）
 *
 * - ページタイトル表示
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上パディング: 8px（pt-2）
 * - コンテナ: 40px（h-10）
 * - 左右パディング: 16px（px-4）
 * - 背景: bg-background
 * - 8pxグリッドシステム準拠
 */
export function SidebarHeader({ title }: SidebarHeaderProps) {
  return (
    <div className="bg-background flex h-12 items-end px-4 pt-2">
      {/* タイトルコンテナ（40px） */}
      <div className="flex h-10 flex-1 items-center">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
    </div>
  )
}
