import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { create } from 'zustand';

import { MS_PER_DAY } from '@/constants/time';
import { devtools, persist } from 'zustand/middleware';

/** 期間タイプ */
export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

/** 比較期間タイプ */
export type ComparePeriod = 'previous' | 'lastYear' | 'none';

interface StatsPeriodState {
  /** 期間タイプ */
  periodType: PeriodType;
  /** 開始日 */
  startDate: Date;
  /** 終了日 */
  endDate: Date;
  /** 比較を有効にするか */
  compareEnabled: boolean;
  /** 比較期間 */
  comparePeriod: ComparePeriod;
  /** ヒートマップ表示年度 */
  heatmapYear: number;

  /** 期間タイプを設定 */
  setPeriodType: (type: PeriodType) => void;
  /** カスタム期間を設定 */
  setCustomPeriod: (start: Date, end: Date) => void;
  /** 前の期間に移動 */
  goToPrevious: () => void;
  /** 次の期間に移動 */
  goToNext: () => void;
  /** 今日/今週/今月/今年に戻る */
  goToCurrent: () => void;
  /** 比較を有効/無効にする */
  setCompareEnabled: (enabled: boolean) => void;
  /** 比較期間を設定 */
  setComparePeriod: (period: ComparePeriod) => void;
  /** 比較期間の日付範囲を取得 */
  getCompareDateRange: () => { start: Date; end: Date } | null;
  /** ヒートマップ年度を設定 */
  setHeatmapYear: (year: number) => void;
}

/**
 * 期間タイプに基づいて日付範囲を計算
 */
function calculateDateRange(
  type: PeriodType,
  baseDate: Date = new Date(),
): { start: Date; end: Date } {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  switch (type) {
    case 'today':
      return { start: today, end: today };
    case 'week':
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case 'year':
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };
    case 'custom':
    default:
      return { start: today, end: today };
  }
}

/**
 * 期間を移動（前/次）
 */
function shiftPeriod(
  type: PeriodType,
  currentStart: Date,
  direction: 'prev' | 'next',
): { start: Date; end: Date } {
  const shift = direction === 'prev' ? -1 : 1;

  switch (type) {
    case 'today': {
      const newDate = addDays(currentStart, shift);
      return { start: newDate, end: newDate };
    }
    case 'week': {
      const newStart = direction === 'prev' ? subWeeks(currentStart, 1) : addWeeks(currentStart, 1);
      return {
        start: startOfWeek(newStart, { weekStartsOn: 1 }),
        end: endOfWeek(newStart, { weekStartsOn: 1 }),
      };
    }
    case 'month': {
      const newStart =
        direction === 'prev' ? subMonths(currentStart, 1) : addMonths(currentStart, 1);
      return {
        start: startOfMonth(newStart),
        end: endOfMonth(newStart),
      };
    }
    case 'year': {
      const newStart = direction === 'prev' ? subYears(currentStart, 1) : addYears(currentStart, 1);
      return {
        start: startOfYear(newStart),
        end: endOfYear(newStart),
      };
    }
    case 'custom': {
      const days = Math.ceil((currentStart.getTime() - currentStart.getTime()) / MS_PER_DAY);
      const newStart = addDays(currentStart, shift * (days + 1));
      const newEnd = addDays(currentStart, shift * (days + 1));
      return { start: newStart, end: newEnd };
    }
    default:
      return { start: currentStart, end: currentStart };
  }
}

const initialRange = calculateDateRange('week');

/**
 * 統計ページの期間選択を管理するStore
 */
export const useStatsPeriodStore = create<StatsPeriodState>()(
  devtools(
    persist(
      (set, get) => ({
        periodType: 'week',
        startDate: initialRange.start,
        endDate: initialRange.end,
        compareEnabled: false,
        comparePeriod: 'previous',
        heatmapYear: new Date().getFullYear(),

        setPeriodType: (type) => {
          const range = calculateDateRange(type);
          set({ periodType: type, startDate: range.start, endDate: range.end });
        },

        setCustomPeriod: (start, end) => {
          set({ periodType: 'custom', startDate: start, endDate: end });
        },

        goToPrevious: () => {
          const { periodType, startDate } = get();
          const newRange = shiftPeriod(periodType, startDate, 'prev');
          set({ startDate: newRange.start, endDate: newRange.end });
        },

        goToNext: () => {
          const { periodType, startDate } = get();
          const newRange = shiftPeriod(periodType, startDate, 'next');
          set({ startDate: newRange.start, endDate: newRange.end });
        },

        goToCurrent: () => {
          const { periodType } = get();
          const range = calculateDateRange(periodType);
          set({ startDate: range.start, endDate: range.end });
        },

        setCompareEnabled: (enabled) => {
          set({ compareEnabled: enabled });
        },

        setComparePeriod: (period) => {
          set({ comparePeriod: period });
        },

        setHeatmapYear: (year) => {
          set({ heatmapYear: year });
        },

        getCompareDateRange: () => {
          const { compareEnabled, comparePeriod, startDate, endDate, periodType } = get();
          if (!compareEnabled || comparePeriod === 'none') return null;

          if (comparePeriod === 'previous') {
            const range = shiftPeriod(periodType, startDate, 'prev');
            return range;
          }

          if (comparePeriod === 'lastYear') {
            return {
              start: subYears(startDate, 1),
              end: subYears(endDate, 1),
            };
          }

          return null;
        },
      }),
      {
        name: 'stats-period-storage',
        version: 1,
        partialize: (state) => ({
          periodType: state.periodType,
          compareEnabled: state.compareEnabled,
          comparePeriod: state.comparePeriod,
          heatmapYear: state.heatmapYear,
        }),
      },
    ),
    {
      name: 'stats-period-store',
    },
  ),
);
