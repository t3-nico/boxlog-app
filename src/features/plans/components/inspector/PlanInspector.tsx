'use client'

import { useEffect } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

import { usePlan } from '../../hooks/usePlan'
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore'
import type { Plan } from '../../types/plan'

import { useInspectorResize } from './hooks'
import { PlanInspectorContent } from './PlanInspectorContent'

/**
 * Plan Inspector（全ページ共通）
 *
 * displayModeに応じてSheet（サイドパネル）またはDialog（ポップアップ）で表示
 */
export function PlanInspector() {
  const isOpen = usePlanInspectorStore((state) => state.isOpen)
  const planId = usePlanInspectorStore((state) => state.planId)
  const displayMode = usePlanInspectorStore((state) => state.displayMode)
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector)

  const { data: planData } = usePlan(planId!, { includeTags: true, enabled: !!planId })
  const plan = (planData ?? null) as unknown as Plan | null

  // Resize hook (Sheet mode only)
  const { inspectorWidth, isResizing, handleMouseDown } = useInspectorResize()

  // Handle escape key for popup mode
  useEffect(() => {
    if (!isOpen || displayMode !== 'popover') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInspector()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, displayMode, closeInspector])

  if (!isOpen) return null

  // Sheet mode (default)
  if (displayMode === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeInspector()} modal={false}>
        <SheetContent
          className="gap-0 overflow-y-auto"
          style={{ width: `${inspectorWidth}px` }}
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">{plan?.title || '予定の詳細'}</SheetTitle>
          <PlanInspectorContent
            showResizeHandle={true}
            resizeProps={{
              inspectorWidth,
              isResizing,
              handleMouseDown,
            }}
          />
        </SheetContent>
      </Sheet>
    )
  }

  // Popup mode (non-modal, centered, fixed size)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeInspector()} modal={false}>
      <DialogContent
        className="flex h-[40rem] max-w-[28rem] flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{plan?.title || '予定の詳細'}</DialogTitle>
        <PlanInspectorContent showResizeHandle={false} isPopover={true} />
      </DialogContent>
    </Dialog>
  )
}
