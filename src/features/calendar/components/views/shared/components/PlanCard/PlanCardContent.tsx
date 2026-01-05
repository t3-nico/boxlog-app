/**
 * プランカードの中身（タイトル、時間等）のコンポーネント
 */

'use client';

import { Bell } from 'lucide-react';
import { memo } from 'react';

import { RecurringIndicatorFromFlag } from '@/features/plans/components/shared/RecurringIndicator';
import { useTranslations } from 'next-intl';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { formatTimeRange } from '../../utils/dateHelpers';

interface PlanCardContentProps {
  plan: CalendarPlan;
  isCompact?: boolean;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  previewTime?: { start: Date; end: Date } | null; // ドラッグ中のプレビュー時間
  hasCheckbox?: boolean; // チェックボックスがある場合は左パディングを追加
  isMobile?: boolean; // モバイル表示（Googleカレンダー風シンプル表示）
}

// Helper function: Parse plan start date
function parseplanStartDate(plan: CalendarPlan): Date | null {
  // CalendarPlanはstartDateを持つ
  if (plan.startDate instanceof Date) return plan.startDate;
  if (plan.startDate) return new Date(plan.startDate);
  return null;
}

// Helper function: Parse plan end date
function parseplanEndDate(plan: CalendarPlan): Date | null {
  // CalendarPlanはendDateを持つ
  if (plan.endDate instanceof Date) return plan.endDate;
  if (plan.endDate) return new Date(plan.endDate);
  return null;
}

export const PlanCardContent = memo<PlanCardContentProps>(function PlanCardContent({
  plan,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null,
  hasCheckbox = false,
  isMobile = false,
}) {
  const t = useTranslations();

  // プランの開始・終了時刻をDateオブジェクトに変換
  const planStart = parseplanStartDate(plan);
  const planEnd = parseplanEndDate(plan);

  // モバイル表示: Googleカレンダー風のシンプルな表示
  // チェックボックスの横にタイトルを1行で省略表示
  if (isMobile) {
    return (
      <span className="text-foreground min-w-0 flex-1 truncate text-xs leading-tight font-medium">
        {plan.title || t('calendar.event.noTitle')}
      </span>
    );
  }

  if (isCompact) {
    // コンパクト表示：タイトル #番号
    return (
      <div className={`flex h-full items-center gap-1 ${hasCheckbox ? 'pl-4' : ''}`}>
        <span className="text-foreground truncate text-sm leading-tight font-medium">
          {plan.title}
        </span>
        {plan.plan_number && (
          <span className="flex-shrink-0 text-sm leading-tight opacity-75">
            #{plan.plan_number}
          </span>
        )}
      </div>
    );
  }

  // 通常表示：タイトル #番号 + 時間 + アイコン + タグの順番（優先度順）
  return (
    <div
      className={`relative flex h-full flex-col gap-0.5 overflow-hidden ${hasCheckbox ? 'pl-6' : ''}`}
    >
      {/* タイトル（最優先） */}
      <div className="flex flex-shrink-0 items-baseline gap-1 text-sm leading-tight font-medium">
        <span className={`${isCompact ? 'line-clamp-1' : 'line-clamp-2'} text-foreground`}>
          {plan.title}
        </span>
        {plan.plan_number && (
          <span className="flex-shrink-0 text-sm leading-tight opacity-75">
            #{plan.plan_number}
          </span>
        )}
      </div>

      {/* 時間表示 + アイコン（第2優先） */}
      {showTime != null && (
        <div className="event-time pointer-events-none flex flex-shrink-0 items-center gap-1 text-xs leading-tight opacity-75">
          <span>
            {previewTime
              ? formatTimeRange(previewTime.start, previewTime.end, timeFormat)
              : planStart && planEnd
                ? formatTimeRange(planStart, planEnd, timeFormat)
                : t('calendar.event.noTimeSet')}
          </span>
          {/* 繰り返しアイコン */}
          <RecurringIndicatorFromFlag
            isRecurring={plan.isRecurring}
            size="xs"
            className="opacity-75"
          />
          {/* 通知アイコン（reminder_minutesが設定されている場合） */}
          {plan.reminder_minutes != null && <Bell className="h-3 w-3 flex-shrink-0 opacity-75" />}
        </div>
      )}

      {/* タグ表示（残りスペースがあれば表示） */}
      {plan.tags && plan.tags.length > 0 ? (
        <div className="flex min-h-0 flex-shrink flex-wrap gap-1 overflow-hidden pt-1">
          {plan.tags
            .slice(0, 2)
            .map(
              (tag: {
                id: string;
                name: string;
                color: string;
                icon?: string | undefined;
                parent_id?: string | undefined;
              }) => (
                <span
                  key={tag.id}
                  className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 text-xs leading-tight"
                  style={{
                    borderColor: tag.color || undefined,
                  }}
                  title={tag.name}
                >
                  {tag.icon && (
                    <span className="flex-shrink-0" style={{ color: tag.color || undefined }}>
                      {tag.icon}
                    </span>
                  )}
                  <span
                    className="flex-shrink-0 font-medium"
                    style={{ color: tag.color || undefined }}
                  >
                    #
                  </span>
                  <span className="truncate">{tag.name}</span>
                </span>
              ),
            )}
          {plan.tags.length > 2 && (
            <span className="inline-flex items-center px-1 text-xs opacity-75">
              +{plan.tags.length - 2}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
});
