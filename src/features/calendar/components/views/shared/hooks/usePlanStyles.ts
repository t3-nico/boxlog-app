import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import type { PlanPosition } from './useViewPlans'

/**
 * プラン位置情報からCSSスタイルを計算するフック
 * 全カレンダービューで共通利用可能
 *
 * @param planPositions プランの位置情報配列
 * @returns プランID => CSSスタイルのマップ
 */
export function usePlanStyles(planPositions: PlanPosition[]): Record<string, CSSProperties> {
  return useMemo((): Record<string, CSSProperties> => {
    const styles: Record<string, CSSProperties> = {}

    planPositions.forEach(({ plan, top, height, left, width, zIndex, opacity }) => {
      // planがundefinedの場合はスキップ
      if (!plan || !plan.id) {
        console.warn('usePlanStyles: Invalid plan position detected', { plan, top, height, left, width })
        return
      }

      styles[plan.id] = {
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
  }, [planPositions])
}
