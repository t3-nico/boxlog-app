import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import type { EventPosition } from './useViewEvents'

/**
 * イベント位置情報からCSSスタイルを計算するフック
 * 全カレンダービューで共通利用可能
 *
 * @param eventPositions イベントの位置情報配列
 * @returns イベントID => CSSスタイルのマップ
 */
export function useEventStyles(eventPositions: EventPosition[]): Record<string, CSSProperties> {
  return useMemo((): Record<string, CSSProperties> => {
    const styles: Record<string, CSSProperties> = {}

    eventPositions.forEach(({ event, top, height, left, width, zIndex, opacity }) => {
      styles[event.id] = {
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        left: `${left}%`,
        width: `${width}%`,
        zIndex,
        opacity: opacity || 1.0,
      }
    })

    return styles
  }, [eventPositions])
}
