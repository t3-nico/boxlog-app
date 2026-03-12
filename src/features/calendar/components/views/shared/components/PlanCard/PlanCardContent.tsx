/**
 * プランカードの中身（タイトル、時間等）のコンポーネント
 */

'use client';

import { Bell } from 'lucide-react';
import { memo } from 'react';

import { useTranslations } from 'next-intl';
import { RecurringIndicatorFromFlag } from '../../../../RecurringIndicator';

import { formatTimeRange } from '@/lib/date';
import type { CalendarEvent } from '../../../../../types/calendar.types';

interface PlanCardContentProps {
  plan: CalendarEvent;
  tagName: string | null;
  isCompact?: boolean;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  previewTime?: { start: Date; end: Date } | null; // ドラッグ中のプレビュー時間
}

// Helper function: Parse plan start date
function parseplanStartDate(plan: CalendarEvent): Date | null {
  // CalendarEventはstartDateを持つ
  if (plan.startDate instanceof Date) return plan.startDate;
  if (plan.startDate) return new Date(plan.startDate);
  return null;
}

// Helper function: Parse plan end date
function parseplanEndDate(plan: CalendarEvent): Date | null {
  // CalendarEventはendDateを持つ
  if (plan.endDate instanceof Date) return plan.endDate;
  if (plan.endDate) return new Date(plan.endDate);
  return null;
}

export const PlanCardContent = memo<PlanCardContentProps>(function PlanCardContent({
  plan,
  tagName,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null,
}) {
  const t = useTranslations();

  // プランの開始・終了時刻をDateオブジェクトに変換
  const planStart = parseplanStartDate(plan);
  const planEnd = parseplanEndDate(plan);

  // 表示テキスト: タグ名 or フォールバック
  const displayLabel = tagName || t('common.tags.add');

  if (isCompact) {
    // コンパクト表示：タグ名のみ
    return (
      <div className="flex h-full items-center gap-1">
        <span className="text-foreground truncate text-sm leading-tight font-normal">
          {displayLabel}
        </span>
      </div>
    );
  }

  // 通常表示：タグ名 + 時間 + アイコンの順番（優先度順）
  return (
    <div className="relative flex h-full flex-col gap-1 overflow-hidden">
      {/* タグ名（最優先） */}
      <div className="flex flex-shrink-0 items-baseline gap-1 text-sm leading-tight font-normal">
        <span className="text-foreground line-clamp-2">{displayLabel}</span>
      </div>

      {/* 時間表示 + アイコン（第2優先） */}
      {showTime != null && (
        <div className="event-time text-muted-foreground pointer-events-none flex flex-shrink-0 items-center gap-1 text-xs leading-tight">
          <span className="mr-1 tabular-nums">
            {previewTime
              ? formatTimeRange(previewTime.start, previewTime.end, timeFormat)
              : planStart && planEnd
                ? formatTimeRange(planStart, planEnd, timeFormat)
                : t('calendar.event.noTimeSet')}
          </span>
          {/* 繰り返しアイコン */}
          <RecurringIndicatorFromFlag isRecurring={plan.isRecurring} size="xs" />
          {/* 通知アイコン（reminder_minutesが設定されている場合） */}
          {plan.reminder_minutes != null && (
            <Bell className="h-3 w-3 flex-shrink-0" aria-label={t('calendar.event.reminderSet')} />
          )}
        </div>
      )}
    </div>
  );
});
