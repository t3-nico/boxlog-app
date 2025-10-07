'use client'

import { useCreateEventInspector } from './useCreateEventInspector'

// Inspector用のキーボードショートカット
export function useCreateEventInspectorShortcuts() {
  const { openCreateInspector } = useCreateEventInspector()
  
  const handleKeyDown = (event: KeyboardEvent) => {
    // Cmd/Ctrl + N でInspectorを開く
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault()
      openCreateInspector({
        context: { source: 'keyboard' }
      })
    }
  }
  
  return { handleKeyDown }
}