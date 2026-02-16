import { describe, expect, it, vi } from 'vitest';

import { planToPlanItem, type PlanWithTagIds } from './usePlanData';

// テスト用のモックプラン
const createMockPlan = (overrides: Partial<PlanWithTagIds> = {}): PlanWithTagIds => ({
  id: 'test-id',
  user_id: 'user-1',
  title: 'テストプラン',
  description: null,
  status: 'open',
  completed_at: null,
  start_time: null,
  end_time: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('usePlanData', () => {
  describe('planToPlanItem', () => {
    it('基本的なプランを変換できる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        title: 'タスク1',
        status: 'open',
        description: '説明文',
      });

      const result = planToPlanItem(plan);

      expect(result.id).toBe('plan-1');
      expect(result.type).toBe('plan');
      expect(result.title).toBe('タスク1');
      expect(result.status).toBe('open');
      expect(result.description).toBe('説明文');
    });

    it('start_timeがあるプランでもopenのまま（doingは廃止）', () => {
      const plan = createMockPlan({
        id: 'plan-2',
        title: 'スケジュール済みタスク',
        status: 'open',
        start_time: '2025-01-20T09:00:00Z',
        end_time: '2025-01-20T10:00:00Z',
      });

      const result = planToPlanItem(plan);

      expect(result.status).toBe('open'); // doing廃止によりopenのまま
    });

    it('doneのプランはstart_timeに関係なくdoneのまま', () => {
      const plan = createMockPlan({
        id: 'plan-3',
        title: '完了済みタスク',
        status: 'closed',
        start_time: '2025-01-20T09:00:00Z',
        end_time: '2025-01-20T10:00:00Z',
      });

      const result = planToPlanItem(plan);

      expect(result.status).toBe('closed');
    });

    it('tagIdsが正しくパススルーされる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        tagIds: ['tag-1', 'tag-2'],
      });

      const result = planToPlanItem(plan);

      expect(result.tagIds).toHaveLength(2);
      expect(result.tagIds?.[0]).toBe('tag-1');
      expect(result.tagIds?.[1]).toBe('tag-2');
    });

    it('tagIdsがない場合はundefinedになる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        // tagIdsを省略
      });

      const result = planToPlanItem(plan);

      expect(result.tagIds).toBeUndefined();
    });

    it('tagIdsが空配列の場合は空配列がパススルーされる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        tagIds: [],
      });

      const result = planToPlanItem(plan);

      expect(result.tagIds).toEqual([]);
    });

    it('時間・繰り返し関連のフィールドを正しく変換する', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        start_time: '2025-01-20T09:00:00Z',
        end_time: '2025-01-20T10:00:00Z',
        recurrence_type: 'daily',
        recurrence_end_date: '2025-02-20',
        recurrence_rule: 'FREQ=DAILY;COUNT=30',
      });

      const result = planToPlanItem(plan);

      expect(result.start_time).toBe('2025-01-20T09:00:00Z');
      expect(result.end_time).toBe('2025-01-20T10:00:00Z');
      expect(result.recurrence_type).toBe('daily');
      expect(result.recurrence_end_date).toBe('2025-02-20');
      expect(result.recurrence_rule).toBe('FREQ=DAILY;COUNT=30');
    });

    it('created_atがnullの場合は現在時刻を使用する', () => {
      vi.useFakeTimers();
      const now = new Date('2025-01-15T12:00:00Z');
      vi.setSystemTime(now);

      const plan = createMockPlan({
        id: 'plan-1',
        created_at: null,
        updated_at: null,
      });

      const result = planToPlanItem(plan);

      expect(result.created_at).toBe(now.toISOString());
      expect(result.updated_at).toBe(now.toISOString());

      vi.useRealTimers();
    });

    it('descriptionがnullの場合はundefinedになる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        description: null,
      });

      const result = planToPlanItem(plan);

      expect(result.description).toBeUndefined();
    });
  });
});
