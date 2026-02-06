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
import { TagsContainer } from './TagsContainer';

/** プレビューモード設定（ドラッグ選択時の簡略表示） */
interface PreviewMode {
  /** 時間幅テキスト（例: "1時間30分"） */
  durationText: string;
}

interface PlanCardContentProps {
  plan: CalendarPlan;
  isCompact?: boolean;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  previewTime?: { start: Date; end: Date } | null; // ドラッグ中のプレビュー時間
  hasCheckbox?: boolean; // チェックボックスがある場合は左パディングを追加
  isMobile?: boolean; // モバイル表示（Googleカレンダー風シンプル表示）
  /** プレビューモード（ドラッグ選択時の簡略表示、タグ・アイコン非表示） */
  previewMode?: PreviewMode;
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
  previewMode,
}) {
  const t = useTranslations();

  // プランの開始・終了時刻をDateオブジェクトに変換
  const planStart = parseplanStartDate(plan);
  const planEnd = parseplanEndDate(plan);

  // モバイル表示: Googleカレンダー風のシンプルな表示
  // チェックボックスの横にタイトルを1行で省略表示
  if (isMobile) {
    return (
      <span className={`text-foreground min-w-0 flex-1 truncate text-xs leading-tight font-normal`}>
        {plan.title || t('calendar.event.noTitle')}
      </span>
    );
  }

  if (isCompact) {
    // コンパクト表示：タイトルのみ
    return (
      <div className={`flex h-full items-center gap-1 ${hasCheckbox ? 'pl-4' : ''}`}>
        <span className={`text-foreground truncate text-sm leading-tight font-normal`}>
          {plan.title || t('calendar.event.noTitle')}
        </span>
      </div>
    );
  }

  // 通常表示：タイトル #番号 + 時間 + アイコン + タグの順番（優先度順）
  return (
    <div
      className={`relative flex h-full flex-col gap-1 overflow-hidden ${hasCheckbox ? 'pl-6' : ''}`}
    >
      {/* タイトル（最優先） */}
      <div className="flex flex-shrink-0 items-baseline gap-1 text-sm leading-tight font-normal">
        <span className={`${isCompact ? 'line-clamp-1' : 'line-clamp-2'} text-foreground`}>
          {plan.title || t('calendar.event.noTitle')}
        </span>
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
          {/* プレビューモード時はアイコン非表示 */}
          {!previewMode && (
            <>
              {/* 繰り返しアイコン */}
              <RecurringIndicatorFromFlag isRecurring={plan.isRecurring} size="xs" />
              {/* 通知アイコン（reminder_minutesが設定されている場合） */}
              {plan.reminder_minutes != null && (
                <Bell
                  className="h-3 w-3 flex-shrink-0"
                  aria-label={t('calendar.event.reminderSet')}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* 時間幅表示（プレビューモード時のみ） */}
      {previewMode && (
        <div className="text-muted-foreground mt-auto text-xs tabular-nums opacity-60">
          {previewMode.durationText}
        </div>
      )}

      {/* タグ表示（横幅いっぱいに表示、入りきらないものは+Nで表示、プレビューモード時は非表示） */}
      {!previewMode && plan.tagIds && plan.tagIds.length > 0 && (
        <TagsContainer tagIds={plan.tagIds} />
      )}
    </div>
  );
});
