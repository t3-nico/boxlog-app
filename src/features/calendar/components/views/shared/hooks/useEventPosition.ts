/**
 * イベント配置計算フック
 */

import { useMemo } from 'react'
import type { TimedEvent, EventPosition } from '../types/event.types'
import { calculateEventColumns, calculateEventPosition } from '../utils/eventPositioning'
import { HOUR_HEIGHT } from '../constants/grid.constants'

export interface UseEventPositionOptions {
  hourHeight?: number
}

export interface PositionedEvent extends TimedEvent {
  position: EventPosition
}

export function useEventPosition(
  events: TimedEvent[],
  options: UseEventPositionOptions = {}
) {
  const { hourHeight = HOUR_HEIGHT } = options
  
  const eventPositions = useMemo(() => {
    const positions = new Map<string, EventPosition>()
    
    if (events.length === 0) return positions
    
    // イベントの列配置を計算
    const columns = calculateEventColumns(events)
    
    // 各イベントの位置を計算
    events.forEach(event => {
      const column = columns.get(event.id)
      if (!column) return
      
      const position = calculateEventPosition(event, column, hourHeight)
      
      positions.set(event.id, {
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        zIndex: 10
      })
    })
    
    return positions
  }, [events, hourHeight])
  
  return eventPositions
}

/**
 * イベントと位置を結合して配置済みイベントを返すフック
 * （既存の /shared/hooks との互換性のため）
 */
export function usePositionedEvents(
  events: TimedEvent[],
  options: UseEventPositionOptions = {}
): PositionedEvent[] {
  const positions = useEventPosition(events, options)
  
  return useMemo(() => {
    return events.map(event => ({
      ...event,
      position: positions.get(event.id) || {
        top: 0,
        left: 0,
        width: 100,
        height: 20,
        zIndex: 10
      }
    }))
  }, [events, positions])
}