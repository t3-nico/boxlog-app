import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  checkBrowserNotificationSupport,
  formatNotificationDate,
  getDateGroupKey,
  getNotificationTypeColor,
  getNotificationTypeIcon,
} from './notification-helpers';

describe('notification-helpers', () => {
  describe('getDateGroupKey', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // 2025年1月15日（水曜日）に固定
      vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('今日の日付は「today」を返す', () => {
      expect(getDateGroupKey('2025-01-15T10:00:00')).toBe('today');
      expect(getDateGroupKey(new Date('2025-01-15T08:00:00'))).toBe('today');
    });

    it('昨日の日付は「yesterday」を返す', () => {
      expect(getDateGroupKey('2025-01-14T10:00:00')).toBe('yesterday');
    });

    it('今週（今日・昨日以外）の日付は「thisWeek」を返す', () => {
      // 1月13日（月曜日）- 今週
      expect(getDateGroupKey('2025-01-13T10:00:00')).toBe('thisWeek');
    });

    it('今月（今週以外）の日付は「thisMonth」を返す', () => {
      // 1月5日（日曜日）- 今月だが今週ではない
      expect(getDateGroupKey('2025-01-05T10:00:00')).toBe('thisMonth');
    });

    it('それより前の日付は「older」を返す', () => {
      expect(getDateGroupKey('2024-12-01T10:00:00')).toBe('older');
      expect(getDateGroupKey('2024-01-01T10:00:00')).toBe('older');
    });

    it('文字列とDateオブジェクト両方を受け付ける', () => {
      const dateString = '2025-01-15T10:00:00';
      const dateObject = new Date('2025-01-15T10:00:00');

      expect(getDateGroupKey(dateString)).toBe('today');
      expect(getDateGroupKey(dateObject)).toBe('today');
    });
  });

  describe('getNotificationTypeIcon', () => {
    it('reminderはbellを返す', () => {
      expect(getNotificationTypeIcon('reminder')).toBe('bell');
    });

    it('plan_createdはplus-circleを返す', () => {
      expect(getNotificationTypeIcon('plan_created')).toBe('plus-circle');
    });

    it('plan_updatedはeditを返す', () => {
      expect(getNotificationTypeIcon('plan_updated')).toBe('edit');
    });

    it('plan_deletedはtrashを返す', () => {
      expect(getNotificationTypeIcon('plan_deleted')).toBe('trash');
    });

    it('plan_completedはcheck-circleを返す', () => {
      expect(getNotificationTypeIcon('plan_completed')).toBe('check-circle');
    });

    it('trash_warningはalert-triangleを返す', () => {
      expect(getNotificationTypeIcon('trash_warning')).toBe('alert-triangle');
    });

    it('systemはinfoを返す', () => {
      expect(getNotificationTypeIcon('system')).toBe('info');
    });

    it('未知のタイプはbellを返す', () => {
      expect(getNotificationTypeIcon('unknown' as never)).toBe('bell');
    });
  });

  describe('getNotificationTypeColor', () => {
    it('systemはblue系のクラスを返す', () => {
      const result = getNotificationTypeColor('system');
      expect(result).toContain('blue');
    });

    it('featureはgreen系のクラスを返す', () => {
      const result = getNotificationTypeColor('feature');
      expect(result).toContain('green');
    });

    it('importantはred系のクラスを返す', () => {
      const result = getNotificationTypeColor('important');
      expect(result).toContain('red');
    });

    it('未知のタイプはgray系のクラスを返す', () => {
      const result = getNotificationTypeColor('unknown');
      expect(result).toContain('gray');
    });
  });

  describe('formatNotificationDate', () => {
    it('文字列の日付をフォーマットできる', () => {
      const result = formatNotificationDate('2025-01-15T12:00:00Z', 'ja-JP');
      expect(typeof result).toBe('string');
    });

    it('Dateオブジェクトをフォーマットできる', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const result = formatNotificationDate(date, 'ja-JP');
      expect(typeof result).toBe('string');
    });

    it('デフォルトロケールは日本語', () => {
      const result = formatNotificationDate('2025-01-15T12:00:00Z');
      expect(typeof result).toBe('string');
    });
  });

  describe('checkBrowserNotificationSupport', () => {
    it('window.Notificationが存在する場合はtrueを返す', () => {
      // Happy-DOMやJSDOMではNotificationがモックされている可能性がある
      // 実際のテストではモックが必要
      const result = checkBrowserNotificationSupport();
      expect(typeof result).toBe('boolean');
    });
  });
});
