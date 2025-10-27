'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ResizableSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function ResizableSheet({
  open,
  onOpenChange,
  title,
  children,
  defaultWidth = 700,
  minWidth = 400,
  maxWidth = 1200,
}: ResizableSheetProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    },
    [isResizing, minWidth, maxWidth]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  if (!open) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={sheetRef}
        side="right"
        className="overflow-y-auto p-0"
        style={{ width: `${width}px`, maxWidth: '100vw' }}
      >
        {/* リサイズハンドル */}
        <div
          className="hover:bg-primary/20 absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="bg-border absolute top-1/2 left-0 h-12 w-1 -translate-y-1/2 rounded-r" />
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
