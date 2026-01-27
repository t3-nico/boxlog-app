'use client';

import React, { useCallback } from 'react';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { cn } from '@/lib/utils';

import {
  calculatePlanGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  type DateTimeSelection,
  PlanCard,
  useGlobalDragCursor,
} from '../../shared';
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants';
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop';

interface FiveDayContentProps {
  date: Date;
  plans: CalendarPlan[];
  /** 重複チェック用の全イベント（5日間全体のイベント） */
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  planStyles: Record<string, React.CSSProperties>;
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined;
  onEmptyClick?: ((date: Date, timeString: string) => void) | undefined;
  onPlanUpdate?: ((planId: string, updates: Partial<CalendarPlan>) => void) | undefined;
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  /** 空き領域の右クリックハンドラー */
  onEmptyAreaContextMenu?:
    | ((date: Date, hour: number, minute: number, e: React.MouseEvent) => void)
    | undefined;
  className?: string | undefined;
  dayIndex: number; // 5日間内での日付インデックス（0-4）
  displayDates?: Date[] | undefined; // 5日間の全日付配列（日付間移動用）
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;
}

export const FiveDayContent = ({
  date,
  plans,
  allEventsForOverlapCheck,
  planStyles,
  onPlanClick,
  onPlanContextMenu,
  onPlanUpdate,
  onTimeRangeSelect,
  onEmptyAreaContextMenu,
  className,
  dayIndex,
  displayDates,
  disabledPlanId,
}: FiveDayContentProps) => {
  // Inspectorで開いているプランのIDを取得
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const isInspectorOpen = usePlanInspectorStore((state) => state.isOpen);

  // グリッド高さ
  const gridHeight = 24 * HOUR_HEIGHT;

  // グローバルドラッグ状態（日付間移動用）
  // セレクター形式で必要な値のみ取得（不要な再レンダリングを防止）
  const isGlobalDragging = useCalendarDragStore((s) => s.isDragging);
  const globalDraggedPlan = useCalendarDragStore((s) => s.draggedPlan);
  const globalTargetDateIndex = useCalendarDragStore((s) => s.targetDateIndex);
  const globalOriginalDateIndex = useCalendarDragStore((s) => s.originalDateIndex);

  // ドラッグ&ドロップ機能用にonPlanUpdateを変換
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return;

      // handleUpdatePlan形式で呼び出し（返り値を伝播）
      return await onPlanUpdate(planId, {
        startDate: updates.startTime,
        endDate: updates.endTime,
      });
    },
    [onPlanUpdate],
  );

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: handlePlanUpdate,
    onPlanClick,
    date,
    events: plans,
    allEventsForOverlapCheck,
    displayDates,
    viewMode: '5day',
    disabledPlanId,
  });

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers);

  // プラン右クリックハンドラー
  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      // ドラッグ操作中またはリサイズ操作中は右クリックを無視
      if (dragState.isDragging || dragState.isResizing) {
        return;
      }
      onPlanContextMenu?.(plan, mouseEvent);
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing],
  );

  // 時間グリッドの生成
  const timeGrid = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
          style={{ height: HOUR_HEIGHT }}
        />
      )),
    [],
  );

  return (
    <div
      className={cn('bg-background relative h-full flex-1 overflow-hidden', className)}
      data-calendar-grid
    >
      {/* CalendarDragSelectionを使用（ドラッグ操作のみでプラン作成） */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onContextMenu={onEmptyAreaContextMenu}
        disabled={dragState.isPending || dragState.isDragging || dragState.isResizing}
        plans={allEventsForOverlapCheck ?? plans}
      >
        {/* 背景グリッド */}
        <div className="absolute inset-0" style={{ height: gridHeight }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* プラン表示エリア - CalendarDragSelectionより上にz-indexを設定 */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{ height: gridHeight }}>
        {plans.map((plan) => {
          const style = planStyles[plan.id];
          if (!style) return null;

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging;

          // 日付間移動中のプランは元のカラムで半透明に（ゴースト要素がカーソルに追従）
          const isMovingToOtherDate =
            isGlobalDragging &&
            globalDraggedPlan?.id === plan.id &&
            globalTargetDateIndex !== globalOriginalDateIndex;

          const isResizingThis = dragState.isResizing && dragState.draggedEventId === plan.id;
          const currentTop = parseFloat(style.top?.toString() || '0');
          const currentHeight = parseFloat(style.height?.toString() || '20');

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculatePlanGhostStyle(style, plan.id, dragState);

          // 他の日付に移動中は元のプランを半透明に
          const finalStyle = isMovingToOtherDate
            ? { ...adjustedStyle, opacity: 0.3 }
            : adjustedStyle;

          return (
            <div
              key={plan.id}
              style={finalStyle}
              className="pointer-events-none absolute"
              data-plan-block="true"
            >
              {/* PlanCardの内容部分のみクリック可能 */}
              <div
                className="focus:ring-ring pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-offset-1 focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Drag plan: ${plan.title}`}
                data-plan-block="true"
                onMouseDown={(e) => {
                  // 左クリックのみドラッグ開始
                  if (e.button === 0) {
                    handlers.handleMouseDown(
                      plan.id,
                      e,
                      {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      },
                      dayIndex,
                    ); // 日付インデックスを渡す
                  }
                }}
                onTouchStart={(e) => {
                  // モバイル: タッチでドラッグ開始（長押しで開始）
                  handlers.handleTouchStart(
                    plan.id,
                    e,
                    {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    },
                    dayIndex,
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // キーボードでドラッグ操作を開始する代替手段
                  }
                }}
              >
                <PlanCard
                  plan={plan}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height:
                      isResizingThis && dragState.snappedPosition
                        ? (dragState.snappedPosition.height ?? currentHeight)
                        : currentHeight,
                  }}
                  // クリックは useDragAndDrop で処理されるため削除
                  onContextMenu={(plan: CalendarPlan, e: React.MouseEvent) =>
                    handlePlanContextMenu(plan, e)
                  }
                  onResizeStart={(
                    plan: CalendarPlan,
                    direction: 'top' | 'bottom',
                    e: React.MouseEvent,
                    _position: { top: number; left: number; width: number; height: number },
                  ) =>
                    handlers.handleResizeStart(plan.id, direction, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  isActive={isInspectorOpen && inspectorPlanId === plan.id}
                  previewTime={calculatePreviewTime(plan.id, dragState)}
                  className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
