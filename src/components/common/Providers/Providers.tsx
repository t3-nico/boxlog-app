'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'

import { AuthStoreInitializer } from '@/features/auth/stores/AuthStoreInitializer'
import { CommandPaletteProvider, useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { trpc } from '@/lib/trpc'

import { PreloadResources } from '../Preload'

import { ProvidersProps } from './types'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // ブラウザではルート相対パス
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR Vercel
  return `http://localhost:${process.env.PORT ?? 3000}` // SSR 開発
}

// CommandPalette context moved to features/command-palette

export const Providers = ({ children }: ProvidersProps) => {
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

  const [trpcClient] = useState(() =>
    trpc.createClient({
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthStoreInitializer />
        <CommandPaletteProvider>
          <PreloadResources />
          {children}
        </CommandPaletteProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

// CommandPaletteProvider implementation moved to features/command-palette

export { useCommandPalette }
