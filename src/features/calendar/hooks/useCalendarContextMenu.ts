import { useCallback, useState } from 'react'

import type { CalendarEvent } from '../types/calendar.types'

/**
 * カレンダーイベントのコンテキストメニュー状態を管理するフック
 */
export const useCalendarContextMenu = () => {
  const [contextMenuEvent, setContextMenuEvent] = useState<CalendarEvent | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)

  // イベントの右クリックハンドラー
  const handleEventContextMenu = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    setContextMenuEvent(event)
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
