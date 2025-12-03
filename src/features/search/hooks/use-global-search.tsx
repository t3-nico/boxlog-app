'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { GlobalSearchModal } from '../components/global-search-modal'

interface GlobalSearchContextType {
  open: () => void
  close: () => void
  isOpen: boolean
}

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null)

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return context
}

export const GlobalSearchProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const contextValue = {
    open,
    close,
    isOpen,
  }

  return (
    <GlobalSearchContext.Provider value={contextValue}>
      {children}
      <GlobalSearchModal isOpen={isOpen} onClose={close} />
    </GlobalSearchContext.Provider>
  )
}
