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
    console.log('Global search open called')
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    console.log('Global search close called')
    setIsOpen(false)
  }, [])

  // Keyboard shortcut handler (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

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
