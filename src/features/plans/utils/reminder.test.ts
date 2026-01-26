import { describe, expect, it } from 'vitest';

import { minutesToReminderType, reminderTypeToMinutes } from './reminder';

describe('reminder', () => {
  describe('reminderTypeToMinutes', () => {
    it('空文字列はnullを返す', () => {
      expect(reminderTypeToMinutes('')).toBeNull();
    });

    it('"none"はnullを返す', () => {
      expect(reminderTypeToMinutes('none')).toBeNull();
    });

    it('"開始時刻"は0を返す', () => {
      expect(reminderTypeToMinutes('開始時刻')).toBe(0);
    });

    it('"10分前"は10を返す', () => {
      expect(reminderTypeToMinutes('10分前')).toBe(10);
    });

    it('"30分前"は30を返す', () => {
      expect(reminderTypeToMinutes('30分前')).toBe(30);
    });

    it('"1時間前"は60を返す', () => {
      expect(reminderTypeToMinutes('1時間前')).toBe(60);
    });

    it('"1日前"は1440を返す（24時間 × 60分）', () => {
      expect(reminderTypeToMinutes('1日前')).toBe(1440);
      expect(reminderTypeToMinutes('1日前')).toBe(24 * 60);
    });

    it('"1週間前"は10080を返す（7日 × 24時間 × 60分）', () => {
      expect(reminderTypeToMinutes('1週間前')).toBe(10080);
      expect(reminderTypeToMinutes('1週間前')).toBe(7 * 24 * 60);
    });

    it('未知の値はnullを返す', () => {
      expect(reminderTypeToMinutes('5分前')).toBeNull();
      expect(reminderTypeToMinutes('2時間前')).toBeNull();
      expect(reminderTypeToMinutes('invalid')).toBeNull();
    });
  });

  describe('minutesToReminderType', () => {
    it('nullは空文字列を返す', () => {
      expect(minutesToReminderType(null)).toBe('');
    });

    it('undefinedは空文字列を返す', () => {
      expect(minutesToReminderType(undefined)).toBe('');
    });

    it('0は"開始時刻"を返す', () => {
      expect(minutesToReminderType(0)).toBe('開始時刻');
    });

    it('10は"10分前"を返す', () => {
      expect(minutesToReminderType(10)).toBe('10分前');
    });

    it('30は"30分前"を返す', () => {
      expect(minutesToReminderType(30)).toBe('30分前');
    });

    it('60は"1時間前"を返す', () => {
      expect(minutesToReminderType(60)).toBe('1時間前');
    });

    it('1440は"1日前"を返す', () => {
      expect(minutesToReminderType(1440)).toBe('1日前');
    });

    it('10080は"1週間前"を返す', () => {
      expect(minutesToReminderType(10080)).toBe('1週間前');
    });

    it('未知の値は"カスタム"を返す（デフォルトfallback）', () => {
      expect(minutesToReminderType(5)).toBe('カスタム');
      expect(minutesToReminderType(120)).toBe('カスタム');
      expect(minutesToReminderType(999)).toBe('カスタム');
    });

    it('fallbackを指定すると未知の値にその値を返す', () => {
      expect(minutesToReminderType(5, '')).toBe('');
      expect(minutesToReminderType(120, 'unknown')).toBe('unknown');
    });
  });

  describe('双方向変換', () => {
    it('reminderTypeToMinutes → minutesToReminderType で元に戻る', () => {
      const types = ['開始時刻', '10分前', '30分前', '1時間前', '1日前', '1週間前'];

      types.forEach((type) => {
        const minutes = reminderTypeToMinutes(type);
        expect(minutes).not.toBeNull();
        expect(minutesToReminderType(minutes!)).toBe(type);
      });
    });

    it('minutesToReminderType → reminderTypeToMinutes で元に戻る', () => {
      const minuteValues = [0, 10, 30, 60, 1440, 10080];

      minuteValues.forEach((minutes) => {
        const type = minutesToReminderType(minutes);
        expect(type).not.toBe('');
        expect(reminderTypeToMinutes(type)).toBe(minutes);
      });
    });
  });

  describe('リマインダー時間の計算', () => {
    it('10分前 = 600,000ミリ秒', () => {
      const minutes = reminderTypeToMinutes('10分前')!;
      expect(minutes * 60 * 1000).toBe(600000);
    });

    it('1時間前 = 3,600,000ミリ秒', () => {
      const minutes = reminderTypeToMinutes('1時間前')!;
      expect(minutes * 60 * 1000).toBe(3600000);
    });

    it('1日前 = 86,400,000ミリ秒', () => {
      const minutes = reminderTypeToMinutes('1日前')!;
      expect(minutes * 60 * 1000).toBe(86400000);
    });

    it('1週間前 = 604,800,000ミリ秒', () => {
      const minutes = reminderTypeToMinutes('1週間前')!;
      expect(minutes * 60 * 1000).toBe(604800000);
    });
  });

  describe('リマインダー通知時刻の計算', () => {
    it('開始時刻と同時に通知', () => {
      // UTC形式で指定してタイムゾーンの影響を排除
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const minutes = reminderTypeToMinutes('開始時刻')!;

      const notifyAt = new Date(eventStart.getTime() - minutes * 60 * 1000);
      expect(notifyAt.toISOString()).toBe(eventStart.toISOString());
    });

    it('10分前に通知', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const minutes = reminderTypeToMinutes('10分前')!;

      const notifyAt = new Date(eventStart.getTime() - minutes * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-15T09:50:00.000Z');
    });

    it('1時間前に通知', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const minutes = reminderTypeToMinutes('1時間前')!;

      const notifyAt = new Date(eventStart.getTime() - minutes * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-15T09:00:00.000Z');
    });

    it('1日前に通知', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const minutes = reminderTypeToMinutes('1日前')!;

      const notifyAt = new Date(eventStart.getTime() - minutes * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-14T10:00:00.000Z');
    });
  });
});
