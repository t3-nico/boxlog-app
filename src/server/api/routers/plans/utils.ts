/**
 * Plans Router Utilities
 * Helper functions for plan operations
 */

import { logger } from '@/lib/logger';

/**
 * Remove undefined fields from an object (for exactOptionalPropertyTypes)
 */
export function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Normalize date-time consistency for plans
 *
 * Rules:
 * 1. start_time and end_time must have the same date portion
 * 2. If end_time is before start_time, adjust to same date/time as start_time
 */
export function normalizeDateTimeConsistency(data: {
  start_time?: string | null;
  end_time?: string | null;
}): void {
  // Only process if both start_time and end_time exist
  if (!data.start_time || !data.end_time) {
    return;
  }

  const startDate = new Date(data.start_time);
  const endDate = new Date(data.end_time);

  // Get date parts (local timezone)
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();

  // Consistency check: skip if already consistent
  const datesMatch = startYear === endYear && startMonth === endMonth && startDay === endDay;
  const endAfterStart = endDate.getTime() >= startDate.getTime();

  if (datesMatch && endAfterStart) {
    return;
  }

  logger.debug('[normalizeDateTimeConsistency] Inconsistency detected - normalizing');

  // 1. Align end_time's date with start_time (preserve time)
  if (!datesMatch) {
    const newEndDate = new Date(endDate);
    newEndDate.setFullYear(startYear);
    newEndDate.setMonth(startMonth);
    newEndDate.setDate(startDay);
    data.end_time = newEndDate.toISOString();
  }

  // 2. If end_time is before start_time, set to same time as start_time
  const finalEndDate = new Date(data.end_time);
  if (finalEndDate.getTime() < startDate.getTime()) {
    const fixedEndDate = new Date(startDate);
    data.end_time = fixedEndDate.toISOString();
  }
}
