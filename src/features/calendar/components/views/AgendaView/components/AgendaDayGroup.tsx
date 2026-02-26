'use client';

import { format, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { CalendarPlan } from '../../../../types/calendar.types';

import { AgendaListItem } from './AgendaListItem';

interface AgendaDayGroupProps {
  date: Date;
  plans: CalendarPlan[];
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined;
}

/**
 * AgendaDayGroup - 日別にグループ化されたアイテムを表示
 *
 * 日付ヘッダー + その日のアイテムリスト
 */
export function AgendaDayGroup({
  date,
  plans,
  onPlanClick,
  onPlanContextMenu,
}: AgendaDayGroupProps) {
  const locale = useLocale();
  const t = useTranslations('calendar.agenda');
  const dateLocale = locale === 'ja' ? ja : undefined;

  const isCurrentDay = isToday(date);

  // 日付のフォーマット
  const formatDateHeader = (d: Date) => {
    if (isToday(d)) {
      return locale === 'ja' ? '今日' : 'Today';
    }

    // 曜日を含む日付表示
    return format(
      d,
      locale === 'ja' ? 'M月d日 (E)' : 'EEE, MMM d',
      dateLocale ? { locale: dateLocale } : undefined,
    );
  };

  return (
    <div className="border-border border-b last:border-b-0">
      {/* 日付ヘッダー */}
      <div
        className={cn('sticky top-0 z-10 px-4 py-2', 'bg-muted', isCurrentDay && 'bg-state-active')}
      >
        <h3
          className={cn(
            'text-sm font-medium',
            isCurrentDay ? 'text-state-active-foreground' : 'text-foreground',
          )}
        >
          {formatDateHeader(date)}
        </h3>
      </div>

      {/* アイテムリスト */}
      <div className="divide-border divide-y">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <AgendaListItem
              key={plan.id}
              plan={plan}
              onClick={onPlanClick}
              onContextMenu={onPlanContextMenu}
            />
          ))
        ) : (
          <div className="text-muted-foreground px-4 py-3 text-sm">{t('noItems')}</div>
        )}
      </div>
    </div>
  );
}
