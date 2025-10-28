'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
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
        className="overflow-y-auto p-0 pt-2"
        style={{ width: `${width}px`, maxWidth: '100vw' }}
      >
        {/* リサイズハンドル */}
        <div
          className="hover:bg-primary/20 absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="bg-border absolute top-1/2 left-0 h-12 w-1 -translate-y-1/2 rounded-r" />
        </div>

        {/* ヘッダー（AppBarと同じ高さ h-10） */}
        <div className="flex h-10 items-center px-6">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-8">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
