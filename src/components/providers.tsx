'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { AuthProvider } from '@/features/auth'
import { ChatProvider } from '@/contexts/chat-context'
import { CommandPaletteProvider, useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { ToastProvider } from '@/components/ui/toast'

// CommandPalette context moved to features/command-palette

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分
            refetchOnWindowFocus: false,
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