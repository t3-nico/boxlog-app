'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/**
 * SidebarHeader - Sidebar共通ヘッダーコンポーネント
 * ページタイトルとアクションボタンを表示
 */
export const SidebarHeader = ({ title, icon, action, className }: SidebarHeaderProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="text-neutral-600 dark:text-neutral-400">{icon}</div>}
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
