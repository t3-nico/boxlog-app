import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CalendarPlan } from '../../types/calendar.types';
import { useAllOverduePlans } from '../useOverduePlans';

function createMockPlan(overrides: Partial<CalendarPlan> = {}): CalendarPlan {
  return {
    id: 'plan-1',
    title: 'Test Plan',
    status: 'open',
    startDate: new Date('2026-02-20T09:00:00'),
    endDate: new Date('2026-02-20T10:00:00'),
    color: '#3b82f6',
    tagIds: [],
    ...overrides,
  } as CalendarPlan;
}

describe('useAllOverduePlans', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('期限切れのopenプランを抽出する', () => {
    const plans = [
      createMockPlan({
        id: 'overdue-1',
        status: 'open',
        endDate: new Date('2026-02-21T10:00:00'), // 2時間前
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.plan.id).toBe('overdue-1');
    expect(result.current[0]!.overdueMinutes).toBe(120);
  });

  it('closedプランは除外する', () => {
    const plans = [
      createMockPlan({
        id: 'closed-1',
        status: 'closed',
        endDate: new Date('2026-02-21T10:00:00'), // 過去だがclosed
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current).toHaveLength(0);
  });

  it('endDateがないプランは除外する', () => {
    const plans = [
      createMockPlan({
        id: 'no-end-1',
        status: 'open',
        endDate: null,
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current).toHaveLength(0);
  });

  it('まだ期限内のプランは除外する', () => {
    const plans = [
      createMockPlan({
        id: 'future-1',
        status: 'open',
        endDate: new Date('2026-02-21T14:00:00'), // 2時間後
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current).toHaveLength(0);
  });

  it('空配列を渡した場合は空配列を返す', () => {
    const { result } = renderHook(() => useAllOverduePlans([]));
    expect(result.current).toHaveLength(0);
  });

  it('超過分数が正しく計算される', () => {
    const plans = [
      createMockPlan({
        id: 'overdue-30min',
        status: 'open',
        endDate: new Date('2026-02-21T11:30:00'), // 30分前
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current[0]!.overdueMinutes).toBe(30);
  });

  it('複数の期限切れプランを正しく返す', () => {
    const plans = [
      createMockPlan({
        id: 'overdue-1',
        status: 'open',
        endDate: new Date('2026-02-21T10:00:00'),
      }),
      createMockPlan({
        id: 'on-time',
        status: 'open',
        endDate: new Date('2026-02-21T14:00:00'),
      }),
      createMockPlan({
        id: 'overdue-2',
        status: 'open',
        endDate: new Date('2026-02-21T11:00:00'),
      }),
      createMockPlan({
        id: 'closed',
        status: 'closed',
        endDate: new Date('2026-02-20T10:00:00'),
      }),
    ];

    const { result } = renderHook(() => useAllOverduePlans(plans));

    expect(result.current).toHaveLength(2);
    const ids = result.current.map((o) => o.plan.id);
    expect(ids).toContain('overdue-1');
    expect(ids).toContain('overdue-2');
  });
});
