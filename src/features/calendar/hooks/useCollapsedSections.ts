/**
 * クロノタイプの睡眠時間帯折りたたみhook
 */

import { useCallback, useMemo } from 'react';

import {
  CHRONOTYPE_PRESETS,
  type ChronotypeType,
  type ProductivityZone,
} from '@/features/settings/types/chronotype';

import type {
  CollapsedSection,
  GridSection,
  SleepTimeRange,
  TimeConversionContext,
} from '../types/collapsedSection.types';

/** 折りたたみセクションの高さ（px） */
const COLLAPSED_SECTION_HEIGHT = 72;

interface UseCollapsedSectionsOptions {
  /** クロノタイプ機能が有効か */
  chronotypeEnabled: boolean;
  /** クロノタイプの種類 */
  chronotypeType: ChronotypeType;
  /** カスタムゾーン（type が 'custom' の場合） */
  customZones?: ProductivityZone[] | undefined;
  /** 表示している日付の配列 */
  displayDates: Date[];
  /** プラン/イベントの配列（startDate, endDate を持つ） */
  plans: Array<{ startDate?: Date | string | null; endDate?: Date | string | null }>;
  /** 1時間の高さ（px） */
  hourHeight: number;
}

interface UseCollapsedSectionsReturn {
  /** グリッドセクションの配列 */
  sections: GridSection[];
  /** グリッド総高さ */
  totalHeight: number;
  /** 折りたたみセクションがあるか */
  hasCollapsedSections: boolean;
  /** 時刻→ピクセル変換（折りたたみ考慮） */
  timeToPixels: (time: Date) => number;
  /** ピクセル→時刻変換（折りたたみ考慮） */
  pixelsToTime: (pixels: number, baseDate: Date) => Date;
  /** 時間→ピクセル変換（時間数値から） */
  hourToPixels: (hour: number) => number;
  /** 変換コンテキスト */
  context: TimeConversionContext;
}

/**
 * クロノタイプから睡眠時間帯を取得
 */
function getSleepRanges(
  chronotypeType: ChronotypeType,
  customZones?: ProductivityZone[],
): SleepTimeRange[] {
  const zones =
    chronotypeType === 'custom' && customZones
      ? customZones
      : (CHRONOTYPE_PRESETS[chronotypeType]?.productivityZones ?? []);

  return zones
    .filter((zone) => zone.level === 'sleep')
    .map((zone) => ({
      startHour: zone.startHour,
      endHour: zone.endHour,
    }));
}

/**
 * 睡眠時間帯を2つのセクション（上部・下部）に分割
 * 例: 22:00-6:00 → [0:00-6:00, 22:00-24:00]
 */
function splitSleepRangeToSections(range: SleepTimeRange): SleepTimeRange[] {
  // 日をまたがない場合（例: 0:00-9:00）
  if (range.startHour < range.endHour) {
    return [range];
  }

  // 日をまたぐ場合（例: 22:00-6:00）
  // → 上部: 0:00-endHour, 下部: startHour-24:00
  return [
    { startHour: 0, endHour: range.endHour }, // 上部
    { startHour: range.startHour, endHour: 24 }, // 下部
  ];
}

/**
 * 時間帯にイベントがあるかチェック
 */
