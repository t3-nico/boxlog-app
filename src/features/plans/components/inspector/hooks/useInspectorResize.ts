'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseInspectorResizeOptions {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function useInspectorResize({
  initialWidth = 540,
  minWidth = 400,
  maxWidth = 800,
}: UseInspectorResizeOptions = {}) {
  const [inspectorWidth, setInspectorWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setInspectorWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth])

  return {
    inspectorWidth,
    isResizing,
    handleMouseDown,
  }
}
