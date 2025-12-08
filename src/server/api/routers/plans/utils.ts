/**
 * Plans Router Utilities
 * Helper functions for plan operations
 */

/**
 * Remove undefined fields from an object (for exactOptionalPropertyTypes)
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
 * Normalize date-time consistency for plans
 *
 * Rules:
 * 1. start_time and end_time must have the same date portion
 * 2. due_date must match start_time's date
 * 3. If end_time is before start_time, adjust to same date/time as start_time
 */
export function normalizeDateTimeConsistency(data: {
  due_date?: string | null
  start_time?: string | null
  end_time?: string | null
}): void {
  // Only process if both start_time and end_time exist
  if (!data.start_time || !data.end_time) {
    return
  }

  const startDate = new Date(data.start_time)
  const endDate = new Date(data.end_time)

  // Get date parts (local timezone)
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const startDay = startDate.getDate()

  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()
  const endDay = endDate.getDate()

  // Expected due_date
  const expectedDueDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`

  // Consistency check: skip if already consistent
  const datesMatch = startYear === endYear && startMonth === endMonth && startDay === endDay
  const dueDateMatches = data.due_date === expectedDueDate
  const endAfterStart = endDate.getTime() >= startDate.getTime()

  console.debug('[normalizeDateTimeConsistency] Check:', {
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
    console.debug('[normalizeDateTimeConsistency] Already consistent, skipping')
    return
  }

  console.debug('[normalizeDateTimeConsistency] Inconsistency detected - normalizing')

  // 1. Align due_date with start_time's date
  data.due_date = expectedDueDate

  // 2. Align end_time's date with start_time (preserve time)
  if (!datesMatch) {
    const newEndDate = new Date(endDate)
    newEndDate.setFullYear(startYear)
    newEndDate.setMonth(startMonth)
    newEndDate.setDate(startDay)
    data.end_time = newEndDate.toISOString()
  }

  // 3. If end_time is before start_time, set to same time as start_time
  const finalEndDate = new Date(data.end_time)
  if (finalEndDate.getTime() < startDate.getTime()) {
    const fixedEndDate = new Date(startDate)
    data.end_time = fixedEndDate.toISOString()
  }

  console.debug('[normalizeDateTimeConsistency] Normalized:', {
    due_date: data.due_date,
    start_time: data.start_time,
    end_time: data.end_time,
  })
}
