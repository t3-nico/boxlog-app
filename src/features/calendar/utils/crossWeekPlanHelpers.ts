import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  isSaturday,
  isSunday,
  isWithinInterval,
  startOfDay,
} from 'date-fns';

import { MS_PER_DAY, MS_PER_MINUTE } from '@/constants/time';
import { CalendarPlan } from '@/features/calendar/types/calendar.types';

export interface PlanSegment extends CalendarPlan {
  originalPlan: CalendarPlan;
  segmentStart: Date;
  segmentEnd: Date;
  isPartialSegment: boolean;
  segmentType: 'start' | 'middle' | 'end' | 'full';
  originalDuration: number;
  /** 翻訳キー: 'calendar.segment.start' | 'calendar.segment.middle' | 'calendar.segment.end' | null */
  segmentLabelKey: string | null;
}

/**
 * 週をまたぐプランを週末表示設定に応じて分割する
 * @param plans 元のプランリスト
 * @param showWeekends 週末表示フラグ
 * @param weekStart 週の開始日
 * @returns 分割されたプランセグメント
 */
export function splitCrossWeekPlans(
  plans: CalendarPlan[],
  showWeekends: boolean,
  weekStart: Date,
): PlanSegment[] {
  const segments: PlanSegment[] = [];

  plans.forEach((plan) => {
    if (!plan.startDate || !plan.endDate) {
      // 単発プランはそのまま追加
      segments.push({
        ...plan,
        originalPlan: plan,
        segmentStart: plan.startDate || new Date(),
        segmentEnd: plan.endDate || plan.startDate || new Date(),
        isPartialSegment: false,
        segmentType: 'full',
        originalDuration: plan.duration || 60,
        segmentLabelKey: null,
      });
      return;
    }

    const planStart = startOfDay(plan.startDate);
    const planEnd = endOfDay(plan.endDate);

    // 単日プランの場合
    if (isSameDay(planStart, planEnd)) {
      segments.push({
        ...plan,
        originalPlan: plan,
        segmentStart: plan.startDate,
        segmentEnd: plan.endDate,
        isPartialSegment: false,
        segmentType: 'full',
        originalDuration: plan.duration || 60,
        segmentLabelKey: null,
      });
      return;
    }

    // 複数日プランを分割
    const planSegments = createPlanSegments(plan, showWeekends, weekStart);
    segments.push(...planSegments);
  });

  return segments;
}

/**
 * 複数日プランを日毎のセグメントに分割
 *
 * ## アルゴリズム概要
 * 1. プランの開始日から終了日まで1日ずつ走査
 * 2. 週末表示OFFの場合、土日はスキップ
 * 3. 各日に対してセグメントを生成:
 *    - 初日: segmentType='start', 元のstart_timeを保持
 *    - 中間日: segmentType='middle', 00:00-23:59
 *    - 最終日: segmentType='end', 元のend_timeを保持
 *    - 単日: segmentType='full'
 *
 * ## 翻訳キーの形式
 * - 'calendar.segment.start' → 「開始」
 * - 'calendar.segment.middle' → 「継続」
 * - 'calendar.segment.end' → 「終了」
 */
function createPlanSegments(
  plan: CalendarPlan,
  showWeekends: boolean,
  _weekStart: Date,
): PlanSegment[] {
  const segments: PlanSegment[] = [];

  if (!plan.startDate || !plan.endDate) return segments;

  let currentDate = startOfDay(plan.startDate);
  const endDate = startOfDay(plan.endDate);
  const originalDuration = plan.duration || 60;

  let segmentIndex = 0;
  const totalDays = Math.ceil((endDate.getTime() - currentDate.getTime()) / MS_PER_DAY) + 1;

  while (currentDate <= endDate) {
    // 週末表示がOFFの場合、土日をスキップ
    if (!showWeekends && (isSaturday(currentDate) || isSunday(currentDate))) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    const isFirstSegment = segmentIndex === 0;
    const isLastSegment = isSameDay(currentDate, endDate);

    // セグメントの開始・終了時刻を計算
    const segmentStart = isFirstSegment
      ? plan.startDate
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);

    const segmentEnd = isLastSegment
      ? plan.endDate
      : new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          23,
          59,
          59,
        );

    // セグメントタイプを決定
    let segmentType: 'start' | 'middle' | 'end' | 'full';
    if (totalDays === 1) {
      segmentType = 'full';
    } else if (isFirstSegment) {
      segmentType = 'start';
    } else if (isLastSegment) {
      segmentType = 'end';
    } else {
      segmentType = 'middle';
    }

    // セグメントを作成
    segments.push({
      ...plan,
      id: `${plan.id}-segment-${format(currentDate, 'yyyy-MM-dd')}`,
      originalPlan: plan,
      segmentStart,
      segmentEnd,
      startDate: segmentStart,
      endDate: segmentEnd,
      isPartialSegment: segmentType !== 'full',
      segmentType,
      originalDuration,
      // 翻訳キーを設定（UIコンポーネントで翻訳して表示）
      segmentLabelKey: getSegmentLabelKey(segmentType),
      // タイトルはそのまま保持（翻訳済みラベルはUIで結合）
      title: plan.title,
      // 分割されたセグメントの継続時間を計算
      duration: Math.ceil((segmentEnd.getTime() - segmentStart.getTime()) / MS_PER_MINUTE),
    });

    currentDate = addDays(currentDate, 1);
    segmentIndex++;
  }

  return segments;
}

/**
 * セグメントタイプに応じた翻訳キーを取得
 * @returns 翻訳キー（calendar.segment.start 等）またはnull
 */
function getSegmentLabelKey(segmentType: 'start' | 'middle' | 'end' | 'full'): string | null {
  switch (segmentType) {
    case 'start':
      return 'calendar.segment.start';
    case 'middle':
      return 'calendar.segment.middle';
    case 'end':
      return 'calendar.segment.end';
    case 'full':
    default:
      return null;
  }
}

/**
 * 週末に含まれるプランをフィルタリング
 */
export function filterWeekendPlans(
  plans: CalendarPlan[],
  dateRange: { start: Date; end: Date },
): CalendarPlan[] {
  return plans.filter((plan) => {
    if (!plan.startDate) return false;

    const planDate = plan.startDate;
    const isWeekend = isSaturday(planDate) || isSunday(planDate);

    return isWeekend && isWithinInterval(planDate, dateRange);
  });
}

/**
 * 金曜から月曜にまたがるプランを検出
 */
export function detectFridayToMondayPlans(plans: CalendarPlan[]): CalendarPlan[] {
  return plans.filter((plan) => {
    if (!plan.startDate || !plan.endDate) return false;

    const startDay = plan.startDate.getDay(); // 0=Sunday, 5=Friday
    const endDay = plan.endDate.getDay(); // 1=Monday

    return startDay === 5 && endDay === 1; // Friday to Monday
  });
}
