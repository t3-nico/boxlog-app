import { describe, expect, it } from 'vitest';

import type { CalendarPlan } from '../types/calendar.types';

import {
  detectFridayToMondayPlans,
  filterWeekendPlans,
  splitCrossWeekPlans,
} from './crossWeekPlanHelpers';

describe('crossWeekPlanHelpers', () => {
  describe('splitCrossWeekPlans', () => {
    it('単日プランはそのまま返す', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: 'ミーティング',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-15T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const weekStart = new Date('2024-06-10');
      const segments = splitCrossWeekPlans(plans, true, weekStart);

      expect(segments).toHaveLength(1);
      expect(segments[0]!.segmentType).toBe('full');
      expect(segments[0]!.isPartialSegment).toBe(false);
    });

    it('複数日プランを分割する', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: '長期プラン',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-17T18:00:00'),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-17T18:00:00'),
          duration: 60,
          isMultiDay: true,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const weekStart = new Date('2024-06-10');
      const segments = splitCrossWeekPlans(plans, true, weekStart);

      expect(segments.length).toBeGreaterThan(1);
      expect(segments[0]!.segmentType).toBe('start');
      expect(segments[segments.length - 1]!.segmentType).toBe('end');
    });

    it('週末表示OFF時は土日をスキップする', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: '金曜から月曜',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜
          endDate: new Date('2024-06-17T18:00:00'), // 月曜
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-14T10:00:00'),
          displayEndDate: new Date('2024-06-17T18:00:00'),
          duration: 60,
          isMultiDay: true,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const weekStart = new Date('2024-06-10');
      const segments = splitCrossWeekPlans(plans, false, weekStart); // showWeekends: false

      // 土日がスキップされるため、金曜と月曜のみ
      const segmentDays = segments.map((s) => s.segmentStart.getDay());
      expect(segmentDays).not.toContain(0); // 日曜
      expect(segmentDays).not.toContain(6); // 土曜
    });

    it('startDate/endDateがnullの場合はフルプランとして扱う', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: 'プラン',
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
        },
      ];

      const weekStart = new Date('2024-06-10');
      const segments = splitCrossWeekPlans(plans, true, weekStart);

      expect(segments).toHaveLength(1);
      expect(segments[0]!.segmentType).toBe('full');
    });
  });

  describe('filterWeekendPlans', () => {
    it('週末（土日）のプランのみ返す', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: '金曜プラン',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜
          endDate: new Date('2024-06-14T11:00:00'),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-14T10:00:00'),
          displayEndDate: new Date('2024-06-14T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-2',
          title: '土曜プラン',
          startDate: new Date('2024-06-15T10:00:00'), // 土曜（2024-06-15は土曜日）
          endDate: new Date('2024-06-15T11:00:00'),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-15T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-3',
          title: '日曜プラン',
          startDate: new Date('2024-06-16T10:00:00'), // 日曜
          endDate: new Date('2024-06-16T11:00:00'),
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-16T10:00:00'),
          displayEndDate: new Date('2024-06-16T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const dateRange = {
        start: new Date('2024-06-10'),
        end: new Date('2024-06-17'),
      };

      const weekendPlans = filterWeekendPlans(plans, dateRange);

      // 2024-06-15は土曜、2024-06-16は日曜
      expect(weekendPlans.length).toBeGreaterThanOrEqual(1);
      const weekendIds = weekendPlans.map((p) => p.id);
      expect(weekendIds).toContain('plan-2');
    });

    it('startDateがnullの場合は除外する', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: 'プラン',
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
        },
      ];

      const dateRange = {
        start: new Date('2024-06-10'),
        end: new Date('2024-06-16'),
      };

      const weekendPlans = filterWeekendPlans(plans, dateRange);

      expect(weekendPlans).toHaveLength(0);
    });
  });

  describe('detectFridayToMondayPlans', () => {
    it('金曜から月曜にまたがるプランを検出する', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: '金→月プラン',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜（day=5）
          endDate: new Date('2024-06-17T18:00:00'), // 月曜（day=1）
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-14T10:00:00'),
          displayEndDate: new Date('2024-06-17T18:00:00'),
          duration: 60,
          isMultiDay: true,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-2',
          title: '土→日プラン',
          startDate: new Date('2024-06-15T10:00:00'), // 土曜（day=6）
          endDate: new Date('2024-06-16T18:00:00'), // 日曜（day=0）
          status: 'open',
          color: '#3b82f6',
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-16T18:00:00'),
          duration: 60,
          isMultiDay: true,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const fridayToMonday = detectFridayToMondayPlans(plans);

      expect(fridayToMonday).toHaveLength(1);
      expect(fridayToMonday[0]!.id).toBe('plan-1');
    });

    it('startDate/endDateがnullの場合は除外する', () => {
      const plans: CalendarPlan[] = [
        {
          id: 'plan-1',
          title: 'プラン',
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
        },
      ];

      const fridayToMonday = detectFridayToMondayPlans(plans);

      expect(fridayToMonday).toHaveLength(0);
    });
  });
});
