'use client'

import type React from 'react'
import { useCallback, useRef, useState } from 'react'

interface ResizeHandleProps {
  columnId: string
  currentWidth: number
  onResize: (columnId: string, newWidth: number) => void
}

export function ResizeHandle({ columnId, currentWidth, onResize }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = currentWidth

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current
        onResize(columnId, Math.max(50, startWidthRef.current + delta))
      }

      const onMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [columnId, currentWidth, onResize]
  )

  return (
    <div
      className={`hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize ${
        isResizing ? 'bg-primary' : ''
      }`}
      onMouseDown={onMouseDown}
      style={{ userSelect: 'none' }}
    />
  )
}
