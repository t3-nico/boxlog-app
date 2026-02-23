import { beforeEach, describe, expect, it } from 'vitest';

import type { ClipboardPlan } from './usePlanClipboardStore';
import { usePlanClipboardStore } from './usePlanClipboardStore';

const mockPlan: ClipboardPlan = {
  title: 'テストプラン',
  description: 'テスト説明',
  duration: 60,
  startHour: 10,
  startMinute: 0,
  tagIds: ['tag-1', 'tag-2'],
};

describe('usePlanClipboardStore', () => {
  beforeEach(() => {
    usePlanClipboardStore.setState({
      copiedPlan: null,
      lastClickedPosition: null,
    });
  });

  describe('初期状態', () => {
    it('コピー済みプランがない', () => {
      expect(usePlanClipboardStore.getState().copiedPlan).toBeNull();
    });

    it('最後にクリックした位置がない', () => {
      expect(usePlanClipboardStore.getState().lastClickedPosition).toBeNull();
    });

    it('hasCopiedPlanがfalse', () => {
      expect(usePlanClipboardStore.getState().hasCopiedPlan()).toBe(false);
    });
  });

  describe('copyPlan', () => {
    it('プランをコピーできる', () => {
      usePlanClipboardStore.getState().copyPlan(mockPlan);
      expect(usePlanClipboardStore.getState().copiedPlan).toEqual(mockPlan);
      expect(usePlanClipboardStore.getState().hasCopiedPlan()).toBe(true);
    });

    it('上書きコピーできる', () => {
      usePlanClipboardStore.getState().copyPlan(mockPlan);
      const newPlan: ClipboardPlan = { ...mockPlan, title: '新しいプラン' };
      usePlanClipboardStore.getState().copyPlan(newPlan);
      expect(usePlanClipboardStore.getState().copiedPlan?.title).toBe('新しいプラン');
    });
  });

  describe('clearClipboard', () => {
    it('クリップボードをクリアできる', () => {
      usePlanClipboardStore.getState().copyPlan(mockPlan);
      usePlanClipboardStore.getState().clearClipboard();
      expect(usePlanClipboardStore.getState().copiedPlan).toBeNull();
      expect(usePlanClipboardStore.getState().hasCopiedPlan()).toBe(false);
    });
  });

  describe('lastClickedPosition', () => {
    it('最後にクリックした位置を設定できる', () => {
      const date = new Date('2026-02-21');
      usePlanClipboardStore.getState().setLastClickedPosition({ date });
      expect(usePlanClipboardStore.getState().lastClickedPosition?.date).toEqual(date);
    });

    it('クリアできる', () => {
      usePlanClipboardStore.getState().setLastClickedPosition({ date: new Date() });
      usePlanClipboardStore.getState().clearLastClickedPosition();
      expect(usePlanClipboardStore.getState().lastClickedPosition).toBeNull();
    });
  });
});
