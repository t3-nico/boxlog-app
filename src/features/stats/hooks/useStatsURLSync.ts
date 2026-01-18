'use client';

import { format, parse } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import {
  useStatsPeriodStore,
  type ComparePeriod,
  type PeriodType,
} from '../stores/useStatsPeriodStore';

/** 日付フォーマット（URLパラメータ用） */
const DATE_FORMAT = 'yyyy-MM-dd';

/** 有効な期間タイプ */
const VALID_PERIOD_TYPES: PeriodType[] = ['today', 'week', 'month', 'year', 'custom'];

/** 有効な比較期間 */
const VALID_COMPARE_PERIODS: ComparePeriod[] = ['previous', 'lastYear', 'none'];

/**
 * Stats URL同期フック
 *
 * URLクエリパラメータとZustand storeを双方向同期
 * - URL → Store: 初期化時にURLから状態を読み取り
 * - Store → URL: 状態変更時にURLを更新（shallow routing）
 *
 * URL形式:
 * - ?period=month      - 期間タイプ
 * - ?start=2024-01-01  - 開始日（custom時）
 * - ?end=2024-01-31    - 終了日（custom時）
 * - ?compare=true      - 比較有効フラグ
 * - ?comparePeriod=lastYear - 比較期間タイプ
 * - ?year=2024         - ヒートマップ年度
 *
 * @example
 * ```tsx
 * export function StatsToolbar() {
 *   useStatsURLSync();
 *   // 既存コードは変更不要
 * }
 * ```
 */
