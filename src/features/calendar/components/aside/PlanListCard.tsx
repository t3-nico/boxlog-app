'use client';

import { memo, useCallback } from 'react';

import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import type { PlanStatus } from '@/core/types/plan';
import { useDateFormat } from '@/hooks/useDateFormat';
import { usePlanMutations } from '@/hooks/usePlanMutations';
import { normalizeStatus } from '@/lib/plan-status';
import { cn } from '@/lib/utils';
import type { PlanWithTags } from '@/server/services/plans/types';

import { TagsContainer } from '../views/shared/components/PlanCard/TagsContainer';

interface PlanListCardProps {
  plan: PlanWithTags;
  /** 期限切れ状態（時間・日時を赤文字で表示） */
  isOverdue?: boolean;
  onClick?: (plan: PlanWithTags) => void;
  onDragStart?: (plan: PlanWithTags, e: React.MouseEvent, sourceElement: HTMLElement) => void;
}

/**
 * アサイド用のPlanカード
 *
 * - 透明背景 + フラットなリスト表示（角丸なし）
 * - ホバー領域は左右8pxの余白を確保（-mx-1で親paddingに食い込み）
 * - チェックボックス + タイトル + 時間
 * - D&D なし → cursor-pointer 固定
 */
export const PlanListCard = memo<PlanListCardProps>(function PlanListCard({
  plan,
  isOverdue = false,
  onClick,
  onDragStart,
}) {
  const t = useTranslations('calendar');
  const { formatTime } = useDateFormat();
  const { updatePlan } = usePlanMutations();

  const status = normalizeStatus(plan.status as PlanStatus);
  const isCompleted = status === 'closed';

  // 時間表示（未スケジュールの場合は非表示）
  const startTime = plan.start_time ? formatTime(new Date(plan.start_time)) : '';
  const endTime = plan.end_time ? formatTime(new Date(plan.end_time)) : '';
  const displayTime = startTime && endTime ? `${startTime} - ${endTime}` : startTime || null;

  // 作業時間（分）
  const durationMinutes =
    plan.start_time && plan.end_time
      ? Math.round(
          (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) / 60000,
        )
      : null;
  const displayDuration =
    durationMinutes && durationMinutes > 0
      ? durationMinutes >= 60
        ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''}`
        : `${durationMinutes}m`
      : null;

  const handleCardClick = useCallback(() => {
    onClick?.(plan);
  }, [onClick, plan]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 左クリックのみ
      if (e.button !== 0) return;
      const sourceElement = e.currentTarget as HTMLElement;
      onDragStart?.(plan, e, sourceElement);
    },
    [onDragStart, plan],
  );

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus = isCompleted ? 'open' : 'closed';
      updatePlan.mutate({
        id: plan.id,
        data: { status: newStatus },
      });
    },
    [isCompleted, plan.id, updatePlan],
  );

  return (
    <Card
      className={cn(
        // レイアウト（-mx-1 で親paddingに少し食い込み、左右8pxの余白を確保）
        'group relative -mx-1 flex flex-row items-start gap-2 px-2 py-2',
        // 背景なし（フラットなリスト表示）
        'bg-transparent',
        // Card デフォルト打ち消し
        'rounded-none border-0 shadow-none',
        // ホバー（オーバーレイ方式: bg-plan-box を保ちつつ暗くする）
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors',
        'hover:after:bg-state-hover',
        // トランジション
        'transition-colors duration-150',
        // フォーカス
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        // カーソル
        onDragStart ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
      )}
      onClick={handleCardClick}
      onMouseDown={onDragStart ? handleMouseDown : undefined}
      tabIndex={0}
    >
      {/* チェックボックス */}
      <button
        type="button"
        onClick={handleCheckboxClick}
        className={cn(
          'group/checkbox flex-shrink-0',
          'flex h-5 w-5 items-center justify-center',
          'focus-visible:ring-primary rounded focus-visible:ring-2 focus-visible:outline-none',
        )}
        aria-label={isCompleted ? t('event.markIncomplete') : t('event.markComplete')}
      >
        {isCompleted ? (
          <CheckCircle2 className="text-success h-4 w-4" />
        ) : (
          <>
            <Circle className="text-muted-foreground h-4 w-4 group-hover/checkbox:hidden" />
            <CheckCircle2 className="text-success hidden h-4 w-4 group-hover/checkbox:block" />
          </>
        )}
      </button>

      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        {/* タイトル */}
        <p
          className={cn(
            'line-clamp-2 text-sm leading-tight font-normal',
            isCompleted ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {plan.title || t('event.noTitle')}
        </p>

        {/* メタ情報行: 時間 + 作業時間 */}
        {displayTime && (
          <div className="mt-1 flex items-center gap-2">
            {displayTime && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isOverdue
                    ? 'text-destructive'
                    : isCompleted
                      ? 'text-muted-foreground/60'
                      : 'text-muted-foreground',
                )}
              >
                {displayTime}
              </span>
            )}
            {displayDuration && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground',
                )}
              >
                {displayDuration}
              </span>
            )}
          </div>
        )}

        {/* タグ（カレンダーPlanCardと同じTagsContainer） */}
        {plan.tagIds && plan.tagIds.length > 0 && <TagsContainer tagIds={plan.tagIds} />}
      </div>
    </Card>
  );
});
