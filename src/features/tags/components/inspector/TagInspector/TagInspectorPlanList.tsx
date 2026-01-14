'use client';

/**
 * TagInspector のプランリスト
 */

import { memo, useCallback } from 'react';

import { CheckCircle2, Circle, MoveUpRight } from 'lucide-react';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import type { PlanStatus } from '@/features/plans/types';
import { normalizeStatus } from '@/features/plans/utils/status';

/** プランリスト用の最小インターフェース */
interface PlanListItem {
  id: string;
  title: string;
  status: PlanStatus | string;
  due_date: string | null;
  start_time?: string | null | undefined;
  end_time?: string | null | undefined;
}

interface TagInspectorPlanListProps {
  plans: PlanListItem[];
  isLoading: boolean;
  onPlanClick: (planId: string) => void;
  onStatusToggle: (planId: string, currentStatus: string) => void;
}

export const TagInspectorPlanList = memo(function TagInspectorPlanList({
  plans,
  isLoading,
  onPlanClick,
  onStatusToggle,
}: TagInspectorPlanListProps) {
  const getFormattedDateTime = useCallback((plan: PlanListItem): string | null => {
    const parts: string[] = [];

    // Date format
    if (plan.due_date) {
      const dateStr = String(plan.due_date).split('T')[0];
      if (dateStr) {
        const dateParts = dateStr.split('-');
        const yearStr = dateParts[0];
        const monthStr = dateParts[1];
        const dayStr = dateParts[2];
        if (yearStr && monthStr && dayStr) {
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            parts.push(`${year}/${month}/${day}`);
          }
        }
      }
    }

    // Time format
    const getTimeStr = (isoString: string | null | undefined): string | null => {
      if (!isoString) return null;
      try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return null;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } catch {
        return null;
      }
    };

    const startTimeStr = getTimeStr(plan.start_time);
    const endTimeStr = getTimeStr(plan.end_time);

    if (startTimeStr && endTimeStr) {
      parts.push(`${startTimeStr}-${endTimeStr}`);
    } else if (startTimeStr) {
      parts.push(startTimeStr);
    } else if (endTimeStr) {
      parts.push(`-${endTimeStr}`);
    }

    return parts.length > 0 ? parts.join(' ') : null;
  }, []);

  return (
    <div>
      <h3 className="text-muted-foreground mb-2 flex items-center gap-1 text-sm font-medium">
        <MoveUpRight className="size-4" />
        紐づくプラン ({plans.length})
      </h3>
      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-muted-foreground py-6 text-center text-sm">
          このタグに紐づくプランはありません
        </div>
      ) : (
        <div>
          {plans.slice(0, 20).map((plan) => {
            const currentStatus = normalizeStatus(plan.status);
            const dateTime = getFormattedDateTime(plan);

            return (
              <div
                key={plan.id}
                className="hover:bg-state-hover flex w-full items-center gap-2 rounded-sm px-2 py-2 transition-colors"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusToggle(plan.id, currentStatus);
                  }}
                  className="hover:bg-state-hover shrink-0 rounded p-0.5 transition-colors"
                  aria-label={currentStatus === 'closed' ? '未完了に戻す' : '完了にする'}
                >
                  {currentStatus === 'closed' ? (
                    <CheckCircle2 className="text-success size-4" />
                  ) : (
                    <Circle className="text-muted-foreground size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onPlanClick(plan.id)}
                  className="min-w-0 flex-1 truncate text-left text-sm hover:underline"
                >
                  {plan.title}
                </button>
                {dateTime && (
                  <span className="text-muted-foreground shrink-0 text-xs">{dateTime}</span>
                )}
              </div>
            );
          })}
          {plans.length > 20 && (
            <p className="text-muted-foreground py-2 text-center text-xs">
              他 {plans.length - 20} 件
            </p>
          )}
        </div>
      )}
    </div>
  );
});
