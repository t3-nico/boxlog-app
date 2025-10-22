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
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h2>
            {description != null && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            )}
          </div>
          {actions != null && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* メインコンテンツ */}
      <ScrollArea className="flex-1 px-6 pt-0">
        <div className="w-full">{children}</div>
      </ScrollArea>
    </div>
  )
}
