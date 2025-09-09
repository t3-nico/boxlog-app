'use client'

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react'
import { NotificationModal } from '../components/NotificationModal'

interface NotificationModalContextType {
  open: () => void
  close: () => void
  isOpen: boolean
  notificationCount: number
  setNotificationCount: (count: number) => void
}

const NotificationModalContext = createContext<NotificationModalContextType | null>(null)

export function useNotificationModal() {
  const context = useContext(NotificationModalContext)
  if (!context) {
    throw new Error('useNotificationModal must be used within NotificationModalProvider')
  }
  return context
}

export function NotificationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const contextValue = {
    open,
    close,
    isOpen,
    notificationCount,
    setNotificationCount
  }

  return (
    <NotificationModalContext.Provider value={contextValue}>
      {children}
      <NotificationModal isOpen={isOpen} onClose={close} />
    </NotificationModalContext.Provider>
  )
}