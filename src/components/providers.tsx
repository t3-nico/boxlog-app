'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthStoreInitializer } from '@/features/auth/stores/AuthStoreInitializer'
import { GlobalSearchProvider } from '@/features/search'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * アプリケーション全体のProviderツリー
 *
 * プロバイダー階層（CLAUDE.md準拠）:
 * 1. QueryClientProvider（データ層）
 * 2. AuthStoreInitializer（認証層 - Zustand）
 * 3. ThemeProvider（UI層）
 * 4. TooltipProvider（UI層）
 * 5. GlobalSearchProvider（機能層）
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分（キャッシュを長く保持）
            gcTime: 10 * 60 * 1000, // 10分（ガベージコレクション）
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
            retry: (failureCount, error) => {
              // エラーによってリトライ戦略を変更
              if (error && 'status' in error && error.status === 404) return false
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStoreInitializer />
      <ThemeProvider>
        <TooltipProvider delayDuration={300} skipDelayDuration={100}>
          <GlobalSearchProvider>{children}</GlobalSearchProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