export function useStatsURLSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store state
  const periodType = useStatsPeriodStore((state) => state.periodType);
  const startDate = useStatsPeriodStore((state) => state.startDate);
  const endDate = useStatsPeriodStore((state) => state.endDate);
  const compareEnabled = useStatsPeriodStore((state) => state.compareEnabled);
  const comparePeriod = useStatsPeriodStore((state) => state.comparePeriod);
  const heatmapYear = useStatsPeriodStore((state) => state.heatmapYear);

  // Store actions
  const setPeriodType = useStatsPeriodStore((state) => state.setPeriodType);
  const setCustomPeriod = useStatsPeriodStore((state) => state.setCustomPeriod);
  const setCompareEnabled = useStatsPeriodStore((state) => state.setCompareEnabled);
  const setComparePeriod = useStatsPeriodStore((state) => state.setComparePeriod);
  const setHeatmapYear = useStatsPeriodStore((state) => state.setHeatmapYear);

  // 初期化済みフラグ（URL→Store同期は初回のみ）
  const isInitializedRef = useRef(false);
  // URL更新中フラグ（Store→URL同期時のループ防止）
  const isUpdatingURLRef = useRef(false);

  /**
   * URLを更新（shallow routing）
   */
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // 期間タイプ（weekがデフォルトなので省略可）
    if (periodType !== 'week') {
      params.set('period', periodType);
    }

    // カスタム期間の場合は日付も追加
    if (periodType === 'custom') {
      params.set('start', format(startDate, DATE_FORMAT));
      params.set('end', format(endDate, DATE_FORMAT));
    }

    // 比較設定（無効がデフォルトなので、有効時のみ）
    if (compareEnabled) {
      params.set('compare', 'true');
      if (comparePeriod !== 'previous') {
        params.set('comparePeriod', comparePeriod);
      }
    }

    // ヒートマップ年度（現在年と異なる場合のみ）
    const currentYear = new Date().getFullYear();
    if (heatmapYear !== currentYear) {
      params.set('year', heatmapYear.toString());
    }

    const queryString = params.toString();
    const newPath = queryString ? `?${queryString}` : window.location.pathname;

    // shallow routing: ページ再読み込みなし
    isUpdatingURLRef.current = true;
    router.replace(newPath, { scroll: false });

    // 次のtickでフラグをリセット
    setTimeout(() => {
      isUpdatingURLRef.current = false;
    }, 0);
  }, [router, periodType, startDate, endDate, compareEnabled, comparePeriod, heatmapYear]);

  /**
   * URL → Store 同期（初期化時のみ）
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // 期間タイプ
    const periodParam = searchParams?.get('period');
    if (periodParam && VALID_PERIOD_TYPES.includes(periodParam as PeriodType)) {
      const period = periodParam as PeriodType;

      if (period === 'custom') {
        // カスタム期間の場合は日付も読み取り
        const startParam = searchParams?.get('start');
        const endParam = searchParams?.get('end');
        if (startParam && endParam) {
          try {
            const start = parse(startParam, DATE_FORMAT, new Date());
            const end = parse(endParam, DATE_FORMAT, new Date());
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              setCustomPeriod(start, end);
            }
          } catch {
            // パース失敗時はデフォルト維持
          }
        }
      } else {
        setPeriodType(period);
      }
    }

    // 比較設定
    const compareParam = searchParams?.get('compare');
    if (compareParam === 'true') {
      setCompareEnabled(true);

      const comparePeriodParam = searchParams?.get('comparePeriod');
      if (
        comparePeriodParam &&
        VALID_COMPARE_PERIODS.includes(comparePeriodParam as ComparePeriod)
      ) {
        setComparePeriod(comparePeriodParam as ComparePeriod);
      }
    }

    // ヒートマップ年度
    const yearParam = searchParams?.get('year');
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (!isNaN(year) && year >= 2020 && year <= new Date().getFullYear()) {
        setHeatmapYear(year);
      }
    }
  }, [
    searchParams,
    setPeriodType,
    setCustomPeriod,
    setCompareEnabled,
    setComparePeriod,
    setHeatmapYear,
  ]);

  /**
   * Store → URL 同期（状態変更時）
   */
  useEffect(() => {
    // 初期化完了前は無視
    if (!isInitializedRef.current) return;
    // URL更新中は無視（ループ防止）
    if (isUpdatingURLRef.current) return;

    updateURL();
  }, [periodType, startDate, endDate, compareEnabled, comparePeriod, heatmapYear, updateURL]);

  /**
   * ブラウザバック/フォワード時のURL → Store 同期
   */
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      isUpdatingURLRef.current = true;

      // 期間タイプ
      const periodParam = params.get('period');
      if (periodParam && VALID_PERIOD_TYPES.includes(periodParam as PeriodType)) {
        const period = periodParam as PeriodType;

        if (period === 'custom') {
          const startParam = params.get('start');
          const endParam = params.get('end');
          if (startParam && endParam) {
            try {
              const start = parse(startParam, DATE_FORMAT, new Date());
              const end = parse(endParam, DATE_FORMAT, new Date());
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                setCustomPeriod(start, end);
              }
            } catch {
              // パース失敗時はデフォルト維持
            }
          }
        } else {
          setPeriodType(period);
        }
      } else {
        // パラメータなし = デフォルト（week）
        setPeriodType('week');
      }

      // 比較設定
      const compareParam = params.get('compare');
      if (compareParam === 'true') {
        setCompareEnabled(true);
        const comparePeriodParam = params.get('comparePeriod');
        if (
          comparePeriodParam &&
          VALID_COMPARE_PERIODS.includes(comparePeriodParam as ComparePeriod)
        ) {
          setComparePeriod(comparePeriodParam as ComparePeriod);
        } else {
          setComparePeriod('previous');
        }
      } else {
        setCompareEnabled(false);
      }

      // ヒートマップ年度
      const yearParam = params.get('year');
      if (yearParam) {
        const year = parseInt(yearParam, 10);
        if (!isNaN(year) && year >= 2020 && year <= new Date().getFullYear()) {
          setHeatmapYear(year);
        }
      } else {
        setHeatmapYear(new Date().getFullYear());
      }

      setTimeout(() => {
        isUpdatingURLRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setPeriodType, setCustomPeriod, setCompareEnabled, setComparePeriod, setHeatmapYear]);
}
