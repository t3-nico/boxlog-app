import { useEffect } from 'react'

interface KeyboardShortcuts {
  onNewTask?: () => void
  onDeleteSelected?: () => void
  onSelectAll?: () => void
  onClearSelection?: () => void
  onSave?: () => void
}

export function useKeyboardShortcuts({
  onNewTask,
  onDeleteSelected,
  onSelectAll,
  onClearSelection,
  onSave,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow Ctrl+S even in input fields
        if (e.ctrlKey && e.key === 's' && onSave) {
          e.preventDefault()
          onSave()
        }
        return
      }

      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            onNewTask?.()
            break
          case 'a':
            e.preventDefault()
            onSelectAll?.()
            break
          case 's':
            e.preventDefault()
            onSave?.()
            break
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault()
            onDeleteSelected?.()
            break
          case 'Escape':
            e.preventDefault()
            onClearSelection?.()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onDeleteSelected, onSelectAll, onClearSelection, onSave])
}