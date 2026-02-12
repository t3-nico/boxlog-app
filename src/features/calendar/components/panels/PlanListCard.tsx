'use client';

import { memo, useCallback } from 'react';

import { CheckCircle2, Circle, ClipboardList, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HoverTooltip } from '@/components/ui/tooltip';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import type { PlanStatus } from '@/features/plans/types/plan';
import { normalizeStatus } from '@/features/plans/utils/status';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import type { PlanWithTags } from '@/server/services/plans/types';

import { TagsContainer } from '../views/shared/components/PlanCard/TagsContainer';

interface PlanListCardProps {
  plan: PlanWithTags;
  /** 期限切れ状態（時間・日時を赤文字で表示） */
  isOverdue?: boolean;
  onClick?: (plan: PlanWithTags) => void;
  onDragStart?: (plan: PlanWithTags, e: React.MouseEvent, sourceElement: HTMLElement) => void;
  /** Plan→Record 変換ハンドラ（hover時にボタン表示） */
  onCreateRecord?: (plan: PlanWithTags) => void;
}

/**
 * サイドパネル用のPlanカード
 *
 * カレンダーTimeGridのPlanCardと同じビジュアル（チェックボックス+タイトル+時間）
 * position/drag/resizeは不要なシンプル版
 */
export const PlanListCard = memo<PlanListCardProps>(function PlanListCard({
  plan,
  isOverdue = false,
  onClick,
  onDragStart,
  onCreateRecord,
}) {
  const t = useTranslations('calendar');
  const { formatTime, formatDate } = useDateFormat();
  const { updatePlan } = usePlanMutations();

  const status = normalizeStatus(plan.status as PlanStatus);
  const isCompleted = status === 'closed';

  // 時間表示（未スケジュールの場合は非表示）
  const startTime = plan.start_time ? formatTime(new Date(plan.start_time)) : '';
  const endTime = plan.end_time ? formatTime(new Date(plan.end_time)) : '';
  const displayTime = startTime && endTime ? `${startTime} - ${endTime}` : startTime || null;

  // 期限日表示
  const displayDueDate = plan.due_date ? formatDate(new Date(plan.due_date)) : null;

  // 作業時間（分）を start_time/end_time から算出
  const durationMinutes =
    plan.start_time && plan.end_time
      ? Math.round(
          (new Date(plan.end_time).getTime() - new Date(plan.start_time).getTime()) / 60000,
        )
      : 0;

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

  const handleCreateRecord = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCreateRecord?.(plan);
    },
    [onCreateRecord, plan],
  );

  return (
    <Card
      className={cn(
        // レイアウト
        'group relative flex flex-row items-start gap-2 px-3 py-2',
        // 背景（カレンダー PlanCard と統一）
        'bg-plan-box',
        // Card デフォルト打ち消し
        'rounded-xl border-0 shadow-none',
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
      role="button"
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
            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
        >
          {plan.title || t('event.noTitle')}
        </p>

        {/* メタ情報行: 期限日 + 時間 + 作業時間 */}
        {(displayDueDate || displayTime || durationMinutes > 0) && (
          <div className={cn('mt-1 flex items-center gap-2', isCompleted && 'line-through')}>
            {displayDueDate && (
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
                {displayDueDate}
              </span>
            )}
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
            {durationMinutes > 0 && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs',
                  isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground',
                )}
              >
                <Clock className="size-3" />
                {t('panel.duration', { minutes: durationMinutes })}
              </span>
            )}
          </div>
        )}

        {/* タグ（カレンダーPlanCardと同じTagsContainer） */}
        {plan.tagIds && plan.tagIds.length > 0 && <TagsContainer tagIds={plan.tagIds} />}
      </div>

      {/* Record 変換ボタン（hover時のみ表示） */}
      {onCreateRecord && (
        <div className="z-10 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <HoverTooltip content={t('panel.recordThis')} side="top">
            <Button
              variant="ghost"
              size="sm"
              icon
              onClick={handleCreateRecord}
              aria-label={t('panel.recordThis')}
            >
              <ClipboardList className="size-3.5" />
            </Button>
          </HoverTooltip>
        </div>
      )}
    </Card>
  );
});
