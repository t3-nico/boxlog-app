import { describe, expect, it } from 'vitest';

import { getReminderI18nKey, REMINDER_OPTIONS } from './reminder';

describe('reminder', () => {
  describe('REMINDER_OPTIONS', () => {
    it('has correct number of options', () => {
      expect(REMINDER_OPTIONS).toHaveLength(9);
    });

    it('first option is null (no reminder)', () => {
      expect(REMINDER_OPTIONS[0].minutes).toBeNull();
      expect(REMINDER_OPTIONS[0].i18nKey).toBe('common.reminder.none');
    });

    it('all options have valid i18n keys', () => {
      for (const option of REMINDER_OPTIONS) {
        expect(option.i18nKey).toMatch(/^common\.reminder\./);
      }
    });

    it('minutes values are in ascending order (excluding null)', () => {
      const numericMinutes = REMINDER_OPTIONS.filter((opt) => opt.minutes !== null).map(
        (opt) => opt.minutes as number,
      );
      for (let i = 1; i < numericMinutes.length; i++) {
        expect(numericMinutes[i]!).toBeGreaterThan(numericMinutes[i - 1]!);
      }
    });
  });

  describe('getReminderI18nKey', () => {
    it('returns none key for null', () => {
      expect(getReminderI18nKey(null)).toBe('common.reminder.none');
    });

    it('returns atStart key for 0', () => {
      expect(getReminderI18nKey(0)).toBe('common.reminder.atStart');
    });

    it('returns min10 key for 10', () => {
      expect(getReminderI18nKey(10)).toBe('common.reminder.min10');
    });

    it('returns min30 key for 30', () => {
      expect(getReminderI18nKey(30)).toBe('common.reminder.min30');
    });

    it('returns hour1 key for 60', () => {
      expect(getReminderI18nKey(60)).toBe('common.reminder.hour1');
    });

    it('returns day1 key for 1440', () => {
      expect(getReminderI18nKey(1440)).toBe('common.reminder.day1');
    });

    it('returns week1 key for 10080', () => {
      expect(getReminderI18nKey(10080)).toBe('common.reminder.week1');
    });

    it('returns min5 key for 5', () => {
      expect(getReminderI18nKey(5)).toBe('common.reminder.min5');
    });

    it('returns min15 key for 15', () => {
      expect(getReminderI18nKey(15)).toBe('common.reminder.min15');
    });

    it('returns custom key for unknown minutes values', () => {
      expect(getReminderI18nKey(3)).toBe('common.reminder.custom');
      expect(getReminderI18nKey(120)).toBe('common.reminder.custom');
      expect(getReminderI18nKey(999)).toBe('common.reminder.custom');
    });
  });

  describe('reminder time calculations', () => {
    it('10 minutes before = 600,000ms', () => {
      expect(10 * 60 * 1000).toBe(600000);
    });

    it('1 hour before = 3,600,000ms', () => {
      expect(60 * 60 * 1000).toBe(3600000);
    });

    it('1 day before = 86,400,000ms', () => {
      expect(1440 * 60 * 1000).toBe(86400000);
    });

    it('1 week before = 604,800,000ms', () => {
      expect(10080 * 60 * 1000).toBe(604800000);
    });
  });

  describe('reminder notification time calculation', () => {
    it('at start time', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const notifyAt = new Date(eventStart.getTime() - 0 * 60 * 1000);
      expect(notifyAt.toISOString()).toBe(eventStart.toISOString());
    });

    it('10 minutes before', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const notifyAt = new Date(eventStart.getTime() - 10 * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-15T09:50:00.000Z');
    });

    it('1 hour before', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const notifyAt = new Date(eventStart.getTime() - 60 * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-15T09:00:00.000Z');
    });

    it('1 day before', () => {
      const eventStart = new Date('2025-01-15T10:00:00Z');
      const notifyAt = new Date(eventStart.getTime() - 1440 * 60 * 1000);
      expect(notifyAt.toISOString()).toBe('2025-01-14T10:00:00.000Z');
    });
  });
});
