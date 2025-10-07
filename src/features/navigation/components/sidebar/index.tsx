'use client'

import React from 'react'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

import { ResizeHandle } from './ResizeHandle'

interface SidebarProps {
  children?: React.ReactNode
}

/**
 * Sidebar - ルートによって可変する動的サイドバー
 * 各ページ・機能ごとに異なるコンテンツを表示
 *
 * セマンティックトークン:
 * - bg-card: サイドバー背景
 * - text-card-foreground: サイドバーテキスト
 * - border-border: 右端のボーダー
 *
 * レイアウト:
 * - 幅: 可変（200px〜480px、デフォルト240px）
 * - 高さ: 画面いっぱい
 * - リサイズ: ResizeHandleでドラッグ可能
 */
export const Sidebar = ({ children }: SidebarProps) => {
  const { isSidebarOpen, sidebarWidth } = useNavigationStore()

  // Sidebarが閉じている、またはchildrenがない場合は何も表示しない
  if (!isSidebarOpen || !children) {
    return null
  }

  return (
    <aside
      className="flex flex-row overflow-hidden bg-card text-card-foreground shadow-sm"
      style={{ width: `${sidebarWidth}px` }}
      aria-label="Sidebar navigation"
    >
      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col">{children}</div>

      {/* Resize Handle */}
      <ResizeHandle />
    </aside>
  )
}
