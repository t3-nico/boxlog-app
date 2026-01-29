import { describe, expect, it } from 'vitest';

import type { TimedPlan } from '../types/plan.types';

import { detectOverlapGroups, plansOverlap } from './planPositioning';

describe('planPositioning', () => {
  const createTimedPlan = (
    id: string,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ): TimedPlan => ({
    id,
    title: `Plan ${id}`,
    start: new Date(2025, 0, 15, startHour, startMinute),
    end: new Date(2025, 0, 15, endHour, endMinute),
    startDate: new Date(2025, 0, 15, startHour, startMinute),
    endDate: new Date(2025, 0, 15, endHour, endMinute),
    type: 'plan',
    status: 'open',
    color: '#3b82f6',
    isRecurring: false,
    tagIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    displayStartDate: new Date(2025, 0, 15, startHour, startMinute),
    displayEndDate: new Date(2025, 0, 15, endHour, endMinute),
    duration: (endHour - startHour) * 60 + (endMinute - startMinute),
    isMultiDay: false,
  });

  describe('plansOverlap', () => {
    it('完全に重複するプランを検出する', () => {
      const plan1 = createTimedPlan('1', 10, 0, 11, 0); // 10:00-11:00
      const plan2 = createTimedPlan('2', 10, 30, 11, 30); // 10:30-11:30

      expect(plansOverlap(plan1, plan2)).toBe(true);
    });

    it('部分的に重複するプランを検出する', () => {
      const plan1 = createTimedPlan('1', 10, 0, 11, 0); // 10:00-11:00
      const plan2 = createTimedPlan('2', 10, 45, 12, 0); // 10:45-12:00

      expect(plansOverlap(plan1, plan2)).toBe(true);
    });

    it('完全に含まれるプランを検出する', () => {
      const plan1 = createTimedPlan('1', 10, 0, 12, 0); // 10:00-12:00
      const plan2 = createTimedPlan('2', 10, 30, 11, 0); // 10:30-11:00

      expect(plansOverlap(plan1, plan2)).toBe(true);
    });

    it('重複しないプランを判定する（連続）', () => {
      const plan1 = createTimedPlan('1', 10, 0, 11, 0); // 10:00-11:00
      const plan2 = createTimedPlan('2', 11, 0, 12, 0); // 11:00-12:00

      expect(plansOverlap(plan1, plan2)).toBe(false);
    });

    it('重複しないプランを判定する（離れている）', () => {
      const plan1 = createTimedPlan('1', 10, 0, 11, 0); // 10:00-11:00
      const plan2 = createTimedPlan('2', 12, 0, 13, 0); // 12:00-13:00

      expect(plansOverlap(plan1, plan2)).toBe(false);
    });

    it('逆順でも同じ結果が得られる', () => {
      const plan1 = createTimedPlan('1', 10, 0, 11, 0);
      const plan2 = createTimedPlan('2', 10, 30, 11, 30);

      expect(plansOverlap(plan1, plan2)).toBe(plansOverlap(plan2, plan1));
    });
  });

  describe('detectOverlapGroups', () => {
    it('重複しないプランは別々のグループになる', () => {
      const plans: TimedPlan[] = [
        createTimedPlan('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedPlan('2', 11, 0, 12, 0), // 11:00-12:00
        createTimedPlan('3', 12, 0, 13, 0), // 12:00-13:00
      ];

      const groups = detectOverlapGroups(plans);

      expect(groups).toHaveLength(3);
      expect(groups[0]).toHaveLength(1);
      expect(groups[1]).toHaveLength(1);
      expect(groups[2]).toHaveLength(1);
    });

    it('重複するプランは同じグループになる', () => {
      const plans: TimedPlan[] = [
        createTimedPlan('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedPlan('2', 10, 30, 11, 30), // 10:30-11:30（plan1と重複）
        createTimedPlan('3', 11, 0, 12, 0), // 11:00-12:00（plan2と重複）
      ];

      const groups = detectOverlapGroups(plans);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(3);
    });

    it('複数のグループが正しく検出される', () => {
      const plans: TimedPlan[] = [
        createTimedPlan('1', 10, 0, 11, 0), // Group 1
        createTimedPlan('2', 10, 30, 11, 30), // Group 1
        createTimedPlan('3', 12, 0, 13, 0), // Group 2
        createTimedPlan('4', 12, 30, 13, 30), // Group 2
        createTimedPlan('5', 14, 0, 15, 0), // Group 3
      ];

      const groups = detectOverlapGroups(plans);

      expect(groups).toHaveLength(3);
      expect(groups[0]).toHaveLength(2); // plan1, plan2
      expect(groups[1]).toHaveLength(2); // plan3, plan4
      expect(groups[2]).toHaveLength(1); // plan5
    });

    it('空配列の場合は空配列を返す', () => {
      const groups = detectOverlapGroups([]);
      expect(groups).toHaveLength(0);
    });

    it('単一プランの場合は1グループを返す', () => {
      const plans: TimedPlan[] = [createTimedPlan('1', 10, 0, 11, 0)];

      const groups = detectOverlapGroups(plans);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
    });

    it('開始時刻が異なる場合でもソートされる', () => {
      const plans: TimedPlan[] = [
        createTimedPlan('3', 12, 0, 13, 0),
        createTimedPlan('1', 10, 0, 11, 0),
        createTimedPlan('2', 11, 0, 12, 0),
      ];

      const groups = detectOverlapGroups(plans);

      // ソートされていることを確認（グループ分けが正しいかチェック）
      expect(groups).toHaveLength(3);
    });
  });
});
