'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AIPanelContextType {
  isOpen: boolean
  panelHeight: number
  isMinimized: boolean
  setIsOpen: (open: boolean) => void
  setPanelHeight: (height: number) => void
  setIsMinimized: (minimized: boolean) => void
}

const AIPanelContext = createContext<AIPanelContextType | undefined>(undefined)

interface AIPanelProviderProps {
  children: ReactNode
}

export const AIPanelProvider = ({ children }: AIPanelProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [panelHeight, setPanelHeight] = useState(400)
  const [isMinimized, setIsMinimized] = useState(false)

  const value: AIPanelContextType = {
    isOpen,
    panelHeight,
    isMinimized,
    setIsOpen,
    setPanelHeight,
    setIsMinimized,
  }

  return (
    <AIPanelContext.Provider value={value}>
      {children}
    </AIPanelContext.Provider>
  )
}

export function useAIPanel() {
  const context = useContext(AIPanelContext)
  if (context === undefined) {
    throw new Error('useAIPanel must be used within an AIPanelProvider')
  }
  return context
}