import { describe, expect, it } from 'vitest';

import type { Plan } from '../types/plan';

import { isOverdue, isScheduled, normalizeStatus } from './status';

// テスト用のモックプラン作成ヘルパー
const createMockPlan = (overrides: Partial<Plan>): Plan => ({
  id: 'plan-1',
  user_id: 'user-1',
  title: 'テスト',
  description: null,
  status: 'open',
  completed_at: null,
  start_time: null,
  end_time: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('status', () => {
  describe('normalizeStatus', () => {
    describe('新ステータス値', () => {
      it('openはopenを返す', () => {
        expect(normalizeStatus('open')).toBe('open');
      });

      it('doneはdoneを返す', () => {
        expect(normalizeStatus('closed')).toBe('closed');
      });
    });

    describe('旧ステータス値のマッピング', () => {
      it('todoはopenにマッピングされる', () => {
        expect(normalizeStatus('todo')).toBe('open');
      });

      it('doingはopenにマッピングされる', () => {
        expect(normalizeStatus('doing')).toBe('open');
      });

      it('backlogはopenにマッピングされる', () => {
        expect(normalizeStatus('backlog')).toBe('open');
      });

      it('readyはopenにマッピングされる', () => {
        expect(normalizeStatus('ready')).toBe('open');
      });

      it('activeはopenにマッピングされる', () => {
        expect(normalizeStatus('active')).toBe('open');
      });

      it('waitはopenにマッピングされる', () => {
        expect(normalizeStatus('wait')).toBe('open');
      });

      it('cancelはdoneにマッピングされる', () => {
        expect(normalizeStatus('cancel')).toBe('closed');
      });

      it('未知のステータスはopenにマッピングされる', () => {
        expect(normalizeStatus('unknown_status')).toBe('open');
      });
    });
  });

  describe('isScheduled', () => {
    it('start_timeとend_timeが両方あればtrueを返す', () => {
      const plan = createMockPlan({
        start_time: '2025-01-01T09:00:00Z',
        end_time: '2025-01-01T10:00:00Z',
      });
      expect(isScheduled(plan)).toBe(true);
    });

    it('start_timeがなければfalseを返す', () => {
      const plan = createMockPlan({
        start_time: null,
        end_time: '2025-01-01T10:00:00Z',
      });
      expect(isScheduled(plan)).toBe(false);
    });

    it('end_timeがなければfalseを返す', () => {
      const plan = createMockPlan({
        start_time: '2025-01-01T09:00:00Z',
        end_time: null,
      });
      expect(isScheduled(plan)).toBe(false);
    });

    it('両方なければfalseを返す', () => {
      const plan = createMockPlan({
        start_time: null,
        end_time: null,
      });
      expect(isScheduled(plan)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('doneステータスはfalseを返す', () => {
      const plan = createMockPlan({
        status: 'closed',
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
      });
      expect(isOverdue(plan)).toBe(false);
    });

    it('end_timeがなければfalseを返す', () => {
      const plan = createMockPlan({
        status: 'open',
        start_time: null,
        end_time: null,
      });
      expect(isOverdue(plan)).toBe(false);
    });

    it('end_timeが過去で未完了ならtrueを返す', () => {
      const plan = createMockPlan({
        status: 'open',
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
      });
      expect(isOverdue(plan)).toBe(true);
    });

    it('end_timeが未来で未完了ならfalseを返す', () => {
      const plan = createMockPlan({
        status: 'open',
        start_time: null,
        end_time: '2099-01-01T10:00:00Z', // 未来
      });
      expect(isOverdue(plan)).toBe(false);
    });

    it('旧ステータス（backlog）でも正しく判定する', () => {
      const plan = createMockPlan({
        status: 'backlog' as unknown as 'open',
        start_time: null,
        end_time: '2020-01-01T10:00:00Z', // 過去
      });
      expect(isOverdue(plan)).toBe(true);
    });
  });
});
