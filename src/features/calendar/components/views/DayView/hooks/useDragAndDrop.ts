// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop'

import type { CalendarPlan } from '../../shared/types/event.types'

export type { DragHandlers, DragState } from '../../shared/hooks/useDragAndDrop'

interface UseDragAndDropProps {
  onPlanUpdate?: (planId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  onPlanClick?: (plan: CalendarPlan) => void
  date: Date
  plans: CalendarPlan[]
}

/**
 * DayView用のドラッグ&ドロップフック
 * 共通のuseDragAndDropを使用
 */
export function useDragAndDrop(props: UseDragAndDropProps) {
  return useSharedDragAndDrop(props)
}
