'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';

import { TimesheetGrid } from './components/TimesheetGrid';
import { useTimesheetData } from './hooks/useTimesheetData';

import type { TimesheetViewProps } from './TimesheetView.types';

/**
 * TimesheetView - タグ×日のピボットテーブルビュー
 *
 * タグ（プロジェクト）を行、曜日を列として週単位の時間配分を一覧表示。
 * チェックボックスで Plan の完了を切り替え可能。
 */
export function TimesheetView({ plans, currentDate, className, onPlanClick }: TimesheetViewProps) {
  const t = useTranslations('calendar.timesheet');
  const data = useTimesheetData(plans, currentDate);

  const hasAnyPlans = data.tagGroups.length > 0;

  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        <div className="flex-1 overflow-y-auto">
          {hasAnyPlans ? (
            <TimesheetGrid data={data} onPlanClick={onPlanClick} />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  );
}
