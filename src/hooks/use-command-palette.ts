'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Custom hook for managing command palette state and keyboard shortcuts
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Open command palette
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Close command palette
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Toggle command palette
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
        return
      }

      // Additional shortcuts when palette is closed
      if (!isOpen) {
        // Cmd+Shift+P or Ctrl+Shift+P for alternative trigger
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
          e.preventDefault()
          open()
          return
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, toggle, open])

  // Handle escape key to close when open
  useEffect(() => {
    if (!isOpen) return

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, close])

  // Prevent body scroll when palette is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}