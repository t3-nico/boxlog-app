'use client';

import { useCallback } from 'react';

import { format, startOfDay } from 'date-fns';
import { Clock } from 'lucide-react';

import type { CalendarEvent } from '../../../../types/calendar.types';

import { useTagsMap } from '@/hooks/useTagsMap';
import { formatMinutes } from '../hooks/useTimesheetData';

interface TimesheetPlanRowProps {
  plan: CalendarEvent;
  weekDates: Date[];
  onPlanClick?: ((plan: CalendarEvent) => void) | undefined;
}

/**
 * TimesheetPlanRow - 個別エントリー行
 *
 * クリックで Inspector 起動。
 */
export function TimesheetPlanRow({ plan, weekDates, onPlanClick }: TimesheetPlanRowProps) {
  const { getTagById } = useTagsMap();
  const handleClick = useCallback(() => {
    onPlanClick?.(plan);
  }, [plan, onPlanClick]);

  const tagName = plan.tagId ? getTagById(plan.tagId)?.name : null;

  // プランが表示される日のキー
  const planDateKey = plan.displayStartDate
    ? format(startOfDay(plan.displayStartDate), 'yyyy-MM-dd')
    : null;

  return (
    <tr className="hover:bg-state-hover cursor-pointer transition-colors" onClick={handleClick}>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-2 pl-6">
          <Clock className="text-muted-foreground h-3 w-3 shrink-0" />
          <span className="truncate text-xs">{tagName || plan.title}</span>
        </div>
      </td>
      {weekDates.map((date) => {
        const key = format(startOfDay(date), 'yyyy-MM-dd');
        const isThisDay = key === planDateKey;
        const duration = isThisDay ? (plan.duration ?? 0) : 0;
        return (
          <td
            key={date.toISOString()}
            className="text-muted-foreground px-2 py-1.5 text-right text-xs"
          >
            {duration > 0 ? formatMinutes(duration) : ''}
          </td>
        );
      })}
      <td className="px-2 py-1.5 text-right text-xs">{formatMinutes(plan.duration ?? 0)}</td>
    </tr>
  );
}
