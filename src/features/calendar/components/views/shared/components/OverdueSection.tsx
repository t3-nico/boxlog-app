'use client';

import { isToday } from 'date-fns';

import { cn } from '@/lib/utils';

import { useAllOverduePlans } from '../../../../hooks/useOverduePlans';
import type { CalendarPlan } from '../../../../types/calendar.types';

import { OverdueBadge } from './OverdueBadge';
import { TimezoneOffset } from './TimezoneOffset';

interface OverdueSectionProps {
  /** 表示する日付配列 */
  dates: Date[];
  /** 全プラン配列 */
  plans: CalendarPlan[];
  /** タイムゾーン（左端に表示） */
  timezone?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * OverdueSection - 未完了プランバッジ＋タイムゾーン表示セクション
 *
 * @description
 * 複数日付のカレンダービュー（Week, 3Day, 5Dayなど）で、
 * タイムゾーンと今日の列に未完了プランバッジを表示するセクション。
 * バッジは今日の列にのみ表示され、全ての期限切れ未完了プランの件数を表示。
 */
export function OverdueSection({ dates, plans, timezone, className }: OverdueSectionProps) {
  const overduePlans = useAllOverduePlans(plans);

  return (
    <div className={cn('bg-background flex h-6 pr-4', className)}>
      {/* タイムゾーン表示（左端） - モバイルでは非表示 */}
      <div
        className="border-border hidden flex-shrink-0 items-center justify-end border-r md:flex"
        style={{ width: 64, paddingRight: 8 }}
      >
        {timezone ? <TimezoneOffset timezone={timezone} className="text-xs" /> : null}
      </div>

      {/* 各日付のエリア（今日の列のみバッジ表示） */}
      {dates.map((date, index) => {
        const isCurrentDay = isToday(date);
        const hasOverdue = isCurrentDay && overduePlans.length > 0;
        const isLastColumn = index === dates.length - 1;
        return (
          <div
            key={date.toISOString()}
            className="flex flex-1 items-center justify-center py-0.5"
            style={isLastColumn ? undefined : { borderRight: '1px solid var(--border)' }}
          >
            {hasOverdue ? (
              <OverdueBadge
                overduePlans={overduePlans}
                className={cn(
                  'bg-destructive/10 hover:bg-destructive/15 h-full rounded-md',
                  'w-full px-0.5 md:w-[calc(100%-8px)] md:px-1',
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface OverdueSectionSingleProps {
  /** 表示する日付 */
  date: Date;
  /** 全プラン配列 */
  plans: CalendarPlan[];
  /** タイムゾーン（左端に表示） */
  timezone?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * OverdueSectionSingle - 単一日付用の未完了プランバッジ＋タイムゾーン表示セクション
 *
 * @description
 * DayViewなど、単一日付のビューで使用。
 * 今日を表示している場合のみバッジを表示。
 */
export function OverdueSectionSingle({
  date,
  plans,
  timezone,
  className,
}: OverdueSectionSingleProps) {
  const overduePlans = useAllOverduePlans(plans);
  const isTodayView = isToday(date);
  const hasOverdue = isTodayView && overduePlans.length > 0;

  return (
    <div
      className={cn(
        'bg-background border-border flex h-6 items-center border-b',
        'px-2 md:px-4', // モバイルではパディングを小さく
        className,
      )}
    >
      {/* タイムゾーン表示（左端） - モバイルでは小さく */}
      <div className="border-border flex w-8 flex-shrink-0 items-center border-r md:w-12">
        {timezone ? (
          <TimezoneOffset timezone={timezone} className="text-[10px] md:text-xs" />
        ) : null}
      </div>

      {/* バッジエリア（今日の場合のみ表示） */}
      <div className="flex flex-1 items-center py-0.5">
        {hasOverdue ? (
          <OverdueBadge
            overduePlans={overduePlans}
            className={cn(
              'bg-destructive/10 hover:bg-destructive/15 h-full rounded-md',
              'w-full md:w-[calc(100%-8px)]',
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
