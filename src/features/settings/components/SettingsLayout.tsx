'use client'

import React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export const SettingsLayout = ({ children, title, description, actions }: SettingsLayoutProps) => {
  return (
    <div className="flex h-full flex-1 flex-col">
      {/* ヘッダー部分（bg-background統一、8pxグリッド準拠） */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">{title}</h2>
            {description != null && <p className="text-muted-foreground mt-2 text-base">{description}</p>}
          </div>
          {actions != null && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* メインコンテンツ */}
      <ScrollArea className="flex-1 p-6">
        <div className="w-full pb-8">{children}</div>
      </ScrollArea>
    </div>
  )
}
