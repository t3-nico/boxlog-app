'use client';

import { cn } from '@/lib/utils';

import { useDailyUsage } from '../../../../hooks/useDailyUsage';
import type { CalendarPlan } from '../../../../types/calendar.types';

import { TIME_COLUMN_WIDTH } from '../constants/grid.constants';
import { TimezoneOffset } from './TimezoneOffset';

/** 時間を表示用文字列に変換 */
function formatHours(hours: number): string {
  if (hours === 0) return '-';
  // 整数なら小数なし、そうでなければ1桁
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
}

interface DailyUsageCellProps {
  planHours: number;
  recordHours: number;
  compact?: boolean;
}

/** 1日分の使用時間セル */
function DailyUsageCell({ planHours, recordHours, compact = false }: DailyUsageCellProps) {
  const hasPlan = planHours > 0;
  const hasRecord = recordHours > 0;

  if (!hasPlan && !hasRecord) {
    return <div className="flex flex-1 items-center py-1" />;
  }

  if (compact) {
    // WeekView: 2行でコンパクト表示
    return (
      <div className="flex flex-1 flex-col items-center justify-center leading-tight">
        <span className={cn('text-xs', hasPlan ? 'text-foreground' : 'text-muted-foreground')}>
          P {formatHours(planHours)}
        </span>
        <span className="text-muted-foreground text-xs">R {formatHours(recordHours)}</span>
      </div>
    );
  }

  // DayView: 1行で表示
  return (
    <div className="flex flex-1 items-center gap-3 px-2">
      <span className={cn('text-sm', hasPlan ? 'text-foreground' : 'text-muted-foreground')}>
        Plan {formatHours(planHours)}
      </span>
      <span className="text-muted-foreground text-sm">Record {formatHours(recordHours)}</span>
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
  const usage = useDailyUsage(plans, dates);

  return (
    <div className={cn('bg-background flex h-8 gap-px', className)}>
      {/* タイムゾーン表示（左端） - デスクトップのみ */}
      <div
        className="hidden flex-shrink-0 items-center md:flex"
        style={{ width: TIME_COLUMN_WIDTH }}
      >
        {timezone ? <TimezoneOffset timezone={timezone} className="w-full text-xs" /> : null}
      </div>

      {/* 各日付の使用時間 */}
      {dates.map((date) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayUsage = usage.get(key);
        return (
          <DailyUsageCell
            key={date.toISOString()}
            planHours={dayUsage?.planHours ?? 0}
            recordHours={dayUsage?.recordHours ?? 0}
            compact
          />
        );
      })}
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
  const usage = useDailyUsage(plans, dates);

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
