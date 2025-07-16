'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/chat-context'
import { CommandPalette } from '@/components/command-palette'
import { useCommandPalette } from '@/hooks/use-command-palette'

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
          <CommandPaletteProvider>
            {children}
          </CommandPaletteProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useCommandPalette()

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  )
}