'use client';

import { useCallback, useState } from 'react';

import { format, isToday, startOfDay } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { formatMinutes } from '../hooks/useTimesheetData';

import type { TimesheetTagGroup } from '../TimesheetView.types';

import { TimesheetPlanRow } from './TimesheetPlanRow';

interface TimesheetTagRowProps {
  group: TimesheetTagGroup;
  weekDates: Date[];
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
}

/**
 * TimesheetTagRow - タグ（親）行
 *
 * 展開/折りたたみで配下のプランを表示。
 * 日別の合計時間を表示。
 */
export function TimesheetTagRow({ group, weekDates, onPlanClick }: TimesheetTagRowProps) {
  const t = useTranslations('calendar.timesheet');
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpanded();
      }
    },
    [toggleExpanded],
  );

  const displayName = group.tagId === null ? t('untagged') : group.tagName;

  return (
    <>
      {/* タグ行 */}
      <tr
        className="bg-card hover:bg-state-hover cursor-pointer transition-colors"
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
      >
        <th scope="row" className="px-3 py-2 text-left">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            )}
            {group.tagId !== null && (
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: group.tagColor }}
              />
            )}
            <span>{displayName}</span>
          </div>
        </th>
        {weekDates.map((date) => {
          const key = format(startOfDay(date), 'yyyy-MM-dd');
          const minutes = group.dailyTotals[key] ?? 0;
          return (
            <td
              key={date.toISOString()}
              className={cn(
                'text-muted-foreground px-2 py-2 text-right text-xs',
                isToday(date) && 'bg-primary-state-hover',
              )}
            >
              {formatMinutes(minutes)}
            </td>
          );
        })}
        <td className="px-2 py-2 text-right text-xs">{formatMinutes(group.weekTotal)}</td>
      </tr>

      {/* 展開時: 個別プラン行 */}
      {isExpanded &&
        group.plans.map((plan) => (
          <TimesheetPlanRow
            key={plan.id}
            plan={plan}
            weekDates={weekDates}
            onPlanClick={onPlanClick}
          />
        ))}
    </>
  );
}
