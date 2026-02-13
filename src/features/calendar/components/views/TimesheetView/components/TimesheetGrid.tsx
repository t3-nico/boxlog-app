'use client';

import { format, isToday } from 'date-fns';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import type { TimesheetData } from '../TimesheetView.types';

import { TimesheetTagRow } from './TimesheetTagRow';
import { TimesheetTotalRow } from './TimesheetTotalRow';

interface TimesheetGridProps {
  data: TimesheetData;
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
}

/**
 * TimesheetGrid - テーブルレイアウト
 *
 * ヘッダー行（曜日）+ タグ行群 + 合計行
 */
export function TimesheetGrid({ data, onPlanClick }: TimesheetGridProps) {
  const t = useTranslations('calendar.timesheet');
  const { tagGroups, dailyTotals, weekTotal, weekDates } = data;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* ヘッダー行 */}
        <thead>
          <tr className="border-border bg-background sticky top-0 z-10 border-b">
            <th scope="col" className="text-muted-foreground px-3 py-2 text-left text-xs">
              {t('tag')}
            </th>
            {weekDates.map((date) => (
              <th
                key={date.toISOString()}
                scope="col"
                className={cn(
                  'text-muted-foreground px-2 py-2 text-right text-xs',
                  isToday(date) && 'bg-primary-state-hover text-primary',
                )}
              >
                {format(date, 'EEE d')}
              </th>
            ))}
            <th scope="col" className="text-muted-foreground px-2 py-2 text-right text-xs">
              {t('total')}
            </th>
          </tr>
        </thead>

        <tbody>
          {tagGroups.map((group) => (
            <TimesheetTagRow
              key={group.tagId ?? '__untagged__'}
              group={group}
              weekDates={weekDates}
              onPlanClick={onPlanClick}
            />
          ))}
        </tbody>

        {/* 合計行 */}
        <tfoot>
          <TimesheetTotalRow
            dailyTotals={dailyTotals}
            weekTotal={weekTotal}
            weekDates={weekDates}
          />
        </tfoot>
      </table>
    </div>
  );
}
