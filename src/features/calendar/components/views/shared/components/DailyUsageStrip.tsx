'use client';

import { cn } from '@/lib/utils';

import { useDailyUsage } from '../../../../hooks/useDailyUsage';
import { useSleepHours } from '../../../../hooks/useSleepHours';
import type { CalendarPlan } from '../../../../types/calendar.types';

import { TIME_COLUMN_WIDTH } from '../constants/grid.constants';
import { TimezoneOffset } from './TimezoneOffset';

/** セグメント数（2h刻み x 12ブロック = 24h） */
const SEGMENTS = 12;
const HOURS_PER_SEGMENT = 2;

/** 時間を表示用文字列に変換 */
function formatHours(hours: number): string {
  if (hours === 0) return '0';
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
}

/** セグメントバー（2h刻み x 12ブロック） */
function SegmentBar({
  hours,
  variant,
  size = 'sm',
}: {
  hours: number;
  variant: 'plan' | 'record';
  size?: 'sm' | 'md';
}) {
  const barColor = variant === 'plan' ? 'bg-primary' : 'bg-success';
  const textColor = variant === 'plan' && hours > 0 ? 'text-foreground' : 'text-muted-foreground';
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2';
  const filledSegments = Math.ceil(hours / HOURS_PER_SEGMENT);

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-1 gap-px">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-[1px]',
              barHeight,
              i < filledSegments ? barColor : 'bg-muted',
            )}
          />
        ))}
      </div>
      {size === 'md' && (
        <span className={cn('text-xs tabular-nums', textColor)}>{formatHours(hours)}</span>
      )}
    </div>
  );
}

interface DailyUsageCellProps {
  planHours: number;
  recordHours: number;
}

/**
 * 1日分の使用時間セル（レスポンシブ）
 *
 * コンテナクエリで幅に応じて自動切替:
 * - 狭い（< 240px）: 2段ミニバー（WeekView列幅）
 * - 広い（>= 240px）: 横並びラベル付きバー（DayView幅）
 */
function DailyUsageCell({ planHours, recordHours }: DailyUsageCellProps) {
  const hasPlan = planHours > 0;

  return (
    <div className="@container h-full flex-1">
      {/* Narrow: 2段ミニバー */}
      <div className="flex h-full flex-col justify-center gap-0.5 px-2 @[240px]:hidden">
        <SegmentBar hours={planHours} variant="plan" size="sm" />
        <SegmentBar hours={recordHours} variant="record" size="sm" />
      </div>

      {/* Wide: 横並びラベル付きバー */}
      <div className="hidden h-full items-center gap-4 @[240px]:flex">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-xs', hasPlan ? 'text-foreground' : 'text-muted-foreground')}>
            Plan
          </span>
          <div className="w-32">
            <SegmentBar hours={planHours} variant="plan" size="md" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Record</span>
          <div className="w-32">
            <SegmentBar hours={recordHours} variant="record" size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DailyUsageStripProps {
  /** 表示する日付配列 */
  dates: Date[];
  /** 全プラン配列（plan + record 両方） */
  plans: CalendarPlan[];
  /** タイムゾーン（左端に表示） */
  timezone?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * DailyUsageStrip - 複数日付用の日別使用時間表示
 *
 * WeekView, MultiDayView で使用。
 * 各日付列にPlan/Recordの合計時間を表示。
 */
export function DailyUsageStrip({ dates, plans, timezone, className }: DailyUsageStripProps) {
  const sleepHours = useSleepHours();
  const usage = useDailyUsage(plans, dates, sleepHours?.totalHours ?? 0);

  return (
    <div className={cn('bg-background flex h-8', className)}>
      {/* タイムゾーン表示（左端） - デスクトップのみ */}
      <div
        className="hidden flex-shrink-0 items-center md:flex"
        style={{ width: TIME_COLUMN_WIDTH }}
      >
        {timezone ? <TimezoneOffset timezone={timezone} className="w-full text-xs" /> : null}
      </div>

      {/* 各日付の使用時間（CalendarDateHeaderと同じflex-1ラッパーで幅を揃える） */}
      <div className="flex flex-1">
        {dates.map((date) => {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const dayUsage = usage.get(key);
          return (
            <div
              key={date.toISOString()}
              className="flex-1"
              style={{ width: `${100 / dates.length}%` }}
            >
              <DailyUsageCell
                planHours={dayUsage?.planHours ?? 0}
                recordHours={dayUsage?.recordHours ?? 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DailyUsageStripSingleProps {
  /** 表示する日付 */
  date: Date;
  /** 全プラン配列（plan + record 両方） */
  plans: CalendarPlan[];
  /** タイムゾーン（左端に表示） */
  timezone?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * DailyUsageStripSingle - 単一日付用の日別使用時間表示
 *
 * DayView で使用。
 */
export function DailyUsageStripSingle({
  date,
  plans,
  timezone,
  className,
}: DailyUsageStripSingleProps) {
  const dates = [date];
  const sleepHours = useSleepHours();
  const usage = useDailyUsage(plans, dates, sleepHours?.totalHours ?? 0);

  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dayUsage = usage.get(key);

  return (
    <div className={cn('bg-background border-border flex h-8 items-center border-b', className)}>
      {/* タイムゾーン表示（左端） */}
      <div className="flex flex-shrink-0 items-center" style={{ width: TIME_COLUMN_WIDTH }}>
        {timezone ? <TimezoneOffset timezone={timezone} className="w-full text-xs" /> : null}
      </div>

      {/* 使用時間 */}
      <DailyUsageCell
        planHours={dayUsage?.planHours ?? 0}
        recordHours={dayUsage?.recordHours ?? 0}
      />
    </div>
  );
}
