'use client'

import React from 'react'

import { animations } from '@/config/theme'
import { border } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

import { useNavigationStore } from './stores/navigation.store'

export const ResizeHandle = () => {
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
      className={cn(
        'w-1 h-full cursor-ew-resize flex-shrink-0',
        border.universal,
        'hover:bg-blue-600 dark:hover:bg-blue-400',
        animations.transition.fast
      )}
      style={{ 
        minWidth: '4px'
      }}
    />
  )
}