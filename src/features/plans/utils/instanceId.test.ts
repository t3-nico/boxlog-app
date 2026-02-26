import { describe, expect, it } from 'vitest';

import type { CalendarPlan } from '@/core/types/calendar-event';

import { decodeInstanceId, encodeInstanceId, getInstanceRef } from './instanceId';

describe('instanceId', () => {
  describe('encodeInstanceId', () => {
    it('parentPlanIdとinstanceDateから合成IDを生成する', () => {
      expect(encodeInstanceId('plan-123', '2025-01-15')).toBe('plan-123_2025-01-15');
    });

    it('UUIDを含むparentPlanIdでも正しく動作する', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      expect(encodeInstanceId(uuid, '2025-06-01')).toBe(`${uuid}_2025-06-01`);
    });
  });

  describe('decodeInstanceId', () => {
    it('合成IDからparentPlanIdとinstanceDateを復元する', () => {
      const result = decodeInstanceId('plan-123_2025-01-15');
      expect(result).toEqual({
        parentPlanId: 'plan-123',
        instanceDate: '2025-01-15',
      });
    });

    it('UUIDを含む合成IDを正しくデコードする', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const result = decodeInstanceId(`${uuid}_2025-06-01`);
      expect(result).toEqual({
        parentPlanId: uuid,
        instanceDate: '2025-06-01',
      });
    });

    it('parentPlanIdにアンダースコアが含まれる場合もlastIndexOfで正しくデコードする', () => {
      const result = decodeInstanceId('plan_with_underscores_2025-03-20');
      expect(result).toEqual({
        parentPlanId: 'plan_with_underscores',
        instanceDate: '2025-03-20',
      });
    });

    it('日付形式でない末尾の場合はnullを返す', () => {
      expect(decodeInstanceId('plan-123_notadate')).toBeNull();
    });

    it('セパレーターがない場合はnullを返す', () => {
      expect(decodeInstanceId('plan123')).toBeNull();
    });

    it('空文字列の場合はnullを返す', () => {
      expect(decodeInstanceId('')).toBeNull();
    });

    it('parentPlanIdが空の場合はnullを返す', () => {
      expect(decodeInstanceId('_2025-01-15')).toBeNull();
    });
  });

  describe('getInstanceRef', () => {
    const createMockCalendarPlan = (overrides: Partial<CalendarPlan> = {}): CalendarPlan =>
      ({
        id: 'plan-1',
        title: 'Test',
        startDate: new Date('2025-01-15T09:00:00Z'),
        endDate: new Date('2025-01-15T10:00:00Z'),
        status: 'open',
        isRecurring: false,
        ...overrides,
      }) as CalendarPlan;

    it('優先度1: originalPlanIdとinstanceDateがある場合はそれを使用', () => {
      const plan = createMockCalendarPlan({
        id: 'parent-plan_2025-01-15',
        originalPlanId: 'parent-plan',
        instanceDate: '2025-01-15',
        calendarId: 'parent-plan',
      });

      const result = getInstanceRef(plan);
      expect(result).toEqual({
        parentPlanId: 'parent-plan',
        instanceDate: '2025-01-15',
      });
    });

    it('優先度2: 合成IDからデコード（calendarIdがあればそちらを使用）', () => {
      const plan = createMockCalendarPlan({
        id: 'some-plan_2025-02-10',
        calendarId: 'real-parent-id',
        originalPlanId: undefined,
        instanceDate: undefined,
      });

      const result = getInstanceRef(plan);
      expect(result).toEqual({
        parentPlanId: 'real-parent-id',
        instanceDate: '2025-02-10',
      });
    });

    it('優先度2: calendarIdがない場合はデコードされたparentPlanIdを使用', () => {
      const plan = createMockCalendarPlan({
        id: 'decoded-plan_2025-03-05',
        calendarId: undefined,
        originalPlanId: undefined,
        instanceDate: undefined,
      });

      const result = getInstanceRef(plan);
      expect(result).toEqual({
        parentPlanId: 'decoded-plan',
        instanceDate: '2025-03-05',
      });
    });

    it('優先度3: calendarId + startDateフォールバック', () => {
      const plan = createMockCalendarPlan({
        id: 'non-composite-id',
        calendarId: 'parent-plan',
        originalPlanId: undefined,
        instanceDate: undefined,
        startDate: new Date('2025-04-20T09:00:00Z'),
      });

      const result = getInstanceRef(plan);
      expect(result).toEqual({
        parentPlanId: 'parent-plan',
        instanceDate: '2025-04-20',
      });
    });

    it('情報不足の場合はnullを返す', () => {
      const plan = createMockCalendarPlan({
        id: 'plain-id',
        calendarId: undefined,
        originalPlanId: undefined,
        instanceDate: undefined,
        startDate: null,
      });

      const result = getInstanceRef(plan);
      expect(result).toBeNull();
    });
  });
});
