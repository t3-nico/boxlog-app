import { describe, expect, it } from 'vitest';

import type { Plan } from '../types/plan';

import { expandRecurrence, getPlanRecurrenceConfig, isRecurringPlan } from './recurrence';

// テスト用のモックプラン
const createMockPlan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'plan-1',
  user_id: 'user-1',
  title: 'テストプラン',
  description: null,
  status: 'open',
  start_time: '2025-01-01T09:00:00Z',
  end_time: '2025-01-01T10:00:00Z',
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  completed_at: null,
  ...overrides,
});

describe('recurrence', () => {
  describe('isRecurringPlan', () => {
    it('recurrence_typeがnoneでない場合はtrueを返す', () => {
      const plan = createMockPlan({ recurrence_type: 'daily' });
      expect(isRecurringPlan(plan)).toBe(true);
    });

    it('recurrence_ruleがある場合はtrueを返す', () => {
      const plan = createMockPlan({ recurrence_rule: 'FREQ=DAILY;INTERVAL=1' });
      expect(isRecurringPlan(plan)).toBe(true);
    });

    it('recurrence_typeがnoneの場合はfalseを返す', () => {
      const plan = createMockPlan({ recurrence_type: 'none' });
      expect(isRecurringPlan(plan)).toBe(false);
    });

    it('recurrence_typeがnullの場合はfalseを返す', () => {
      const plan = createMockPlan({ recurrence_type: null });
      expect(isRecurringPlan(plan)).toBe(false);
    });

    it('両方ない場合はfalseを返す', () => {
      const plan = createMockPlan();
      expect(isRecurringPlan(plan)).toBe(false);
    });
  });

  describe('getPlanRecurrenceConfig', () => {
    it('dailyタイプは毎日繰り返しの設定を返す', () => {
      const plan = createMockPlan({ recurrence_type: 'daily' });
      const config = getPlanRecurrenceConfig(plan);

      expect(config).toEqual({
        frequency: 'daily',
        interval: 1,
        endType: 'never',
      });
    });

    it('weeklyタイプは開始日の曜日で繰り返す設定を返す', () => {
      // 2025-01-01は水曜日 (3)
      const plan = createMockPlan({
        recurrence_type: 'weekly',
        start_time: '2025-01-01T09:00:00Z',
      });
      const config = getPlanRecurrenceConfig(plan);

      expect(config?.frequency).toBe('weekly');
      expect(config?.interval).toBe(1);
      expect(config?.byWeekday).toContain(3); // 水曜日
    });

    it('monthlyタイプは開始日の日付で繰り返す設定を返す', () => {
      const plan = createMockPlan({
        recurrence_type: 'monthly',
        start_time: '2025-01-15T09:00:00Z',
      });
      const config = getPlanRecurrenceConfig(plan);

      expect(config?.frequency).toBe('monthly');
      expect(config?.interval).toBe(1);
      expect(config?.byMonthDay).toBe(15);
    });

    it('yearlyタイプは毎年繰り返しの設定を返す', () => {
      const plan = createMockPlan({ recurrence_type: 'yearly' });
      const config = getPlanRecurrenceConfig(plan);

      expect(config).toEqual({
        frequency: 'yearly',
        interval: 1,
        endType: 'never',
      });
    });

    it('weekdaysタイプは平日繰り返しの設定を返す', () => {
      const plan = createMockPlan({ recurrence_type: 'weekdays' });
      const config = getPlanRecurrenceConfig(plan);

      expect(config?.frequency).toBe('weekly');
      expect(config?.byWeekday).toEqual([1, 2, 3, 4, 5]); // 月〜金
    });

    it('noneタイプはnullを返す', () => {
      const plan = createMockPlan({ recurrence_type: 'none' });
      const config = getPlanRecurrenceConfig(plan);

      expect(config).toBeNull();
    });

    it('recurrence_ruleがある場合はそちらを優先する', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        recurrence_rule: 'FREQ=WEEKLY;INTERVAL=2',
      });
      const config = getPlanRecurrenceConfig(plan);

      expect(config?.frequency).toBe('weekly');
      expect(config?.interval).toBe(2);
    });
  });

  describe('expandRecurrence', () => {
    it('繰り返しがないプランは空配列を返す', () => {
      const plan = createMockPlan();
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-31');

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd);

      expect(occurrences).toEqual([]);
    });

    it('dailyタイプは期間内の毎日にオカレンスを生成する', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
      });
      // UTC形式で指定してタイムゾーンの影響を排除
      const rangeStart = new Date('2025-01-01T00:00:00Z');
      const rangeEnd = new Date('2025-01-05T00:00:00Z');

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd);

      expect(occurrences.length).toBeGreaterThanOrEqual(4);
      expect(occurrences[0]?.planId).toBe('plan-1');
      // toTimeString()はローカルタイムを返すため、期待値も動的に計算
      const expectedStartTime = new Date('2025-01-01T09:00:00Z').toTimeString().slice(0, 5);
      const expectedEndTime = new Date('2025-01-01T10:00:00Z').toTimeString().slice(0, 5);
      expect(occurrences[0]?.startTime).toBe(expectedStartTime);
      expect(occurrences[0]?.endTime).toBe(expectedEndTime);
    });

    it('weekdaysタイプは平日のみにオカレンスを生成する', () => {
      const plan = createMockPlan({
        recurrence_type: 'weekdays',
        start_time: '2025-01-06T09:00:00Z', // 月曜日
        end_time: '2025-01-06T10:00:00Z',
      });
      const rangeStart = new Date('2025-01-06');
      const rangeEnd = new Date('2025-01-12'); // 日曜日まで

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd);

      // 月〜金の5日間のみ
      expect(occurrences.length).toBe(5);
    });

    it('recurrence_end_dateで終了する', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
        recurrence_end_date: '2025-01-03',
      });
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-31');

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd);

      expect(occurrences.length).toBeLessThanOrEqual(3);
    });

    it('cancelled例外はスキップされる', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
      });
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-05');

      const exceptions = [
        {
          instanceDate: '2025-01-02',
          exceptionType: 'cancelled' as const,
        },
      ];

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions);

      // 1/2がスキップされるので1つ少ない
      const hasJan2 = occurrences.some((o) => o.date.toISOString().slice(0, 10) === '2025-01-02');
      expect(hasJan2).toBe(false);
    });

    it('moved例外は移動先に表示される', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
      });
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-10');

      const exceptions = [
        {
          instanceDate: '2025-01-08', // 移動先
          exceptionType: 'moved' as const,
          originalDate: '2025-01-02', // 元の日付
        },
      ];

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions);

      const movedOccurrence = occurrences.find(
        (o) => o.date.toISOString().slice(0, 10) === '2025-01-08' && o.exceptionType === 'moved',
      );
      expect(movedOccurrence).toBeDefined();
    });

    it('modified例外はオーバーライド値が反映される', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
      });
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-05');

      const exceptions = [
        {
          instanceDate: '2025-01-03',
          exceptionType: 'modified' as const,
          title: '変更後のタイトル',
          instanceStart: '2025-01-03T14:00:00Z',
        },
      ];

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions);

      const modifiedOccurrence = occurrences.find(
        (o) => o.date.toISOString().slice(0, 10) === '2025-01-03',
      );
      expect(modifiedOccurrence).toBeDefined();
      expect(modifiedOccurrence?.isException).toBe(true);
      expect(modifiedOccurrence?.exceptionType).toBe('modified');
      expect(modifiedOccurrence?.overrideTitle).toBe('変更後のタイトル');
      expect(modifiedOccurrence?.overrideStartTime).toBe('2025-01-03T14:00:00Z');
    });

    it('start_timeがないプランは空配列を返す', () => {
      const plan = createMockPlan({
        recurrence_type: 'daily',
        start_time: null,
      });
      const rangeStart = new Date('2025-01-01');
      const rangeEnd = new Date('2025-01-31');

      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd);

      expect(occurrences).toEqual([]);
    });
  });
});
