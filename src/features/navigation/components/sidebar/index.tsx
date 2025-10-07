'use client'

import React from 'react'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

interface SidebarProps {
  children?: React.ReactNode
}

/**
 * Sidebar - ルートによって可変する動的サイドバー
 * 各ページ・機能ごとに異なるコンテンツを表示
 */
export const Sidebar = ({ children }: SidebarProps) => {
  const { isSidebarOpen } = useNavigationStore()

  // Sidebarが閉じている、またはchildrenがない場合は何も表示しない
  if (!isSidebarOpen || !children) {
    return null
  }

  return (
    <div
      className="flex flex-col border-r bg-card text-card-foreground border-border"
      style={{ width: '240px' }}
    >
      {children}
    </div>
  )
}
