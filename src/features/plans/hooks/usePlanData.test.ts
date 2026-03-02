import { describe, expect, it, vi } from 'vitest';

import { planToPlanItem, type PlanWithTagIds } from './usePlanData';

// テスト用のモックエントリ
const createMockEntry = (overrides: Partial<PlanWithTagIds> = {}): PlanWithTagIds => ({
  id: 'test-id',
  user_id: 'user-1',
  title: 'テストプラン',
  description: null,
  origin: 'planned',
  start_time: null,
  end_time: null,
  duration_minutes: null,
  fulfillment_score: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  reviewed_at: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  tagId: null,
  ...overrides,
});

describe('usePlanData', () => {
  describe('planToPlanItem', () => {
    it('基本的なエントリを変換できる', () => {
      const plan = createMockEntry({
        id: 'plan-1',
        title: 'タスク1',
        description: '説明文',
      });

      const result = planToPlanItem(plan);

      expect(result.id).toBe('plan-1');
      expect(result.type).toBe('plan');
      expect(result.title).toBe('タスク1');
      expect(result.description).toBe('説明文');
    });

    it('未来のstart_timeがあるエントリはopen', () => {
      const plan = createMockEntry({
        id: 'plan-2',
        title: 'スケジュール済みタスク',
        start_time: '2099-01-20T09:00:00Z',
        end_time: '2099-01-20T10:00:00Z',
      });

      const result = planToPlanItem(plan);

      expect(result.status).toBe('open');
    });

    it('過去のend_timeがあるエントリはclosed', () => {
      const plan = createMockEntry({
        id: 'plan-3',
        title: '完了済みタスク',
        start_time: '2020-01-20T09:00:00Z',
        end_time: '2020-01-20T10:00:00Z',
      });

      const result = planToPlanItem(plan);

      expect(result.status).toBe('closed');
    });

    it('tagIdが正しくパススルーされる', () => {
      const plan = createMockEntry({
        id: 'plan-1',
        tagId: 'tag-1',
      });

      const result = planToPlanItem(plan);

      expect(result.tagId).toBe('tag-1');
    });

    it('tagIdがnullの場合はnullがパススルーされる', () => {
      const plan = createMockEntry({
        id: 'plan-1',
        tagId: null,
      });

      const result = planToPlanItem(plan);

      expect(result.tagId).toBeNull();
    });

    it('時間・繰り返し関連のフィールドを正しく変換する', () => {
      const plan = createMockEntry({
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

      const plan = createMockEntry({
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
      const plan = createMockEntry({
        id: 'plan-1',
        description: null,
      });

      const result = planToPlanItem(plan);

      expect(result.description).toBeUndefined();
    });
  });
});
