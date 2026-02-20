import { describe, expect, it } from 'vitest';

import type { RecurrenceConfig } from '../types/plan';

import { configToReadable, configToRRule, ruleToConfig } from './rrule';

describe('rrule', () => {
  describe('configToRRule', () => {
    it('daily, interval=1 → FREQ=DAILY', () => {
      const config: RecurrenceConfig = { frequency: 'daily', interval: 1, endType: 'never' };
      expect(configToRRule(config)).toBe('FREQ=DAILY');
    });

    it('weekly + BYDAY', () => {
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 1,
        byWeekday: [1, 3, 5],
        endType: 'never',
      };
      expect(configToRRule(config)).toBe('FREQ=WEEKLY;BYDAY=MO,WE,FR');
    });

    it('monthly + BYMONTHDAY', () => {
      const config: RecurrenceConfig = {
        frequency: 'monthly',
        interval: 1,
        byMonthDay: 15,
        endType: 'never',
      };
      expect(configToRRule(config)).toBe('FREQ=MONTHLY;BYMONTHDAY=15');
    });

    it('monthly + BYSETPOS', () => {
      const config: RecurrenceConfig = {
        frequency: 'monthly',
        interval: 1,
        bySetPos: -1,
        byWeekday: [5],
        endType: 'never',
      };
      const rrule = configToRRule(config);
      expect(rrule).toContain('BYDAY=FR');
      expect(rrule).toContain('BYSETPOS=-1');
    });

    it('yearly', () => {
      const config: RecurrenceConfig = { frequency: 'yearly', interval: 1, endType: 'never' };
      expect(configToRRule(config)).toBe('FREQ=YEARLY');
    });

    it('UNTIL付き', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endType: 'until',
        endDate: '2025-12-31',
      };
      expect(configToRRule(config)).toBe('FREQ=DAILY;UNTIL=20251231');
    });

    it('COUNT付き', () => {
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 1,
        byWeekday: [1],
        endType: 'count',
        count: 10,
      };
      expect(configToRRule(config)).toBe('FREQ=WEEKLY;BYDAY=MO;COUNT=10');
    });

    it('INTERVAL > 1', () => {
      const config: RecurrenceConfig = { frequency: 'weekly', interval: 2, endType: 'never' };
      expect(configToRRule(config)).toBe('FREQ=WEEKLY;INTERVAL=2');
    });
  });

  describe('ruleToConfig', () => {
    it('FREQ=DAILY', () => {
      const config = ruleToConfig('FREQ=DAILY');
      expect(config.frequency).toBe('daily');
      expect(config.interval).toBe(1);
      expect(config.endType).toBe('never');
    });

    it('FREQ=WEEKLY;BYDAY=MO,WE,FR', () => {
      const config = ruleToConfig('FREQ=WEEKLY;BYDAY=MO,WE,FR');
      expect(config.frequency).toBe('weekly');
      expect(config.byWeekday).toEqual([1, 3, 5]);
    });

    it('FREQ=MONTHLY;BYMONTHDAY=15', () => {
      const config = ruleToConfig('FREQ=MONTHLY;BYMONTHDAY=15');
      expect(config.frequency).toBe('monthly');
      expect(config.byMonthDay).toBe(15);
    });

    it('FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1', () => {
      const config = ruleToConfig('FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1');
      expect(config.frequency).toBe('monthly');
      expect(config.byWeekday).toEqual([5]);
      expect(config.bySetPos).toBe(-1);
    });

    it('UNTIL付き', () => {
      const config = ruleToConfig('FREQ=DAILY;UNTIL=20251231');
      expect(config.endType).toBe('until');
      expect(config.endDate).toBe('2025-12-31');
    });

    it('COUNT付き', () => {
      const config = ruleToConfig('FREQ=WEEKLY;COUNT=10');
      expect(config.endType).toBe('count');
      expect(config.count).toBe(10);
    });

    it('INTERVAL付き', () => {
      const config = ruleToConfig('FREQ=WEEKLY;INTERVAL=3');
      expect(config.interval).toBe(3);
    });
  });

  describe('configToReadable', () => {
    it('毎日', () => {
      const config: RecurrenceConfig = { frequency: 'daily', interval: 1, endType: 'never' };
      expect(configToReadable(config)).toBe('毎日');
    });

    it('毎週', () => {
      const config: RecurrenceConfig = { frequency: 'weekly', interval: 1, endType: 'never' };
      expect(configToReadable(config)).toBe('毎週');
    });

    it('2週間ごと、月・水・金', () => {
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 2,
        byWeekday: [1, 3, 5],
        endType: 'never',
      };
      expect(configToReadable(config)).toBe('2週間ごと、月・水・金');
    });

    it('毎月、15日', () => {
      const config: RecurrenceConfig = {
        frequency: 'monthly',
        interval: 1,
        byMonthDay: 15,
        endType: 'never',
      };
      expect(configToReadable(config)).toBe('毎月、15日');
    });

    it('毎年', () => {
      const config: RecurrenceConfig = { frequency: 'yearly', interval: 1, endType: 'never' };
      expect(configToReadable(config)).toBe('毎年');
    });

    it('COUNT付き', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endType: 'count',
        count: 10,
      };
      expect(configToReadable(config)).toBe('毎日、10回');
    });

    it('UNTIL付き', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endType: 'until',
        endDate: '2025-12-31',
      };
      expect(configToReadable(config)).toBe('毎日、2025-12-31まで');
    });

    it('最終金曜日', () => {
      const config: RecurrenceConfig = {
        frequency: 'monthly',
        interval: 1,
        bySetPos: -1,
        byWeekday: [5],
        endType: 'never',
      };
      expect(configToReadable(config)).toBe('毎月、最終金曜日');
    });
  });

  describe('ラウンドトリップ', () => {
    const roundTrip = (config: RecurrenceConfig) => {
      const rrule = configToRRule(config);
      return ruleToConfig(rrule);
    };

    it('daily', () => {
      const config: RecurrenceConfig = { frequency: 'daily', interval: 1, endType: 'never' };
      const result = roundTrip(config);
      expect(result.frequency).toBe(config.frequency);
      expect(result.interval).toBe(config.interval);
      expect(result.endType).toBe(config.endType);
    });

    it('weekly + BYDAY', () => {
      const config: RecurrenceConfig = {
        frequency: 'weekly',
        interval: 2,
        byWeekday: [1, 3, 5],
        endType: 'never',
      };
      const result = roundTrip(config);
      expect(result.frequency).toBe(config.frequency);
      expect(result.interval).toBe(config.interval);
      expect(result.byWeekday).toEqual(config.byWeekday);
    });

    it('monthly + BYMONTHDAY + COUNT', () => {
      const config: RecurrenceConfig = {
        frequency: 'monthly',
        interval: 1,
        byMonthDay: 15,
        endType: 'count',
        count: 12,
      };
      const result = roundTrip(config);
      expect(result.frequency).toBe(config.frequency);
      expect(result.byMonthDay).toBe(config.byMonthDay);
      expect(result.endType).toBe(config.endType);
      expect(result.count).toBe(config.count);
    });

    it('daily + UNTIL', () => {
      const config: RecurrenceConfig = {
        frequency: 'daily',
        interval: 1,
        endType: 'until',
        endDate: '2025-12-31',
      };
      const result = roundTrip(config);
      expect(result.endType).toBe('until');
      expect(result.endDate).toBe('2025-12-31');
    });
  });
});
