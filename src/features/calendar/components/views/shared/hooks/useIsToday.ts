import { useMemo } from 'react'

import { isToday as dateFnsIsToday } from 'date-fns'

/**
 * 指定された日付が今日かどうかを判定するフック
 * 全カレンダービューで共通利用可能
 *
 * @param date 判定対象の日付
 * @returns 今日の場合true、それ以外はfalse
 */
export function useIsToday(date: Date): boolean {
  return useMemo(() => dateFnsIsToday(date), [date])
}
