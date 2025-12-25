import { act } from '@testing-library/react';
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subYears,
} from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useStatsPeriodStore } from './useStatsPeriodStore';

describe('useStatsPeriodStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 2025年1月15日（水曜日）に固定
    vi.setSystemTime(new Date('2025-01-15T12:00:00'));

    // ストアをリセット
    act(() => {
      useStatsPeriodStore.getState().setPeriodType('week');
      useStatsPeriodStore.getState().setCompareEnabled(false);
      useStatsPeriodStore.getState().setComparePeriod('previous');
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('デフォルト期間タイプはweek', () => {
      const { periodType } = useStatsPeriodStore.getState();
      expect(periodType).toBe('week');
    });

    it('比較はデフォルトで無効', () => {
      const { compareEnabled } = useStatsPeriodStore.getState();
      expect(compareEnabled).toBe(false);
    });

    it('デフォルト比較期間はprevious', () => {
      const { comparePeriod } = useStatsPeriodStore.getState();
      expect(comparePeriod).toBe('previous');
    });
  });

  describe('setPeriodType', () => {
    it('todayに設定できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('today');
      });

      const { periodType, startDate, endDate } = useStatsPeriodStore.getState();
      expect(periodType).toBe('today');

      // 同じ日
      expect(startDate.toDateString()).toBe(endDate.toDateString());
    });

    it('weekに設定できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
      });

      const { periodType, startDate, endDate } = useStatsPeriodStore.getState();
      expect(periodType).toBe('week');

      const today = new Date('2025-01-15');
      expect(startDate.toDateString()).toBe(startOfWeek(today, { weekStartsOn: 1 }).toDateString());
      expect(endDate.toDateString()).toBe(endOfWeek(today, { weekStartsOn: 1 }).toDateString());
    });

    it('monthに設定できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('month');
      });

      const { periodType, startDate, endDate } = useStatsPeriodStore.getState();
      expect(periodType).toBe('month');

      const today = new Date('2025-01-15');
      expect(startDate.toDateString()).toBe(startOfMonth(today).toDateString());
      expect(endDate.toDateString()).toBe(endOfMonth(today).toDateString());
    });

    it('yearに設定できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('year');
      });

      const { periodType, startDate, endDate } = useStatsPeriodStore.getState();
      expect(periodType).toBe('year');

      const today = new Date('2025-01-15');
      expect(startDate.toDateString()).toBe(startOfYear(today).toDateString());
      expect(endDate.toDateString()).toBe(endOfYear(today).toDateString());
    });
  });

  describe('setCustomPeriod', () => {
    it('カスタム期間を設定できる', () => {
      const customStart = new Date('2025-02-01');
      const customEnd = new Date('2025-02-28');

      act(() => {
        useStatsPeriodStore.getState().setCustomPeriod(customStart, customEnd);
      });

      const { periodType, startDate, endDate } = useStatsPeriodStore.getState();
      expect(periodType).toBe('custom');
      expect(startDate.toDateString()).toBe(customStart.toDateString());
      expect(endDate.toDateString()).toBe(customEnd.toDateString());
    });
  });

  describe('goToPrevious / goToNext', () => {
    it('week: 前の週に移動できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
      });

      const initialStart = useStatsPeriodStore.getState().startDate;

      act(() => {
        useStatsPeriodStore.getState().goToPrevious();
      });

      const { startDate } = useStatsPeriodStore.getState();
      // 1週間前
      expect(startDate.getTime()).toBeLessThan(initialStart.getTime());
    });

    it('week: 次の週に移動できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
      });

      const initialStart = useStatsPeriodStore.getState().startDate;

      act(() => {
        useStatsPeriodStore.getState().goToNext();
      });

      const { startDate } = useStatsPeriodStore.getState();
      // 1週間後
      expect(startDate.getTime()).toBeGreaterThan(initialStart.getTime());
    });

    it('month: 前の月に移動できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('month');
      });

      act(() => {
        useStatsPeriodStore.getState().goToPrevious();
      });

      const { startDate } = useStatsPeriodStore.getState();
      // 12月
      expect(startDate.getMonth()).toBe(11); // 0-indexed
    });

    it('year: 前の年に移動できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('year');
      });

      act(() => {
        useStatsPeriodStore.getState().goToPrevious();
      });

      const { startDate } = useStatsPeriodStore.getState();
      expect(startDate.getFullYear()).toBe(2024);
    });
  });

  describe('goToCurrent', () => {
    it('今週に戻れる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
        // 過去に移動
        useStatsPeriodStore.getState().goToPrevious();
        useStatsPeriodStore.getState().goToPrevious();
      });

      act(() => {
        useStatsPeriodStore.getState().goToCurrent();
      });

      const { startDate } = useStatsPeriodStore.getState();
      const today = new Date('2025-01-15');
      expect(startDate.toDateString()).toBe(startOfWeek(today, { weekStartsOn: 1 }).toDateString());
    });

    it('今月に戻れる', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('month');
        useStatsPeriodStore.getState().goToPrevious();
      });

      act(() => {
        useStatsPeriodStore.getState().goToCurrent();
      });

      const { startDate } = useStatsPeriodStore.getState();
      expect(startDate.getMonth()).toBe(0); // 1月
    });
  });

  describe('比較機能', () => {
    it('比較を有効化できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setCompareEnabled(true);
      });

      expect(useStatsPeriodStore.getState().compareEnabled).toBe(true);
    });

    it('比較期間をlastYearに変更できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setComparePeriod('lastYear');
      });

      expect(useStatsPeriodStore.getState().comparePeriod).toBe('lastYear');
    });

    it('比較期間をnoneに変更できる', () => {
      act(() => {
        useStatsPeriodStore.getState().setComparePeriod('none');
      });

      expect(useStatsPeriodStore.getState().comparePeriod).toBe('none');
    });
  });

  describe('getCompareDateRange', () => {
    it('比較が無効の場合はnullを返す', () => {
      act(() => {
        useStatsPeriodStore.getState().setCompareEnabled(false);
      });

      const result = useStatsPeriodStore.getState().getCompareDateRange();
      expect(result).toBeNull();
    });

    it('comparePeriodがnoneの場合はnullを返す', () => {
      act(() => {
        useStatsPeriodStore.getState().setCompareEnabled(true);
        useStatsPeriodStore.getState().setComparePeriod('none');
      });

      const result = useStatsPeriodStore.getState().getCompareDateRange();
      expect(result).toBeNull();
    });

    it('previous: 前の期間を返す', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
        useStatsPeriodStore.getState().setCompareEnabled(true);
        useStatsPeriodStore.getState().setComparePeriod('previous');
      });

      const result = useStatsPeriodStore.getState().getCompareDateRange();
      expect(result).not.toBeNull();
      expect(result!.start.getTime()).toBeLessThan(
        useStatsPeriodStore.getState().startDate.getTime(),
      );
    });

    it('lastYear: 去年の同期間を返す', () => {
      act(() => {
        useStatsPeriodStore.getState().setPeriodType('week');
        useStatsPeriodStore.getState().setCompareEnabled(true);
        useStatsPeriodStore.getState().setComparePeriod('lastYear');
      });

      const { startDate, endDate } = useStatsPeriodStore.getState();
      const result = useStatsPeriodStore.getState().getCompareDateRange();

      expect(result).not.toBeNull();
      expect(result!.start.toDateString()).toBe(subYears(startDate, 1).toDateString());
      expect(result!.end.toDateString()).toBe(subYears(endDate, 1).toDateString());
    });
  });

  describe('期間タイプの全パターン', () => {
    const periodTypes = ['today', 'week', 'month', 'year'] as const;

    periodTypes.forEach((type) => {
      it(`${type}: 前後移動と現在復帰が正しく動作する`, () => {
        act(() => {
          useStatsPeriodStore.getState().setPeriodType(type);
        });

        const initialStart = useStatsPeriodStore.getState().startDate.getTime();

        // 前に移動
        act(() => {
          useStatsPeriodStore.getState().goToPrevious();
        });
        expect(useStatsPeriodStore.getState().startDate.getTime()).toBeLessThan(initialStart);

        // 現在に戻る
        act(() => {
          useStatsPeriodStore.getState().goToCurrent();
        });
        expect(useStatsPeriodStore.getState().startDate.getTime()).toBe(initialStart);

        // 次に移動
        act(() => {
          useStatsPeriodStore.getState().goToNext();
        });
        expect(useStatsPeriodStore.getState().startDate.getTime()).toBeGreaterThan(initialStart);
      });
    });
  });
});
