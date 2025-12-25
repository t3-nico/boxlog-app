import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { create } from 'zustand';

/**
 * カレンダーのドラッグ状態を管理するストア
 *
 * 日付間ドラッグ移動をサポートするため、
 * 複数のコンテンツコンポーネント（WeekContent等）で
 * ドラッグ状態を共有する
 */

export interface CalendarDragState {
  /** ドラッグ中のプランID */
  draggedPlanId: string | null;
  /** ドラッグ中のプランデータ（表示用） */
  draggedPlan: CalendarPlan | null;
  /** 元の日付インデックス */
  originalDateIndex: number;
  /** 現在のターゲット日付インデックス */
  targetDateIndex: number;
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** プレビュー時間 */
  previewTime: { start: Date; end: Date } | null;
  /** スナップされた位置（top, height） */
  snappedPosition: { top: number; height?: number } | null;
}

interface CalendarDragActions {
  /** ドラッグ開始 */
  startDrag: (planId: string, plan: CalendarPlan, dateIndex: number) => void;
  /** ドラッグ中の状態更新 */
  updateDrag: (updates: Partial<Omit<CalendarDragState, 'draggedPlanId' | 'draggedPlan'>>) => void;
  /** ドラッグ終了 */
  endDrag: () => void;
  /** ターゲット日付インデックスを更新 */
  setTargetDateIndex: (index: number) => void;
  /** プレビュー時間を更新 */
  setPreviewTime: (time: { start: Date; end: Date } | null) => void;
}

const initialState: CalendarDragState = {
  draggedPlanId: null,
  draggedPlan: null,
  originalDateIndex: 0,
  targetDateIndex: 0,
  isDragging: false,
  previewTime: null,
  snappedPosition: null,
};

export const useCalendarDragStore = create<CalendarDragState & CalendarDragActions>((set) => ({
  ...initialState,

  startDrag: (planId, plan, dateIndex) =>
    set({
      draggedPlanId: planId,
      draggedPlan: plan,
      originalDateIndex: dateIndex,
      targetDateIndex: dateIndex,
      isDragging: true,
      previewTime: null,
      snappedPosition: null,
    }),

  updateDrag: (updates) =>
    set((state) => ({
      ...state,
      ...updates,
    })),

  endDrag: () => set(initialState),

  setTargetDateIndex: (index) =>
    set((state) => ({
      ...state,
      targetDateIndex: index,
    })),

  setPreviewTime: (time) =>
    set((state) => ({
      ...state,
      previewTime: time,
    })),
}));
