'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { AuthProvider } from '@/features/auth'
import { ChatProvider } from '@/contexts/chat-context'
import { CommandPaletteProvider, useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { ToastProvider } from '@/components/shadcn-ui/toast'
import { PreloadResources } from './PreloadResources'

// CommandPalette context moved to features/command-palette

export function Providers({ children }: { children: React.ReactNode }) {
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
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <PreloadResources />
              {children}
            </CommandPaletteProvider>
          </ToastProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

// CommandPaletteProvider implementation moved to features/command-palette

export { useCommandPalette }