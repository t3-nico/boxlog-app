'use client'

import React from 'react'

import { ThemeProvider } from '@/contexts/theme-context'
import { NotificationModalProvider } from '@/features/notifications'
import { GlobalSearchProvider } from '@/features/search'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * アプリケーション全体のProviderツリー
 *
 * Next.js公式パターン: Server/Client境界を明確にするため、
 * 全てのClient Component Providerをこのファイルに集約
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <GlobalSearchProvider>
        <NotificationModalProvider>
          {children}
        </NotificationModalProvider>
      </GlobalSearchProvider>
    </ThemeProvider>
  )
}
