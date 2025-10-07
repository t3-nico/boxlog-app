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
 *
 * セマンティックトークン:
 * - text-foreground: メインテキスト色
 * - text-muted-foreground: アイコン色
 * - border-border: 区切り線
 */
export const SidebarHeader = ({ title, icon, action, className }: SidebarHeaderProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'border-b border-border',
        'px-4 py-3.5',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="text-muted-foreground flex-shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