function hasEventsInRange(
  plans: Array<{ startDate?: Date | string | null; endDate?: Date | string | null }>,
  displayDates: Date[],
  rangeStartHour: number,
  rangeEndHour: number,
): boolean {
  for (const displayDate of displayDates) {
    const dayStart = new Date(displayDate);
    dayStart.setHours(0, 0, 0, 0);

    for (const plan of plans) {
      if (!plan.startDate || !plan.endDate) continue;

      const planStart = new Date(plan.startDate);
      const planEnd = new Date(plan.endDate);

      // プランがこの日に該当するかチェック
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      if (planEnd <= dayStart || planStart >= dayEnd) continue;

      // プランの時間帯が範囲と重なるかチェック
      const planStartHour = planStart.getHours() + planStart.getMinutes() / 60;
      const planEndHour = planEnd.getHours() + planEnd.getMinutes() / 60;

      // 日をまたぐプラン（終了が翌日）
      const effectiveEndHour =
        planEnd.getDate() !== planStart.getDate() && planEnd.getDate() === dayStart.getDate() + 1
          ? 24 + planEndHour
          : planEndHour;

      // 範囲との重複チェック
      if (planStartHour < rangeEndHour && effectiveEndHour > rangeStartHour) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 時刻フォーマット（HH:00形式）
 */
function formatHour(hour: number): string {
  const h = hour % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

/**
 * クロノタイプの睡眠時間帯を折りたたむhook
 */
export function useCollapsedSections({
  chronotypeEnabled,
  chronotypeType,
  customZones,
  displayDates,
  plans,
  hourHeight,
}: UseCollapsedSectionsOptions): UseCollapsedSectionsReturn {
  // 睡眠時間帯を取得してセクションに分割
  const sleepSections = useMemo(() => {
    if (!chronotypeEnabled) {
      return [];
    }

    const sleepRanges = getSleepRanges(chronotypeType, customZones);
    const allSections: SleepTimeRange[] = [];

    for (const range of sleepRanges) {
      const split = splitSleepRangeToSections(range);
      allSections.push(...split);
    }

    // 開始時間でソート
    return allSections.sort((a, b) => a.startHour - b.startHour);
  }, [chronotypeEnabled, chronotypeType, customZones]);

  // 各睡眠セクションの折りたたみ状態を計算
  const collapsedSections = useMemo((): CollapsedSection[] => {
    return sleepSections.map((range) => {
      const hasEvents = hasEventsInRange(plans, displayDates, range.startHour, range.endHour);
      const duration = range.endHour - range.startHour;

      return {
        startHour: range.startHour,
        endHour: range.endHour,
        originalDuration: duration,
        isCollapsed: !hasEvents,
        collapsedHeight: COLLAPSED_SECTION_HEIGHT,
        label: `${formatHour(range.startHour)} - ${formatHour(range.endHour)}`,
      };
    });
  }, [sleepSections, plans, displayDates]);

  // GridSectionの配列を構築
  const sections = useMemo((): GridSection[] => {
    if (!chronotypeEnabled || collapsedSections.length === 0) {
      // 折りたたみなし: 24時間を1つのセクションとして扱う
      return [
        {
          type: 'normal',
          startHour: 0,
          endHour: 24,
          heightPx: 24 * hourHeight,
          offsetPx: 0,
        },
      ];
    }

    const result: GridSection[] = [];
    let currentHour = 0;
    let currentOffset = 0;

    for (const collapsed of collapsedSections) {
      // 折りたたみセクションの前の通常セクション
      if (currentHour < collapsed.startHour) {
        const normalDuration = collapsed.startHour - currentHour;
        result.push({
          type: 'normal',
          startHour: currentHour,
          endHour: collapsed.startHour,
          heightPx: normalDuration * hourHeight,
          offsetPx: currentOffset,
        });
        currentOffset += normalDuration * hourHeight;
      }

      // 折りたたみセクション
      const sectionHeight = collapsed.isCollapsed
        ? collapsed.collapsedHeight
        : collapsed.originalDuration * hourHeight;

      result.push({
        type: collapsed.isCollapsed ? 'collapsed' : 'normal',
        startHour: collapsed.startHour,
        endHour: collapsed.endHour,
        heightPx: sectionHeight,
        offsetPx: currentOffset,
        collapsedData: collapsed.isCollapsed ? collapsed : undefined,
      });

      currentOffset += sectionHeight;
      currentHour = collapsed.endHour;
    }

    // 最後の通常セクション
    if (currentHour < 24) {
      const normalDuration = 24 - currentHour;
      result.push({
        type: 'normal',
        startHour: currentHour,
        endHour: 24,
        heightPx: normalDuration * hourHeight,
        offsetPx: currentOffset,
      });
    }

    return result;
  }, [chronotypeEnabled, collapsedSections, hourHeight]);

  // 総高さ
  const totalHeight = useMemo(() => {
    return sections.reduce((sum, section) => sum + section.heightPx, 0);
  }, [sections]);

  // 折りたたみセクションがあるか
  const hasCollapsedSections = useMemo(() => {
    return sections.some((s) => s.type === 'collapsed');
  }, [sections]);

  // 時刻→ピクセル変換
  const timeToPixels = useCallback(
    (time: Date): number => {
      const hour = time.getHours() + time.getMinutes() / 60;
      return hourToPixelsInternal(hour, sections, hourHeight);
    },
    [sections, hourHeight],
  );

  // 時間→ピクセル変換（数値から）
  const hourToPixels = useCallback(
    (hour: number): number => {
      return hourToPixelsInternal(hour, sections, hourHeight);
    },
    [sections, hourHeight],
  );

  // ピクセル→時刻変換
  const pixelsToTime = useCallback(
    (pixels: number, baseDate: Date): Date => {
      const hour = pixelsToHourInternal(pixels, sections, hourHeight);
      const result = new Date(baseDate);
      result.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
      return result;
    },
    [sections, hourHeight],
  );

  // コンテキスト
  const context: TimeConversionContext = useMemo(
    () => ({
      sections,
      totalHeight,
      hasCollapsedSections,
    }),
    [sections, totalHeight, hasCollapsedSections],
  );

  return {
    sections,
    totalHeight,
    hasCollapsedSections,
    timeToPixels,
    pixelsToTime,
    hourToPixels,
    context,
  };
}

/**
 * 時間→ピクセル変換（内部関数）
 */
function hourToPixelsInternal(hour: number, sections: GridSection[], hourHeight: number): number {
  let pixels = 0;

  for (const section of sections) {
    if (hour <= section.startHour) {
      break;
    }

    if (hour >= section.endHour) {
      // このセクション全体を通過
      pixels += section.heightPx;
    } else {
      // このセクション内に時刻がある
      const hoursInSection = hour - section.startHour;
      const sectionDuration = section.endHour - section.startHour;

      if (section.type === 'collapsed') {
        // 折りたたみ: 比例配分
        const ratio = hoursInSection / sectionDuration;
        pixels += ratio * section.heightPx;
      } else {
        // 通常: 標準計算
        pixels += hoursInSection * hourHeight;
      }
      break;
    }
  }

  return pixels;
}

/**
 * ピクセル→時間変換（内部関数）
 */
function pixelsToHourInternal(pixels: number, sections: GridSection[], hourHeight: number): number {
  let remainingPixels = pixels;

  for (const section of sections) {
    if (remainingPixels <= section.heightPx) {
      const sectionDuration = section.endHour - section.startHour;

      if (section.type === 'collapsed') {
        // 折りたたみ: 比例配分で逆算
        const ratio = remainingPixels / section.heightPx;
        return section.startHour + ratio * sectionDuration;
      } else {
        // 通常: 標準計算
        return section.startHour + remainingPixels / hourHeight;
      }
    }
    remainingPixels -= section.heightPx;
  }

  // 範囲外の場合は24時
  return 24;
}
