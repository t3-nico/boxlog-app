import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '@/core/types/calendar-event';
import type { Plan } from '../../types/plan';

import {
  expandRecurringPlansToCalendarPlans,
  planToCalendarPlan,
  plansToCalendarPlans,
} from '../toCalendarEvent';

// テスト用ヘルパー: 最小限のPlanを生成
function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'plan-uuid-001',
    user_id: 'user-uuid-001',
    title: 'Test Plan',
    description: null,
    status: 'open',
    completed_at: null,
    start_time: '2025-03-10T09:00:00.000Z',
    end_time: '2025-03-10T10:00:00.000Z',
    recurrence_type: null,
    recurrence_end_date: null,
    recurrence_rule: null,
    reminder_minutes: null,
    created_at: '2025-03-01T00:00:00.000Z',
    updated_at: '2025-03-05T00:00:00.000Z',
    ...overrides,
  };
}

describe('planToCalendarPlan', () => {
  describe('フィールドマッピング', () => {
    it('idが正しくマッピングされる', () => {
      const plan = makePlan({ id: 'plan-abc' });
      const result = planToCalendarPlan(plan);
      expect(result.id).toBe('plan-abc');
    });

    it('titleが正しくマッピングされる', () => {
      const plan = makePlan({ title: 'My Task' });
      const result = planToCalendarPlan(plan);
      expect(result.title).toBe('My Task');
    });

    it('descriptionがnullの場合はundefinedになる', () => {
      const plan = makePlan({ description: null });
      const result = planToCalendarPlan(plan);
      expect(result.description).toBeUndefined();
    });

    it('descriptionが文字列の場合はそのままマッピングされる', () => {
      const plan = makePlan({ description: 'Some description' });
      const result = planToCalendarPlan(plan);
      expect(result.description).toBe('Some description');
    });

    it('typeが "plan" に設定される', () => {
      const result = planToCalendarPlan(makePlan());
      expect(result.type).toBe('plan');
    });

    it('colorがデフォルト値 "#3b82f6" になる', () => {
      const result = planToCalendarPlan(makePlan());
      expect(result.color).toBe('#3b82f6');
    });
  });

  describe('日時変換', () => {
    it('start_time が正しく Date に変換される', () => {
      const plan = makePlan({ start_time: '2025-03-10T09:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.startDate?.toISOString()).toBe('2025-03-10T09:00:00.000Z');
    });

    it('end_time が正しく Date に変換される', () => {
      const plan = makePlan({ end_time: '2025-03-10T10:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.endDate?.toISOString()).toBe('2025-03-10T10:00:00.000Z');
    });

    it('start_time が null の場合は現在時刻に近い Date を返す', () => {
      const before = new Date();
      const plan = makePlan({ start_time: null });
      const result = planToCalendarPlan(plan);
      const after = new Date();
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.startDate!.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
      expect(result.startDate!.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
    });

    it('end_time が null の場合は現在時刻に近い Date を返す', () => {
      const before = new Date();
      const plan = makePlan({ end_time: null });
      const result = planToCalendarPlan(plan);
      const after = new Date();
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.endDate!.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
      expect(result.endDate!.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
    });

    it('created_at が正しく Date に変換される', () => {
      const plan = makePlan({ created_at: '2025-03-01T00:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2025-03-01T00:00:00.000Z');
    });

    it('updated_at が正しく Date に変換される', () => {
      const plan = makePlan({ updated_at: '2025-03-05T00:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.toISOString()).toBe('2025-03-05T00:00:00.000Z');
    });
  });

  describe('displayStartDate / displayEndDate', () => {
    it('displayStartDate が startDate と同じ値になる', () => {
      const plan = makePlan({ start_time: '2025-03-10T09:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.displayStartDate.toISOString()).toBe(result.startDate!.toISOString());
    });

    it('displayEndDate が endDate と同じ値になる', () => {
      const plan = makePlan({ end_time: '2025-03-10T10:00:00.000Z' });
      const result = planToCalendarPlan(plan);
      expect(result.displayEndDate.toISOString()).toBe(result.endDate!.toISOString());
    });
  });

  describe('duration 計算', () => {
    it('60分のプランは duration が 60 になる', () => {
      const plan = makePlan({
        start_time: '2025-03-10T09:00:00.000Z',
        end_time: '2025-03-10T10:00:00.000Z',
      });
      const result = planToCalendarPlan(plan);
      expect(result.duration).toBe(60);
    });

    it('90分のプランは duration が 90 になる', () => {
      const plan = makePlan({
        start_time: '2025-03-10T09:00:00.000Z',
        end_time: '2025-03-10T10:30:00.000Z',
      });
      const result = planToCalendarPlan(plan);
      expect(result.duration).toBe(90);
    });

    it('30分のプランは duration が 30 になる', () => {
      const plan = makePlan({
        start_time: '2025-03-10T14:00:00.000Z',
        end_time: '2025-03-10T14:30:00.000Z',
      });
      const result = planToCalendarPlan(plan);
      expect(result.duration).toBe(30);
    });
  });

  describe('status マッピング', () => {
    it('status "open" は CalendarEvent の "open" にマッピングされる', () => {
      const result = planToCalendarPlan(makePlan({ status: 'open' }));
      expect(result.status).toBe('open');
    });

    it('status "closed" は CalendarEvent の "closed" にマッピングされる', () => {
      const result = planToCalendarPlan(makePlan({ status: 'closed' }));
      expect(result.status).toBe('closed');
    });
  });

  describe('isMultiDay', () => {
    it('同日の場合は isMultiDay が false になる', () => {
      // Use local time to guarantee start and end are on the same calendar day
      const startTime = new Date(2025, 2, 10, 9, 0, 0).toISOString();
      const endTime = new Date(2025, 2, 10, 22, 0, 0).toISOString();
      const plan = makePlan({ start_time: startTime, end_time: endTime });
      const result = planToCalendarPlan(plan);
      expect(result.isMultiDay).toBe(false);
    });

    it('複数日にまたがる場合は isMultiDay が true になる', () => {
      // Use local dates to avoid timezone crossing issues
      const startTime = new Date(2025, 2, 10, 9, 0, 0).toISOString();
      const endTime = new Date(2025, 2, 11, 9, 0, 0).toISOString();
      const plan = makePlan({
        start_time: startTime,
        end_time: endTime,
      });
      const result = planToCalendarPlan(plan);
      expect(result.isMultiDay).toBe(true);
    });
  });

  describe('isRecurring', () => {
    it('recurrence_type が null の場合は isRecurring が false になる', () => {
      const result = planToCalendarPlan(makePlan({ recurrence_type: null }));
      expect(result.isRecurring).toBe(false);
    });

    it('recurrence_type が "none" の場合は isRecurring が false になる', () => {
      const result = planToCalendarPlan(makePlan({ recurrence_type: 'none' }));
      expect(result.isRecurring).toBe(false);
    });

    it('recurrence_type が "daily" の場合は isRecurring が true になる', () => {
      const result = planToCalendarPlan(makePlan({ recurrence_type: 'daily' }));
      expect(result.isRecurring).toBe(true);
    });

    it('recurrence_rule が設定されている場合は isRecurring が true になる', () => {
      const result = planToCalendarPlan(
        makePlan({ recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO', recurrence_type: null }),
      );
      expect(result.isRecurring).toBe(true);
    });
  });

  describe('tagIds', () => {
    it('tagIds が未定義の場合は空配列になる', () => {
      const result = planToCalendarPlan(makePlan());
      expect(result.tagIds).toEqual([]);
    });

    it('tagIds が渡された場合はそのまま引き継がれる', () => {
      const planWithTags = { ...makePlan(), tagIds: ['tag-1', 'tag-2'] };
      const result = planToCalendarPlan(planWithTags);
      expect(result.tagIds).toEqual(['tag-1', 'tag-2']);
    });
  });

  describe('reminder_minutes', () => {
    it('reminder_minutes が null の場合はそのままマッピングされる', () => {
      const result = planToCalendarPlan(makePlan({ reminder_minutes: null }));
      expect(result.reminder_minutes).toBeNull();
    });

    it('reminder_minutes が数値の場合はそのままマッピングされる', () => {
      const result = planToCalendarPlan(makePlan({ reminder_minutes: 15 }));
      expect(result.reminder_minutes).toBe(15);
    });
  });
});

describe('plansToCalendarPlans', () => {
  it('空配列を渡すと空配列を返す', () => {
    const result = plansToCalendarPlans([]);
    expect(result).toEqual([]);
  });

  it('複数のプランをすべて CalendarEvent に変換する', () => {
    const plans = [
      makePlan({ id: 'plan-001', title: 'First' }),
      makePlan({ id: 'plan-002', title: 'Second' }),
      makePlan({ id: 'plan-003', title: 'Third' }),
    ];
    const result = plansToCalendarPlans(plans);
    expect(result).toHaveLength(3);
  });

  it('変換結果の id が元の Plan の id と一致する', () => {
    const plans = [makePlan({ id: 'plan-001' }), makePlan({ id: 'plan-002' })];
    const result = plansToCalendarPlans(plans);
    expect(result[0]!.id).toBe('plan-001');
    expect(result[1]!.id).toBe('plan-002');
  });

  it('各 CalendarEvent の type が "plan" になる', () => {
    const plans = [makePlan(), makePlan({ id: 'plan-002' })];
    const result = plansToCalendarPlans(plans);
    result.forEach((event: CalendarEvent) => {
      expect(event.type).toBe('plan');
    });
  });

  it('タグIDが各 CalendarEvent に引き継がれる', () => {
    const plans = [
      { ...makePlan({ id: 'plan-001' }), tagIds: ['tag-a'] },
      { ...makePlan({ id: 'plan-002' }), tagIds: ['tag-b', 'tag-c'] },
    ];
    const result = plansToCalendarPlans(plans);
    expect(result[0]!.tagIds).toEqual(['tag-a']);
    expect(result[1]!.tagIds).toEqual(['tag-b', 'tag-c']);
  });
});

describe('expandRecurringPlansToCalendarPlans', () => {
  const rangeStart = new Date('2025-03-01T00:00:00.000Z');
  const rangeEnd = new Date('2025-03-07T23:59:59.999Z');

  it('繰り返しでないプランはそのまま変換される', () => {
    const plan = makePlan({
      start_time: '2025-03-03T09:00:00.000Z',
      end_time: '2025-03-03T10:00:00.000Z',
      recurrence_type: null,
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(plan.id);
    expect(result[0]!.type).toBe('plan');
  });

  it('daily 繰り返しプランは範囲内の日数分だけ展開される', () => {
    // Starts on 2025-03-01 (UTC)
    const plan = makePlan({
      id: 'recurring-daily',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    // 7 days: Mar 1 - Mar 7
    expect(result.length).toBeGreaterThanOrEqual(7);
  });

  it('繰り返しインスタンスの id は "{planId}_{YYYY-MM-DD}" 形式になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.id).toMatch(/^recurring-plan_\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('繰り返しインスタンスの originalPlanId が親プランの id になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.originalPlanId).toBe('recurring-plan');
    });
  });

  it('繰り返しインスタンスの calendarId が親プランの id になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.calendarId).toBe('recurring-plan');
    });
  });

  it('繰り返しインスタンスは isRecurring が true になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'weekly',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.isRecurring).toBe(true);
    });
  });

  it('cancelled 例外はスキップされる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const exceptionsMap = new Map([
      ['recurring-plan', [{ instanceDate: '2025-03-03', exceptionType: 'cancelled' as const }]],
    ]);
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd, exceptionsMap);
    const march3Instance = result.find(
      (event: CalendarEvent) => event.instanceDate === '2025-03-03',
    );
    expect(march3Instance).toBeUndefined();
  });

  it('modified 例外は isException が true になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const exceptionsMap = new Map([
      [
        'recurring-plan',
        [
          {
            instanceDate: '2025-03-02',
            exceptionType: 'modified' as const,
            title: 'Modified Title',
          },
        ],
      ],
    ]);
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd, exceptionsMap);
    const modifiedInstance = result.find(
      (event: CalendarEvent) => event.instanceDate === '2025-03-02',
    );
    expect(modifiedInstance).toBeDefined();
    expect(modifiedInstance?.isException).toBe(true);
    expect(modifiedInstance?.title).toBe('Modified Title');
  });

  it('空配列を渡すと空配列を返す', () => {
    const result = expandRecurringPlansToCalendarPlans([], rangeStart, rangeEnd);
    expect(result).toEqual([]);
  });

  it('繰り返しプランと通常プランが混在する場合も正しく処理される', () => {
    const normalPlan = makePlan({
      id: 'normal-plan',
      start_time: '2025-03-04T14:00:00.000Z',
      end_time: '2025-03-04T15:00:00.000Z',
      recurrence_type: null,
    });
    const recurringPlan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans(
      [normalPlan, recurringPlan],
      rangeStart,
      rangeEnd,
    );
    // 通常プラン 1件 + 繰り返しプラン 7件以上
    expect(result.length).toBeGreaterThan(1);
    const normalEventResult = result.find((e: CalendarEvent) => e.id === 'normal-plan');
    expect(normalEventResult).toBeDefined();
  });

  it('親プランのタグIDが繰り返しインスタンスに引き継がれる', () => {
    const plan = {
      ...makePlan({
        id: 'recurring-plan',
        start_time: '2025-03-01T09:00:00.000Z',
        end_time: '2025-03-01T10:00:00.000Z',
        recurrence_type: 'daily',
      }),
      tagIds: ['tag-x', 'tag-y'],
    };
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.tagIds).toEqual(['tag-x', 'tag-y']);
    });
  });

  it('繰り返しインスタンスの instanceDate が "YYYY-MM-DD" 形式になる', () => {
    const plan = makePlan({
      id: 'recurring-plan',
      start_time: '2025-03-01T09:00:00.000Z',
      end_time: '2025-03-01T10:00:00.000Z',
      recurrence_type: 'daily',
    });
    const result = expandRecurringPlansToCalendarPlans([plan], rangeStart, rangeEnd);
    result.forEach((event: CalendarEvent) => {
      expect(event.instanceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
