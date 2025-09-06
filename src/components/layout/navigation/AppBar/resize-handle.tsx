'use client'

import React from 'react'
import { useNavigationStore } from '../stores/navigation.store'

export function ResizeHandle() {
  const setPrimaryNavWidth = useNavigationStore((state) => state.setPrimaryNavWidth)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startWidth = useNavigationStore.getState().primaryNavWidth

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      
      // 幅制限を直接ここで実装
      const constrainedWidth = Math.max(200, Math.min(480, newWidth))
      setPrimaryNavWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="w-1 h-full cursor-ew-resize flex-shrink-0 bg-neutral-900/20 dark:bg-neutral-100/20 hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors"
      style={{ 
        minWidth: '4px'
      }}
    />
  )
}