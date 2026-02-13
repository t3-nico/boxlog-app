'use client';

import { useCallback, useRef } from 'react';

import { addDays, startOfWeek } from 'date-fns';

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import type { PlanWithTags } from '@/server/services/plans/types';

import {
  calculatePreviewHeight,
  calculateTimeFromGridPosition,
  cleanupGhost,
  createPanelDragGhost,
  DEFAULT_DURATION_MS,
  findCalendarGridUnderMouse,
  updateGhostPosition,
} from '../components/panels/utils/panelDragUtils';
import { useCalendarNavigation } from '../contexts/CalendarNavigationContext';
import { useCalendarDragStore } from '../stores/useCalendarDragStore';
import type { CalendarViewType } from '../types/calendar.types';

/** ドラッグ開始判定の閾値 (px) */
const DRAG_THRESHOLD = 5;

/** ドラッグ中の内部状態 */
interface DragData {
  plan: PlanWithTags;
  startX: number;
  startY: number;
  hasMoved: boolean;
  ghost: HTMLElement | null;
  sourceElement: HTMLElement | null;
}

/**
 * viewType と currentDate から表示日付の配列を計算
 */
function getDisplayDates(viewType: CalendarViewType, currentDate: Date): Date[] {
  switch (viewType) {
    case 'day':
      return [currentDate];
    case '3day':
      return [currentDate, addDays(currentDate, 1), addDays(currentDate, 2)];
    case '5day':
      return Array.from({ length: 5 }, (_, i) => addDays(currentDate, i));
    case 'week': {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }
    default:
      return [currentDate];
  }
}

/**
 * サイドパネルからカレンダーへのドラッグ＆ドロップフック
 *
 * PlanListCard をドラッグしてカレンダー TimeGrid にドロップし、
 * start_time / end_time を設定する
 */
export function usePanelDrag() {
  const navigation = useCalendarNavigation();
  const { updatePlan } = usePlanMutations();

  const startPanelDrag = useCalendarDragStore((s) => s.startPanelDrag);
  const updateDrag = useCalendarDragStore((s) => s.updateDrag);
  const endDrag = useCalendarDragStore((s) => s.endDrag);

  const dragDataRef = useRef<DragData | null>(null);
  const isPanelDraggingRef = useRef(false);

  // イベントリスナーを ref に保存して circular dependency を回避
  const handlersRef = useRef<{
    move: ((e: MouseEvent) => void) | null;
    up: ((e: MouseEvent) => void) | null;
    key: ((e: KeyboardEvent) => void) | null;
  }>({ move: null, up: null, key: null });

  /** 全リスナー解除 + 共通クリーンアップ */
  const cleanup = useCallback(() => {
    const h = handlersRef.current;
    if (h.move) document.removeEventListener('mousemove', h.move);
    if (h.up) document.removeEventListener('mouseup', h.up);
    if (h.key) document.removeEventListener('keydown', h.key);

    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    const data = dragDataRef.current;
    if (data) {
      cleanupGhost(data.ghost);
    }

    endDrag();
    dragDataRef.current = null;
    isPanelDraggingRef.current = false;
  }, [endDrag]);

  // --- マウスイベントハンドラ ---

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const data = dragDataRef.current;
      if (!data) return;

      const deltaX = e.clientX - data.startX;
      const deltaY = e.clientY - data.startY;

      // 5px 閾値チェック
      if (!data.hasMoved) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD && Math.abs(deltaY) < DRAG_THRESHOLD) {
          return;
        }
        // ドラッグ開始
        data.hasMoved = true;
        isPanelDraggingRef.current = true;

        // ゴースト作成
        if (data.sourceElement) {
          data.ghost = createPanelDragGhost(data.sourceElement);
        }

        // ストア更新
        startPanelDrag(data.plan);

        // カーソル変更
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }

      // ゴースト位置更新
      if (data.ghost) {
        updateGhostPosition(data.ghost, e.clientX, e.clientY);
      }

      // カレンダーグリッド検出
      const gridInfo = findCalendarGridUnderMouse(e.clientX, e.clientY);

      if (gridInfo && navigation) {
        const displayDates = getDisplayDates(navigation.viewType, navigation.currentDate);
        const { hour, minute, snappedTop } = calculateTimeFromGridPosition(gridInfo, e.clientY);
        const targetDate = displayDates[gridInfo.dayIndex] ?? displayDates[0]!;

        const startTime = new Date(targetDate);
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime.getTime() + DEFAULT_DURATION_MS);

        updateDrag({
          targetDateIndex: gridInfo.dayIndex,
          previewTime: { start: startTime, end: endTime },
          snappedPosition: { top: snappedTop, height: calculatePreviewHeight() },
        });
      } else {
        // グリッド外 → プレビューをクリア
        updateDrag({
          targetDateIndex: -1,
          previewTime: null,
          snappedPosition: null,
        });
      }
    },
    [navigation, startPanelDrag, updateDrag],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const data = dragDataRef.current;
      if (!data) return;

      if (!data.hasMoved) {
        // 移動していない → クリック扱い
        cleanup();
        return;
      }

      // カレンダーグリッド上でドロップ？
      const gridInfo = findCalendarGridUnderMouse(e.clientX, e.clientY);

      if (gridInfo && navigation) {
        const displayDates = getDisplayDates(navigation.viewType, navigation.currentDate);
        const { hour, minute } = calculateTimeFromGridPosition(gridInfo, e.clientY);
        const targetDate = displayDates[gridInfo.dayIndex] ?? displayDates[0]!;

        const startTime = new Date(targetDate);
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime.getTime() + DEFAULT_DURATION_MS);

        // mutation: Plan に時間を設定
        updatePlan.mutate({
          id: data.plan.id,
          data: {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          },
        });
      }
      // グリッド外ドロップ → キャンセル（何もしない）

      cleanup();
    },
    [cleanup, navigation, updatePlan],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
      }
    },
    [cleanup],
  );

  // --- 公開API ---

  const handleDragStart = useCallback(
    (plan: PlanWithTags, e: React.MouseEvent, sourceElement: HTMLElement) => {
      // 初期化
      dragDataRef.current = {
        plan,
        startX: e.clientX,
        startY: e.clientY,
        hasMoved: false,
        ghost: null,
        sourceElement,
      };

      // ref にハンドラを保存
      handlersRef.current = {
        move: handleMouseMove,
        up: handleMouseUp,
        key: handleKeyDown,
      };

      // グローバルイベントリスナー登録
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('keydown', handleKeyDown);
    },
    [handleMouseMove, handleMouseUp, handleKeyDown],
  );

  return { handleDragStart };
}
