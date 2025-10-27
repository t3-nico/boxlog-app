'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthStoreInitializer } from '@/features/auth/stores/AuthStoreInitializer'
import { CommandPaletteProvider, useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { api } from '@/lib/trpc'

import { PreloadResources } from '../Preload'

import { ProvidersProps } from './types'

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

  return (
    <api.Provider client={api} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthStoreInitializer />
        <CommandPaletteProvider>
          <PreloadResources />
          {children}
        </CommandPaletteProvider>
      </QueryClientProvider>
    </api.Provider>
  )
}

// CommandPaletteProvider implementation moved to features/command-palette

export { useCommandPalette }
