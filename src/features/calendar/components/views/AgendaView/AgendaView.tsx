'use client';

import { useCallback, useMemo, useRef } from 'react';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/ui/empty-state';
import { startOfDay } from '@/lib/date';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';

import type { AgendaViewProps } from './AgendaView.types';
import { AgendaDayGroup } from './components/AgendaDayGroup';

/**
 * AgendaView - スケジュール済みプランを日別グループで表示
 *
 * **レイアウト**: 日付ヘッダー → その日のアイテムリスト
 *
 * Google Calendar方式の無限スクロールを実現:
 * - データは親コンポーネントから渡される（useCalendarDataで取得）
 * - 日付範囲は親で制御（calculateViewDateRangeでagenda用に60日）
 * - 空の日は非表示（予定がある日のみ表示）
 */
export function AgendaView({
  plans,
  currentDate,
  className,
  onPlanClick,
  onPlanContextMenu,
}: AgendaViewProps) {
  const t = useTranslations('calendar.agenda');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // プランを日付ごとにグループ化（日付なしはスキップ）
  const plansByDate = useMemo(() => {
    const grouped = new Map<string, typeof plans>();

    // プランを日付で振り分け
    for (const plan of plans ?? []) {
      if (!plan.startDate) continue;
      const planDate = startOfDay(plan.startDate);
      const key = planDate.toISOString();

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(plan);
    }

    // 各日付のプランを時間順でソート
    for (const [key, dayPlans] of grouped) {
      grouped.set(
        key,
        dayPlans.sort((a, b) => {
          const aTime = a.startDate?.getTime() ?? 0;
          const bTime = b.startDate?.getTime() ?? 0;
          return aTime - bTime;
        }),
      );
    }

    return grouped;
  }, [plans]);

  // 表示する日付リスト（プランがある日のみ、日付順）
  const visibleDates = useMemo(() => {
    const dates = Array.from(plansByDate.keys())
      .map((key) => new Date(key))
      .sort((a, b) => a.getTime() - b.getTime());

    // currentDate以降の日付のみ表示
    const today = startOfDay(currentDate);
    return dates.filter((date) => date >= today);
  }, [plansByDate, currentDate]);

  const hasAnyPlans = visibleDates.length > 0;

  // スクロールコンテナへの参照を設定するコールバック
  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, []);

  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* スクロール可能なコンテンツ */}
        <div ref={setScrollRef} className="flex-1 overflow-y-auto">
          {hasAnyPlans ? (
            <div>
              {visibleDates.map((date) => {
                const dayPlans = plansByDate.get(date.toISOString()) ?? [];
                return (
                  <AgendaDayGroup
                    key={date.toISOString()}
                    date={date}
                    plans={dayPlans}
                    onPlanClick={onPlanClick}
                    onPlanContextMenu={onPlanContextMenu}
                  />
                );
              })}
            </div>
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
