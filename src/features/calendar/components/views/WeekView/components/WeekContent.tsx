'use client';

import React, { useCallback } from 'react';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { cn } from '@/lib/utils';

import { useCollapsedSectionsContext } from '../../../../contexts/CollapsedSectionsContext';
import {
  calculatePlanGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  PlanBlock,
  useGlobalDragCursor,
  usePlanStyles,
} from '../../shared';
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants';
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop';
import type { WeekPlanPosition } from '../WeekView.types';

// 折りたたみセクション用のグリッド生成
function generateCollapsedTimeGrid(
  sections: {
    type: 'normal' | 'collapsed';
    startHour: number;
    endHour: number;
    heightPx: number;
  }[],
  hourHeight: number,
) {
  const elements: React.ReactNode[] = [];

  sections.forEach((section, sectionIndex) => {
    if (section.type === 'collapsed') {
      // 折りたたみセクション: 1つのdivで表現
      elements.push(
        <div
          key={`collapsed-${section.startHour}`}
          className="border-border bg-surface-container/30 relative border-b"
          style={{ height: section.heightPx }}
        />,
      );
    } else {
      // 通常セクション: 時間ごとにdivを生成
      for (let hour = section.startHour; hour < section.endHour; hour++) {
        const isLastInSection = hour === section.endHour - 1;
        const isLastSection = sectionIndex === sections.length - 1;
        const showBorder = !(isLastInSection && isLastSection);

        elements.push(
          <div
            key={`hour-${hour}`}
            className={`relative ${showBorder ? 'border-border border-b' : ''}`}
            style={{ height: hourHeight }}
          />,
        );
      }
    }
  });

  return elements;
}

interface WeekContentProps {
  date: Date;
  plans: CalendarPlan[];
  /** 重複チェック用の全イベント（週全体のイベント） */
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  planPositions: WeekPlanPosition[];
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined;
  onEmptyClick?: ((date: Date, timeString: string) => void) | undefined;
  onPlanUpdate?: ((planId: string, updates: Partial<CalendarPlan>) => void) | undefined;
  onTimeRangeSelect?: ((selection: import('../../shared').DateTimeSelection) => void) | undefined;
  className?: string | undefined;
  dayIndex: number; // 週内での日付インデックス（0-6）
  displayDates?: Date[] | undefined; // 週の全日付配列（日付間移動用）
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;
}

export const WeekContent = ({
  date,
  plans,
  allEventsForOverlapCheck,
  planPositions,
  onPlanClick,
  onPlanContextMenu,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
  dayIndex,
  displayDates,
  disabledPlanId,
}: WeekContentProps) => {
  // Inspectorで開いているプランのIDを取得
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const isInspectorOpen = usePlanInspectorStore((state) => state.isOpen);

  // 折りたたみセクションのコンテキストを取得
  const collapsedContext = useCollapsedSectionsContext();
  const hasCollapsedSections = collapsedContext?.hasCollapsedSections ?? false;
  const gridHeight =
    hasCollapsedSections && collapsedContext ? collapsedContext.totalHeight : 24 * HOUR_HEIGHT;

  // グローバルドラッグ状態（日付間移動用）
  const globalDragState = useCalendarDragStore();
  const isGlobalDragging = globalDragState.isDragging;
  const globalDraggedPlan = globalDragState.draggedPlan;
  const globalTargetDateIndex = globalDragState.targetDateIndex;
  const globalOriginalDateIndex = globalDragState.originalDateIndex;

  // ドラッグ&ドロップ機能用にonPlanUpdateを変換
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return;

      // handleUpdatePlan形式で呼び出し
      await onPlanUpdate(planId, {
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
    viewMode: 'week',
    disabledPlanId,
  });

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers);

  // この日のプラン位置を統一方式で変換
  const dayPlanPositions = React.useMemo(() => {
    // planPositionsから該当dayIndexのプランを抽出（統一フィルタリング済み）
    return planPositions
      .filter((pos) => pos.dayIndex === dayIndex)
      .map((pos) => ({
        plan: pos.plan,
        top: pos.top,
        height: pos.height,
        left: 2, // 列内での位置（px）
        width: 96, // 列幅の96%使用
        zIndex: pos.zIndex,
        column: pos.column,
        totalColumns: pos.totalColumns,
        opacity: 1.0,
      }));
  }, [planPositions, dayIndex]);

  const planStyles = usePlanStyles(dayPlanPositions);

  // 折りたたみを考慮したプランスタイルを再計算
  const adjustedPlanStyles = React.useMemo(() => {
    if (!hasCollapsedSections || !collapsedContext) {
      return planStyles;
    }

    const adjusted: Record<string, React.CSSProperties> = {};
    for (const plan of plans) {
      const originalStyle = planStyles[plan.id];
      if (!originalStyle) continue;

      // 折りたたみを考慮した位置を計算（文字列の場合はDate変換）
      const startDate = plan.startDate ? new Date(plan.startDate) : new Date();
      const endDate = plan.endDate ? new Date(plan.endDate) : new Date();
      const top = collapsedContext.timeToPixels(startDate);
      const bottom = collapsedContext.timeToPixels(endDate);
      const height = Math.max(bottom - top, 20);

      adjusted[plan.id] = {
        ...originalStyle,
        top,
        height,
      };
    }
    return adjusted;
  }, [hasCollapsedSections, collapsedContext, planStyles, plans]);

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

  // 時間グリッドの生成（折りたたみ対応）
  const timeGrid = React.useMemo(() => {
    if (hasCollapsedSections && collapsedContext?.sections) {
      return generateCollapsedTimeGrid(collapsedContext.sections, HOUR_HEIGHT);
    }
    // 通常の24時間グリッド
    return Array.from({ length: 24 }, (_, hour) => (
      <div
        key={hour}
        className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
        style={{ height: HOUR_HEIGHT }}
      />
    ));
  }, [hasCollapsedSections, collapsedContext?.sections]);

  return (
    <div
      className={cn(
        'bg-background relative h-full flex-1',
        dragState.isDragging ? 'overflow-visible' : 'overflow-hidden',
        className,
      )}
      data-calendar-grid
    >
      {/* CalendarDragSelectionを使用（ドラッグ操作のみでプラン作成） */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0 z-10"
        onTimeRangeSelect={(selection) => {
          // DayViewと同じように直接DateTimeSelectionを渡す
          onTimeRangeSelect?.(selection);
        }}
        disabled={dragState.isPending || dragState.isDragging || dragState.isResizing}
        plans={allEventsForOverlapCheck ?? plans}
      >
        {/* 背景グリッド（折りたたみ対応） */}
        <div className="absolute inset-0" style={{ height: gridHeight }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* プラン表示エリア - CalendarDragSelectionより上にz-indexを設定 */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{ height: gridHeight }}>
        {/* 通常のプラン表示 */}
        {plans.map((plan) => {
          const style = adjustedPlanStyles[plan.id];
          if (!style) return null;

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging;

          // 日付間移動中のプランは元のカラムで非表示（ゴースト要素がカーソルに追従）
          // ただし、同じカラム内での移動は表示を維持
          const isMovingToOtherDate =
            isGlobalDragging &&
            globalDraggedPlan?.id === plan.id &&
            globalTargetDateIndex !== globalOriginalDateIndex;

          // ドラッグ中のプラン表示制御
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
              {/* PlanBlockの内容部分のみクリック可能 */}
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
                <PlanBlock
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
