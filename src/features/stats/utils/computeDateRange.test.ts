import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeMonthCount, computeStatsDateRange } from './computeDateRange';

describe('computeStatsDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('granularity = "day"', () => {
    it('その日の00:00:00〜23:59:59を返す', () => {
      const result = computeStatsDateRange(new Date(), 'day');
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);

      expect(start.getDate()).toBe(10);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);

      expect(end.getDate()).toBe(10);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe('granularity = "week"', () => {
    it('月曜〜日曜の範囲を返す', () => {
      const result = computeStatsDateRange(new Date(), 'week');
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);

      // 2026-03-10 は火曜なので、月曜 = 3/9
      expect(start.getDate()).toBe(9);
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getHours()).toBe(0);

      // 日曜 = 3/15
      expect(end.getDate()).toBe(15);
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getHours()).toBe(23);
    });
  });

  describe('granularity = "month"', () => {
    it('月の1日〜末日の範囲を返す', () => {
      const result = computeStatsDateRange(new Date(), 'month');
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);

      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(2); // March
      expect(start.getHours()).toBe(0);

      expect(end.getDate()).toBe(31); // March has 31 days
      expect(end.getMonth()).toBe(2);
      expect(end.getHours()).toBe(23);
    });
  });

  describe('granularity = "year"', () => {
    it('1月1日〜12月31日の範囲を返す', () => {
      const result = computeStatsDateRange(new Date(), 'year');
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);

      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);

      expect(end.getFullYear()).toBe(2026);
      expect(end.getMonth()).toBe(11);
      expect(end.getDate()).toBe(31);
      expect(end.getHours()).toBe(23);
    });
  });
});

describe('computeMonthCount', () => {
  it('dayは1を返す', () => {
    expect(computeMonthCount('day')).toBe(1);
  });

  it('weekは3を返す', () => {
    expect(computeMonthCount('week')).toBe(3);
  });

  it('monthは12を返す', () => {
    expect(computeMonthCount('month')).toBe(12);
  });

  it('yearはundefinedを返す', () => {
    expect(computeMonthCount('year')).toBeUndefined();
  });
});
