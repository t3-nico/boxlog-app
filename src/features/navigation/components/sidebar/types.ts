import type { ReactNode } from 'react'

/**
 * Sidebarタブの定義
 */
export interface SidebarTab {
  /** タブの識別子 */
  value: string
  /** タブのラベル */
  label: string
  /** タブのコンテンツ */
  content: ReactNode
}

/**
 * SidebarTabLayoutのProps
 */
export interface SidebarTabLayoutProps {
  /** タブの配列（2〜4タブ対応） */
  tabs: SidebarTab[]
  /** デフォルトで選択されるタブ */
  defaultTab?: string
}
