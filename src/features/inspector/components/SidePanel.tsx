'use client'

import { Button } from '@/components/ui/button'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'
import { X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

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
  const panelRef = useRef<HTMLDivElement>(null)

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
    <div
      ref={panelRef}
      className="border-border bg-background fixed top-0 right-0 bottom-0 z-40 flex flex-col border-l shadow-lg"
      style={{ width: `${width}px`, maxWidth: '100vw' }}
    >
      {/* リサイズハンドル */}
      <div
        className="hover:bg-primary/20 absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="bg-border absolute top-1/2 left-0 h-12 w-1 -translate-y-1/2 rounded-r" />
      </div>

      {/* ヘッダー */}
      <div className="border-border relative flex items-center border-b px-6 py-4">
        {title && <h2 className="flex-1 truncate pr-8 text-lg font-semibold">{title}</h2>}
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="absolute top-2 right-2">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SidebarTabLayout tabs={tabs} defaultTab={defaultTab} />
      </div>
    </div>
  )
}
