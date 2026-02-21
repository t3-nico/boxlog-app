import { describe, expect, it } from 'vitest';

import { initialDragState } from '../hooks/drag-and-drop/types';

import { calculatePlanGhostStyle, calculatePreviewTime } from './planGhost';

describe('planGhost', () => {
  describe('calculatePlanGhostStyle', () => {
    const baseStyle = { top: '100px', height: '60px', left: '0px' };

    it('ドラッグ中でない場合はスタイルを変更しない', () => {
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', initialDragState);
      expect(result).toEqual(baseStyle);
    });

    it('ドラッグ中はゴースト表示（opacity低下 + zIndex低下）', () => {
      const dragState = {
        ...initialDragState,
        isDragging: true,
        draggedEventId: 'plan-1',
      };
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', dragState);
      expect(result.opacity).toBe(0.3);
      expect(result.zIndex).toBe(1);
    });

    it('別のプランはゴースト表示されない', () => {
      const dragState = {
        ...initialDragState,
        isDragging: true,
        draggedEventId: 'plan-other',
      };
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', dragState);
      expect(result).toEqual(baseStyle);
    });

    it('isPending + snappedPositionでもゴースト表示される', () => {
      const dragState = {
        ...initialDragState,
        isPending: true,
        draggedEventId: 'plan-1',
        snappedPosition: { top: 120 },
      };
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', dragState);
      expect(result.opacity).toBe(0.3);
    });

    it('リサイズ中はheightとzIndexが更新される', () => {
      const dragState = {
        ...initialDragState,
        isResizing: true,
        draggedEventId: 'plan-1',
        snappedPosition: { top: 100, height: 120 },
      };
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', dragState);
      expect(result.height).toBe('120px');
      expect(result.zIndex).toBe(1000);
    });

    it('リサイズ中でもsnappedPosition.heightがなければ変更しない', () => {
      const dragState = {
        ...initialDragState,
        isResizing: true,
        draggedEventId: 'plan-1',
        snappedPosition: { top: 100 },
      };
      const result = calculatePlanGhostStyle(baseStyle, 'plan-1', dragState);
      expect(result).toEqual(baseStyle);
    });
  });

  describe('calculatePreviewTime', () => {
    it('ドラッグ中はnullを返す（ゴーストには元の時間を表示）', () => {
      const dragState = {
        ...initialDragState,
        isDragging: true,
        draggedEventId: 'plan-1',
        previewTime: {
          start: new Date('2026-02-21T10:00:00'),
          end: new Date('2026-02-21T11:00:00'),
        },
      };
      const result = calculatePreviewTime('plan-1', dragState);
      expect(result).toBeNull();
    });

    it('リサイズ中はプレビュー時間を返す', () => {
      const previewTime = {
        start: new Date('2026-02-21T10:00:00'),
        end: new Date('2026-02-21T12:00:00'),
      };
      const dragState = {
        ...initialDragState,
        isResizing: true,
        draggedEventId: 'plan-1',
        previewTime,
      };
      const result = calculatePreviewTime('plan-1', dragState);
      expect(result).toEqual(previewTime);
    });

    it('別のプランの場合はnullを返す', () => {
      const dragState = {
        ...initialDragState,
        isResizing: true,
        draggedEventId: 'plan-other',
        previewTime: {
          start: new Date(),
          end: new Date(),
        },
      };
      const result = calculatePreviewTime('plan-1', dragState);
      expect(result).toBeNull();
    });
  });
});
