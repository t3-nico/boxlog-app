'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/chat-context'
import { CommandPalette } from '@/components/command-palette'
import { ToastProvider } from '@/components/ui/toast'

interface CommandPaletteContextType {
  open: () => void
  close: () => void
  isOpen: boolean
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}

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

function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const openCommandPalette = useCallback(() => {
    setIsOpen(true)
  }, [])
  
  const closeCommandPalette = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openCommandPalette()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openCommandPalette])

  return (
    <CommandPaletteContext.Provider value={{ open: openCommandPalette, close: closeCommandPalette, isOpen }}>
      {children}
      <CommandPalette isOpen={isOpen} onClose={closeCommandPalette} />
    </CommandPaletteContext.Provider>
  )
}