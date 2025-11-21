'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'

import { RealtimeProvider } from '@/components/providers/RealtimeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthStoreInitializer } from '@/features/auth/stores/AuthStoreInitializer'
import { GlobalSearchProvider } from '@/features/search'
import { api } from '@/lib/trpc'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // ブラウザではルート相対パス
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR Vercel
  return `http://localhost:${process.env.PORT ?? 3000}` // SSR 開発
}

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * アプリケーション全体のProviderツリー
 *
 * プロバイダー階層（CLAUDE.md準拠）:
 * 1. QueryClientProvider（データ層）
 * 2. tRPC Provider（API層）
 * 3. AuthStoreInitializer（認証層 - Zustand）
 * 4. RealtimeProvider（リアルタイム購読層 - Supabase）
 * 5. ThemeProvider（UI層）
 * 6. TooltipProvider（UI層）
 * 7. GlobalSearchProvider（機能層）
 * 8. ReactQueryDevtools（開発ツール - 本番環境では自動除外）
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分（一般的なデータのデフォルト）
            gcTime: 10 * 60 * 1000, // 10分（ガベージコレクション）
            refetchOnWindowFocus: true, // 業界標準：タブ切り替え時にstaleなデータのみ再フェッチ
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

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            const headers: Record<string, string> = {}
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth_token')
              if (token) {
                headers.authorization = `Bearer ${token}`
              }
            }
            return headers
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <AuthStoreInitializer />
        <RealtimeProvider>
          <ThemeProvider>
            <TooltipProvider delayDuration={300} skipDelayDuration={100}>
              <GlobalSearchProvider>{children}</GlobalSearchProvider>
            </TooltipProvider>
          </ThemeProvider>
        </RealtimeProvider>
        {/* React Query DevTools（開発環境のみ、本番ビルドでは自動除外） */}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </api.Provider>
    </QueryClientProvider>
  )
}
