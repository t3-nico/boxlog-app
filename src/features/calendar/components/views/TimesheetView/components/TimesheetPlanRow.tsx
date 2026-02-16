'use client';

import { useCallback } from 'react';

import { format, isToday, startOfDay } from 'date-fns';
import { Clock, PenLine } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { formatMinutes } from '../hooks/useTimesheetData';

interface TimesheetPlanRowProps {
  plan: CalendarPlan;
  weekDates: Date[];
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
}

/**
 * TimesheetPlanRow - 個別プラン行
 *
 * タイプインジケータ（Plan: Clock blue, Record: PenLine green）で視覚区別。
 * クリックで Inspector 起動。
 */
export function TimesheetPlanRow({ plan, weekDates, onPlanClick }: TimesheetPlanRowProps) {
  const isRecord = plan.type === 'record';

  const handleClick = useCallback(() => {
    onPlanClick?.(plan);
  }, [plan, onPlanClick]);

  // プランが表示される日のキー
  const planDateKey = plan.displayStartDate
    ? format(startOfDay(plan.displayStartDate), 'yyyy-MM-dd')
    : null;

  return (
    <tr className="hover:bg-state-hover cursor-pointer transition-colors" onClick={handleClick}>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-2 pl-6">
          {isRecord ? (
            <PenLine className="text-record-border h-3 w-3 shrink-0" />
          ) : (
            <Clock className="text-plan-border h-3 w-3 shrink-0" />
          )}
          <span className="truncate text-xs">{plan.title}</span>
        </div>
      </td>
      {weekDates.map((date) => {
        const key = format(startOfDay(date), 'yyyy-MM-dd');
        const isThisDay = key === planDateKey;
        const duration = isThisDay ? (plan.duration ?? 0) : 0;
        return (
          <td
            key={date.toISOString()}
            className={cn(
              'text-muted-foreground px-2 py-1.5 text-right text-xs',
              isToday(date) && 'bg-primary-state-hover',
            )}
          >
            {duration > 0 ? formatMinutes(duration) : ''}
          </td>
        );
      })}
      <td className="px-2 py-1.5 text-right text-xs">{formatMinutes(plan.duration ?? 0)}</td>
    </tr>
  );
}
