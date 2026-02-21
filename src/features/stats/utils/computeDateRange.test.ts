import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeDateRange, computeMonthCount } from './computeDateRange';

describe('computeDateRange', () => {
  beforeEach(() => {
    // 固定日時: 2026-02-15T12:00:00.000Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('period = "all"', () => {
    it('startDate/endDateがundefinedを返す', () => {
      const result = computeDateRange('all');

      expect(result.startDate).toBeUndefined();
      expect(result.endDate).toBeUndefined();
    });
  });

  describe('period = "week"', () => {
    it('過去7日の範囲を返す', () => {
      const result = computeDateRange('week');

      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();

      const start = new Date(result.startDate!);
      const end = new Date(result.endDate!);

      // startは7日前の00:00:00
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(1); // February
      expect(start.getDate()).toBe(8);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);

      // endは現在時刻
      expect(end.toISOString()).toBe('2026-02-15T12:00:00.000Z');
    });
  });

  describe('period = "month"', () => {
    it('過去30日の範囲を返す', () => {
      const result = computeDateRange('month');

      const start = new Date(result.startDate!);
      const end = new Date(result.endDate!);

      // startは30日前の00:00:00
      expect(start.getDate()).toBe(16); // Jan 16
      expect(start.getMonth()).toBe(0); // January
      expect(start.getHours()).toBe(0);

      expect(end.toISOString()).toBe('2026-02-15T12:00:00.000Z');
    });
  });

  describe('period = "year"', () => {
    it('過去365日の範囲を返す', () => {
      const result = computeDateRange('year');

      const start = new Date(result.startDate!);
      const end = new Date(result.endDate!);

      // startは365日前の00:00:00
      expect(start.getFullYear()).toBe(2025);
      expect(start.getHours()).toBe(0);

      expect(end.toISOString()).toBe('2026-02-15T12:00:00.000Z');
    });
  });

  it('startDateのミリ秒が0にリセットされる', () => {
    const result = computeDateRange('week');
    const start = new Date(result.startDate!);

    expect(start.getMilliseconds()).toBe(0);
    expect(start.getSeconds()).toBe(0);
  });
});

describe('computeMonthCount', () => {
  it('weekは1を返す', () => {
    expect(computeMonthCount('week')).toBe(1);
  });

  it('monthは3を返す', () => {
    expect(computeMonthCount('month')).toBe(3);
  });

  it('yearは12を返す', () => {
    expect(computeMonthCount('year')).toBe(12);
  });

  it('allはundefinedを返す', () => {
    expect(computeMonthCount('all')).toBeUndefined();
  });
});
