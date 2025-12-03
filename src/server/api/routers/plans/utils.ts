/**
 * Plans Router - Utility Functions
 */

/**
 * undefined を除外したオブジェクトを返す（exactOptionalPropertyTypes対応）
 */
export function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * プランの日付整合性を保証する
 *
 * ルール:
 * 1. start_time と end_time の日付部分は必ず同じ
 * 2. due_date は start_time の日付と同じ
 * 3. end_time が start_time より前の場合、start_time と同じ日の同じ時刻に修正
 */
export function normalizeDateTimeConsistency(data: {
  due_date?: string
  start_time?: string | null
  end_time?: string | null
}): void {
  // start_time と end_time が両方存在する場合のみ処理
  if (!data.start_time || !data.end_time) {
    return
  }

  const startDate = new Date(data.start_time)
  const endDate = new Date(data.end_time)

  // 日付部分を取得（ローカルタイムゾーン基準）
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const startDay = startDate.getDate()

  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()
  const endDay = endDate.getDate()

  // 期待されるdue_date
  const expectedDueDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`

  // 整合性チェック: 既に一致している場合はスキップ
  const datesMatch = startYear === endYear && startMonth === endMonth && startDay === endDay
  const dueDateMatches = data.due_date === expectedDueDate
  const endAfterStart = endDate.getTime() >= startDate.getTime()

  console.debug('[normalizeDateTimeConsistency] チェック:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    startLocalDate: `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
    endLocalDate: `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    datesMatch,
    dueDateMatches,
    endAfterStart,
    current_due_date: data.due_date,
    expected_due_date: expectedDueDate,
  })

  if (datesMatch && dueDateMatches && endAfterStart) {
    console.debug('[normalizeDateTimeConsistency] 既に整合性が取れているため、スキップ')
    return
  }

  console.debug('[normalizeDateTimeConsistency] 整合性の問題を検出 - 正規化を実行')

  // 1. due_date を start_time の日付に合わせる
  data.due_date = expectedDueDate

  // 2. end_time の日付を start_time と同じにする（時刻は維持）
  if (!datesMatch) {
    const newEndDate = new Date(endDate)
    newEndDate.setFullYear(startYear)
    newEndDate.setMonth(startMonth)
    newEndDate.setDate(startDay)
    data.end_time = newEndDate.toISOString()
  }

  // 3. end_time が start_time より前の場合、start_time と同じ時刻にする
  const finalEndDate = new Date(data.end_time)
  if (finalEndDate.getTime() < startDate.getTime()) {
    const fixedEndDate = new Date(startDate)
    data.end_time = fixedEndDate.toISOString()
  }

  console.debug('[normalizeDateTimeConsistency] 正規化完了:', {
    due_date: data.due_date,
    start_time: data.start_time,
    end_time: data.end_time,
  })
}
