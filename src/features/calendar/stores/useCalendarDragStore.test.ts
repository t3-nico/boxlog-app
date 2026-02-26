import { beforeEach, describe, expect, it } from 'vitest';

import type { PlanWithTags } from '@/server/services/plans/types';
import type { CalendarPlan } from '../types/calendar.types';

import { useCalendarDragStore } from './useCalendarDragStore';

const mockCalendarPlan: CalendarPlan = {
  id: 'plan-1',
  title: 'テストプラン',
  startDate: new Date('2026-02-21T10:00:00'),
  endDate: new Date('2026-02-21T11:00:00'),
  status: 'open',
  color: '#3b82f6',
  createdAt: new Date(),
  updatedAt: new Date(),
  displayStartDate: new Date('2026-02-21T10:00:00'),
  displayEndDate: new Date('2026-02-21T11:00:00'),
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
};

const mockPlanWithTags = {
  id: 'plan-2',
  title: 'パネルプラン',
} as PlanWithTags;

describe('useCalendarDragStore', () => {
  beforeEach(() => {
    useCalendarDragStore.getState().endDrag();
  });

  describe('初期状態', () => {
    it('ドラッグしていない', () => {
      const state = useCalendarDragStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.draggedPlanId).toBeNull();
      expect(state.dragSource).toBeNull();
    });
  });

  describe('startDrag (カレンダー内)', () => {
    it('カレンダー内ドラッグを開始できる', () => {
      useCalendarDragStore.getState().startDrag('plan-1', mockCalendarPlan, 2);
      const state = useCalendarDragStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.dragSource).toBe('calendar');
      expect(state.draggedPlanId).toBe('plan-1');
      expect(state.draggedPlan).toEqual(mockCalendarPlan);
      expect(state.draggedPlanData).toBeNull();
      expect(state.originalDateIndex).toBe(2);
      expect(state.targetDateIndex).toBe(2);
    });
  });

  describe('startPanelDrag (パネルから)', () => {
    it('パネルドラッグを開始できる', () => {
      useCalendarDragStore.getState().startPanelDrag(mockPlanWithTags);
      const state = useCalendarDragStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.dragSource).toBe('panel');
      expect(state.draggedPlanId).toBe('plan-2');
      expect(state.draggedPlan).toBeNull();
      expect(state.draggedPlanData).toEqual(mockPlanWithTags);
      expect(state.originalDateIndex).toBe(-1);
    });
  });

  describe('updateDrag', () => {
    it('ドラッグ中の状態を部分更新できる', () => {
      useCalendarDragStore.getState().startDrag('plan-1', mockCalendarPlan, 0);
      useCalendarDragStore.getState().updateDrag({ targetDateIndex: 3 });
      expect(useCalendarDragStore.getState().targetDateIndex).toBe(3);
      // 他のフィールドは維持
      expect(useCalendarDragStore.getState().draggedPlanId).toBe('plan-1');
    });
  });

  describe('endDrag', () => {
    it('ドラッグ状態を初期化できる', () => {
      useCalendarDragStore.getState().startDrag('plan-1', mockCalendarPlan, 2);
      useCalendarDragStore.getState().endDrag();
      const state = useCalendarDragStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.draggedPlanId).toBeNull();
      expect(state.dragSource).toBeNull();
    });
  });

  describe('setTargetDateIndex', () => {
    it('ターゲット日付を更新できる', () => {
      useCalendarDragStore.getState().startDrag('plan-1', mockCalendarPlan, 0);
      useCalendarDragStore.getState().setTargetDateIndex(5);
      expect(useCalendarDragStore.getState().targetDateIndex).toBe(5);
    });
  });

  describe('setPreviewTime', () => {
    it('プレビュー時間を設定できる', () => {
      const time = {
        start: new Date('2026-02-21T14:00:00'),
        end: new Date('2026-02-21T15:00:00'),
      };
      useCalendarDragStore.getState().setPreviewTime(time);
      expect(useCalendarDragStore.getState().previewTime).toEqual(time);
    });

    it('nullでクリアできる', () => {
      useCalendarDragStore.getState().setPreviewTime({
        start: new Date(),
        end: new Date(),
      });
      useCalendarDragStore.getState().setPreviewTime(null);
      expect(useCalendarDragStore.getState().previewTime).toBeNull();
    });
  });
});
