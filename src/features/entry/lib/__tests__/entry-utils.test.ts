import { describe, expect, it } from 'vitest';

import { normalizeDateTimeConsistency, removeUndefinedFields } from '../entry-utils';

describe('removeUndefinedFields', () => {
  it('removes undefined fields', () => {
    const result = removeUndefinedFields({ a: 1, b: undefined, c: 'hello' });
    expect(result).toEqual({ a: 1, c: 'hello' });
  });

  it('keeps null fields', () => {
    const result = removeUndefinedFields({ a: null, b: 'value' });
    expect(result).toEqual({ a: null, b: 'value' });
  });

  it('returns empty object for all-undefined input', () => {
    const result = removeUndefinedFields({ a: undefined, b: undefined });
    expect(result).toEqual({});
  });
});

describe('normalizeDateTimeConsistency', () => {
  it('does nothing when both are null', () => {
    const data = { start_time: null, end_time: null };
    normalizeDateTimeConsistency(data);
    expect(data.start_time).toBeNull();
    expect(data.end_time).toBeNull();
  });

  it('does nothing when start_time is missing', () => {
    const data = { end_time: '2025-01-15T10:00:00.000Z' };
    normalizeDateTimeConsistency(data);
    expect(data.end_time).toBe('2025-01-15T10:00:00.000Z');
  });

  it('does nothing when end_time is missing', () => {
    const data = { start_time: '2025-01-15T09:00:00.000Z' };
    normalizeDateTimeConsistency(data);
    expect(data.start_time).toBe('2025-01-15T09:00:00.000Z');
  });

  it('does nothing when dates are consistent and end is after start', () => {
    const data = {
      start_time: '2025-01-15T09:00:00.000Z',
      end_time: '2025-01-15T10:00:00.000Z',
    };
    normalizeDateTimeConsistency(data);
    expect(data.start_time).toBe('2025-01-15T09:00:00.000Z');
    expect(data.end_time).toBe('2025-01-15T10:00:00.000Z');
  });

  it('aligns end_time date to start_time date when dates differ', () => {
    const data = {
      start_time: '2025-01-15T09:00:00.000Z',
      end_time: '2025-01-16T10:00:00.000Z', // different day
    };
    normalizeDateTimeConsistency(data);
    // end_time should now be on Jan 15
    const endDate = new Date(data.end_time!);
    const startDate = new Date(data.start_time!);
    expect(endDate.getFullYear()).toBe(startDate.getFullYear());
    expect(endDate.getMonth()).toBe(startDate.getMonth());
    expect(endDate.getDate()).toBe(startDate.getDate());
  });

  it('fixes end_time to match start_time when end is before start on same day', () => {
    const data = {
      start_time: '2025-01-15T10:00:00.000Z',
      end_time: '2025-01-14T08:00:00.000Z', // earlier date AND time
    };
    normalizeDateTimeConsistency(data);
    // After normalization: end_time should be >= start_time
    const endDate = new Date(data.end_time!);
    const startDate = new Date(data.start_time!);
    expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
  });
});
