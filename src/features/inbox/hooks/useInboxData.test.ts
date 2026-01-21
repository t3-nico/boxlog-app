import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { matchesDueDateFilter, planToInboxItem, type PlanWithTagIds } from './useInboxData';

// テスト用のモックプラン
const createMockPlan = (overrides: Partial<PlanWithTagIds> = {}): PlanWithTagIds => ({
  id: 'test-id',
  user_id: 'user-1',
  title: 'テストプラン',
  description: null,
  status: 'open',
  completed_at: null,
  due_date: null,
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

describe('useInboxData', () => {
  describe('matchesDueDateFilter', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // 2025年1月15日（水曜日）に固定
      vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('all フィルター', () => {
      it('すべての期限にマッチする', () => {
        expect(matchesDueDateFilter('2025-01-15', 'all')).toBe(true);
        expect(matchesDueDateFilter('2025-01-01', 'all')).toBe(true);
        expect(matchesDueDateFilter('2025-12-31', 'all')).toBe(true);
        expect(matchesDueDateFilter(null, 'all')).toBe(true);
        expect(matchesDueDateFilter(undefined, 'all')).toBe(true);
      });
    });

    describe('no_due_date フィルター', () => {
      it('期限なしにマッチする', () => {
        expect(matchesDueDateFilter(null, 'no_due_date')).toBe(true);
        expect(matchesDueDateFilter(undefined, 'no_due_date')).toBe(true);
      });

      it('期限ありにはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-15', 'no_due_date')).toBe(false);
        expect(matchesDueDateFilter('2025-01-01', 'no_due_date')).toBe(false);
      });
    });

    describe('today フィルター', () => {
      it('今日の日付にマッチする', () => {
        expect(matchesDueDateFilter('2025-01-15', 'today')).toBe(true);
      });

      it('昨日・明日にはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-14', 'today')).toBe(false);
        expect(matchesDueDateFilter('2025-01-16', 'today')).toBe(false);
      });

      it('期限なしにはマッチしない', () => {
        expect(matchesDueDateFilter(null, 'today')).toBe(false);
      });
    });

    describe('tomorrow フィルター', () => {
      it('明日の日付にマッチする', () => {
        expect(matchesDueDateFilter('2025-01-16', 'tomorrow')).toBe(true);
      });

      it('今日・明後日にはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-15', 'tomorrow')).toBe(false);
        expect(matchesDueDateFilter('2025-01-17', 'tomorrow')).toBe(false);
      });

      it('期限なしにはマッチしない', () => {
        expect(matchesDueDateFilter(null, 'tomorrow')).toBe(false);
      });
    });

    describe('this_week フィルター', () => {
      it('今週中の日付にマッチする', () => {
        // 1/15(水)〜1/18(土) = 今週
        expect(matchesDueDateFilter('2025-01-15', 'this_week')).toBe(true);
        expect(matchesDueDateFilter('2025-01-16', 'this_week')).toBe(true);
        expect(matchesDueDateFilter('2025-01-18', 'this_week')).toBe(true);
      });

      it('先週・来週にはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-14', 'this_week')).toBe(false); // 昨日
        expect(matchesDueDateFilter('2025-01-19', 'this_week')).toBe(false); // 来週
      });

      it('期限なしにはマッチしない', () => {
        expect(matchesDueDateFilter(null, 'this_week')).toBe(false);
      });
    });

    describe('next_week フィルター', () => {
      it('来週の日付にマッチする', () => {
        // 1/19(日)〜1/25(土) = 来週
        expect(matchesDueDateFilter('2025-01-19', 'next_week')).toBe(true);
        expect(matchesDueDateFilter('2025-01-22', 'next_week')).toBe(true);
        expect(matchesDueDateFilter('2025-01-25', 'next_week')).toBe(true);
      });

      it('今週・再来週にはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-18', 'next_week')).toBe(false); // 今週
        expect(matchesDueDateFilter('2025-01-26', 'next_week')).toBe(false); // 再来週
      });

      it('期限なしにはマッチしない', () => {
        expect(matchesDueDateFilter(null, 'next_week')).toBe(false);
      });
    });

    describe('overdue フィルター', () => {
      it('過去の期限にマッチする', () => {
        expect(matchesDueDateFilter('2025-01-14', 'overdue')).toBe(true);
        expect(matchesDueDateFilter('2025-01-01', 'overdue')).toBe(true);
        expect(matchesDueDateFilter('2024-12-31', 'overdue')).toBe(true);
      });

      it('今日以降にはマッチしない', () => {
        expect(matchesDueDateFilter('2025-01-15', 'overdue')).toBe(false);
        expect(matchesDueDateFilter('2025-01-16', 'overdue')).toBe(false);
      });

      it('期限なしにはマッチしない', () => {
        expect(matchesDueDateFilter(null, 'overdue')).toBe(false);
      });
    });
  });

  describe('planToInboxItem', () => {
    it('基本的なプランを変換できる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        title: 'タスク1',
        status: 'open',
        description: '説明文',
      });

      const result = planToInboxItem(plan);

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

      const result = planToInboxItem(plan);

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

      const result = planToInboxItem(plan);

      expect(result.status).toBe('closed');
    });

    it('tagIdsが正しくパススルーされる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        tagIds: ['tag-1', 'tag-2'],
      });

      const result = planToInboxItem(plan);

      expect(result.tagIds).toHaveLength(2);
      expect(result.tagIds?.[0]).toBe('tag-1');
      expect(result.tagIds?.[1]).toBe('tag-2');
    });

    it('tagIdsがない場合はundefinedになる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        // tagIdsを省略
      });

      const result = planToInboxItem(plan);

      expect(result.tagIds).toBeUndefined();
    });

    it('tagIdsが空配列の場合は空配列がパススルーされる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        tagIds: [],
      });

      const result = planToInboxItem(plan);

      expect(result.tagIds).toEqual([]);
    });

    it('期限関連のフィールドを正しく変換する', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        due_date: '2025-01-20',
        start_time: '2025-01-20T09:00:00Z',
        end_time: '2025-01-20T10:00:00Z',
        recurrence_type: 'daily',
        recurrence_end_date: '2025-02-20',
        recurrence_rule: 'FREQ=DAILY;COUNT=30',
      });

      const result = planToInboxItem(plan);

      expect(result.due_date).toBe('2025-01-20');
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

      const result = planToInboxItem(plan);

      expect(result.created_at).toBe(now.toISOString());
      expect(result.updated_at).toBe(now.toISOString());

      vi.useRealTimers();
    });

    it('descriptionがnullの場合はundefinedになる', () => {
      const plan = createMockPlan({
        id: 'plan-1',
        description: null,
      });

      const result = planToInboxItem(plan);

      expect(result.description).toBeUndefined();
    });
  });
});
