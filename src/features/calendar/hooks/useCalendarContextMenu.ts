import { useCallback, useState } from 'react'

import type { CalendarPlan } from '../types/calendar.types'

/**
 * カレンダープランのコンテキストメニュー状態を管理するフック
 */
export const useCalendarContextMenu = () => {
  const [contextMenuEvent, setContextMenuEvent] = useState<CalendarPlan | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)

  // プランの右クリックハンドラー
  const handleEventContextMenu = useCallback((plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
    setContextMenuEvent(plan)
    setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY })
  }, [])

  // コンテキストメニューを閉じる
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuEvent(null)
    setContextMenuPosition(null)
  }, [])

  return {
    contextMenuEvent,
    contextMenuPosition,
    handleEventContextMenu,
    handleCloseContextMenu,
  }
}
