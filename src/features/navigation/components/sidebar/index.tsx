'use client'

import React from 'react'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

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
 * - 幅: 240px（固定）
 * - 高さ: 画面いっぱい
 */
export const Sidebar = ({ children }: SidebarProps) => {
  const { isSidebarOpen } = useNavigationStore()

  // Sidebarが閉じている、またはchildrenがない場合は何も表示しない
  if (!isSidebarOpen || !children) {
    return null
  }

  return (
    <aside
      className="flex flex-col border-r border-border bg-card text-card-foreground"
      style={{ width: '240px' }}
      aria-label="Sidebar navigation"
    >
      {children}
    </aside>
  )
}
