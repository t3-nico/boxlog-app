'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'
import { useCallback, useEffect } from 'react'

interface SidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabs: SidebarTab[]
  title?: string
  defaultTab?: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function SidePanel({
  open,
  onOpenChange,
  tabs,
  title,
  defaultTab,
  defaultWidth = 700,
  minWidth = 400,
  maxWidth = 1200,
}: SidePanelProps) {
  const { width, setWidth, isResizing, setIsResizing } = useTicketInspectorStore()

  useEffect(() => {
    console.log('[SidePanel] State changed:', { open, title, width, tabsCount: tabs.length })
  }, [open, title, width, tabs.length])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
    },
    [setIsResizing]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    },
    [isResizing, minWidth, maxWidth, setWidth]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [setIsResizing])

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 sm:max-w-none"
        style={{ width: `${width}px`, maxWidth: '100vw' }}
        showCloseButton={false}
      >
        {/* リサイズハンドル */}
        <div
          className="hover:bg-primary/20 absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="bg-border absolute top-1/2 left-0 h-12 w-1 -translate-y-1/2 rounded-r" />
        </div>

        {/* ヘッダー */}
        {title && (
          <SheetHeader className="border-border border-b px-6 py-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}

        {/* タブナビゲーション */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <SidebarTabLayout tabs={tabs} defaultTab={defaultTab} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
