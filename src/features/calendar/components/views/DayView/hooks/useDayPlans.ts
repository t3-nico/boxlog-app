import { useViewPlans } from '../../shared/hooks/useViewPlans'
import type { UseDayPlansOptions, UseDayPlansReturn } from '../DayView.types'

/**
 * DayView用のプラン処理フック
 * 共通のuseViewPlansを使用
 */
export function useDayPlans({ date, plans }: UseDayPlansOptions): UseDayPlansReturn {
  return useViewPlans({ date, plans })
}
