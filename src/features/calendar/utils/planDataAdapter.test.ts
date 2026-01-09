import { describe, expect, it } from 'vitest';

import type { CalendarPlan as Plan } from '@/features/calendar/types/calendar.types';

import {
  planToTimedPlan,
  plansToTimedPlans,
  safePlanToTimedPlan,
  safePlansToTimedPlans,
  timedPlanToPlanUpdate,
} from './planDataAdapter';

describe('planDataAdapter', () => {
  describe('planToTimedPlan', () => {
    it('PlanStore形式をTimedPlan形式に変換する', () => {
      const plan: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        startDate: new Date('2024-06-15T10:00:00'),
        endDate: new Date('2024-06-15T11:00:00'),
        status: 'open',
        displayStartDate: new Date('2024-06-15T10:00:00'),
        displayEndDate: new Date('2024-06-15T11:00:00'),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = planToTimedPlan(plan);

      expect(result.id).toBe('plan-1');
      expect(result.title).toBe('ミーティング');
      expect(result.description).toBe('週次ミーティング');
      expect(result.color).toBe('#3b82f6');
      expect(result.start).toEqual(plan.startDate);
      expect(result.end).toEqual(plan.endDate);
      expect(result.isReadOnly).toBe(false);
    });

    it('完了済みプランは読み取り専用になる', () => {
      const plan: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: new Date(),
        endDate: new Date(),
        status: 'done',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = planToTimedPlan(plan);

      expect(result.isReadOnly).toBe(true);
    });

    it('openのプランは読み取り専用ではない', () => {
      const plan: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: new Date(),
        endDate: new Date(),
        status: 'open',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = planToTimedPlan(plan);

      expect(result.isReadOnly).toBe(false);
    });

    it('startDateがnullの場合は現在日時を使用する', () => {
      const plan: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: null,
        endDate: null,
        status: 'open',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = planToTimedPlan(plan);

      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });
  });

  describe('plansToTimedPlans', () => {
    it('複数のプランを変換する', () => {
      const plans: Plan[] = [
        {
          id: 'plan-1',
          title: 'ミーティング1',
          startDate: new Date(),
          endDate: new Date(),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date(),
          displayEndDate: new Date(),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-2',
          title: 'ミーティング2',
          startDate: new Date(),
          endDate: new Date(),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date(),
          displayEndDate: new Date(),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = plansToTimedPlans(plans);

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('plan-1');
      expect(result[1]!.id).toBe('plan-2');
    });
  });

  describe('timedPlanToPlanUpdate', () => {
    it('TimedPlan形式をPlanUpdate形式に変換する', () => {
      const timedPlan = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        start: new Date('2024-06-15T10:00:00'),
        end: new Date('2024-06-15T11:00:00'),
        isReadOnly: false,
      };

      const result = timedPlanToPlanUpdate(
        timedPlan as unknown as Parameters<typeof timedPlanToPlanUpdate>[0],
      );

      expect(result.id).toBe('plan-1');
      expect(result.title).toBe('ミーティング');
      expect(result.description).toBe('週次ミーティング');
      expect(result.color).toBe('#3b82f6');
      expect(result.startDate).toEqual(timedPlan.start);
      expect(result.endDate).toEqual(timedPlan.end);
    });
  });

  describe('safePlanToTimedPlan', () => {
    it('有効なプランを変換する', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        startDate: new Date('2024-06-15T10:00:00'),
        endDate: new Date('2024-06-15T11:00:00'),
      };

      const result = safePlanToTimedPlan(plan);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('plan-1');
      expect(result?.title).toBe('ミーティング');
    });

    it('idがない場合はnullを返す', () => {
      const plan: Partial<Plan> = {
        title: 'ミーティング',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result).toBeNull();
    });

    it('titleがない場合はnullを返す', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result).toBeNull();
    });

    it('descriptionがない場合は空文字をデフォルト値にする', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result?.description).toBe('');
    });

    it('colorがない場合は青色をデフォルト値にする', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result?.color).toBe('#3b82f6');
    });

    it('startDateがない場合は現在時刻を使用する', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result?.start).toBeInstanceOf(Date);
    });

    it('endDateがない場合は開始時刻+1時間を使用する', () => {
      const plan: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      };

      const result = safePlanToTimedPlan(plan);

      expect(result?.end).toBeInstanceOf(Date);
      if (result) {
        const diff = result.end.getTime() - result.start.getTime();
        expect(diff).toBe(60 * 60 * 1000); // 1時間
      }
    });
  });

  describe('safePlansToTimedPlans', () => {
    it('有効なプランのみ変換する', () => {
      const plans: Partial<Plan>[] = [
        { id: 'plan-1', title: 'ミーティング1' },
        { id: 'plan-2' }, // titleなし
        { title: 'ミーティング3' }, // idなし
        { id: 'plan-4', title: 'ミーティング4' },
      ];

      const result = safePlansToTimedPlans(plans);

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('plan-1');
      expect(result[1]!.id).toBe('plan-4');
    });

    it('空配列の場合は空配列を返す', () => {
      const result = safePlansToTimedPlans([]);

      expect(result).toEqual([]);
    });

    it('すべて無効なプランの場合は空配列を返す', () => {
      const plans: Partial<Plan>[] = [
        { id: 'plan-1' }, // titleなし
        { title: 'ミーティング' }, // idなし
      ];

      const result = safePlansToTimedPlans(plans);

      expect(result).toEqual([]);
    });
  });
});
