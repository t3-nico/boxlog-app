'use client';

import { format, isToday, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { formatMinutes } from '../hooks/useTimesheetData';

interface TimesheetTotalRowProps {
  dailyTotals: Record<string, number>;
  weekTotal: number;
  weekDates: Date[];
}

/**
 * TimesheetTotalRow - 合計行
 */
export function TimesheetTotalRow({ dailyTotals, weekTotal, weekDates }: TimesheetTotalRowProps) {
  const t = useTranslations('calendar.timesheet');

  return (
    <tr className="border-border border-t">
      <th scope="row" className="px-3 py-2 text-left">
        {t('total')}
      </th>
      {weekDates.map((date) => {
        const key = format(startOfDay(date), 'yyyy-MM-dd');
        const minutes = dailyTotals[key] ?? 0;
        return (
          <td
            key={date.toISOString()}
            className={cn('px-2 py-2 text-right', isToday(date) && 'bg-primary-state-hover')}
          >
            {formatMinutes(minutes)}
          </td>
        );
      })}
      <td className="px-2 py-2 text-right">{formatMinutes(weekTotal)}</td>
    </tr>
  );
}
