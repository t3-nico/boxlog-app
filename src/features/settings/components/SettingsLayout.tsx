'use client'

import React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  actions?: React.ReactNode
}

export const SettingsLayout = ({ children, title, actions }: SettingsLayoutProps) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* ヘッダー部分（SidebarHeaderと同じ構造: 48px） */}
      <div className="flex h-12 flex-shrink-0 items-end px-4 pt-2">
        <div className="flex h-10 flex-1 items-center">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {actions != null && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* メインコンテンツ */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="w-full px-4 pb-8">{children}</div>
      </ScrollArea>
    </div>
  )
}
