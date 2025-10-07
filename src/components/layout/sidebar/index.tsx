'use client'

import React from 'react'

import { useNavigationStore } from '@/components/layout/stores/navigation.store'

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
      className="flex flex-col border-r bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
      style={{ width: '240px' }}
    >
      {children}
    </div>
  )
}
