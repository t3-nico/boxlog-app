import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '../../types/calendar.types';

import type { TimedPlan } from '../../components/views/shared/types/plan.types';

import {
  calculateMaxConcurrent,
  calculatePlanLayouts,
  calculatePlanPosition,
  computeActualTimeDiffOverlay,
  detectOverlapGroups,
  filterPlansByDate,
  findOverlapGroups,
  isOverlapping,
  plansOverlap,
  sortTimedPlans,
} from '../layout';

// ========================================
// テストヘルパー
// ========================================

function createTimedPlan(overrides: Partial<TimedPlan> & { start: Date; end: Date }): TimedPlan {
  return {
    id: 'test-1',
    title: 'Test Plan',
    startDate: overrides.start,
    endDate: overrides.end,
    displayStartDate: overrides.start,
    displayEndDate: overrides.end,
    duration: (overrides.end.getTime() - overrides.start.getTime()) / 60000,
    isMultiDay: false,
    isRecurring: false,
    status: 'open',
    color: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as TimedPlan;
}

function createCalendarEvent(
  overrides: Partial<CalendarEvent> & { startDate: Date; endDate: Date },
): CalendarEvent {
  return {
    id: 'test-1',
    title: 'Test Event',
    displayStartDate: overrides.startDate,
    displayEndDate: overrides.endDate,
    duration: (overrides.endDate.getTime() - overrides.startDate.getTime()) / 60000,
    isMultiDay: false,
    isRecurring: false,
    status: 'open',
    color: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as CalendarEvent;
}

// ========================================
// calculatePlanLayouts
// ========================================

describe('calculatePlanLayouts', () => {
  it('空配列で空のレイアウトを返す', () => {
    expect(calculatePlanLayouts([])).toEqual([]);
  });

  it('単一プランはfull widthで配置', () => {
    const plan = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const layouts = calculatePlanLayouts([plan]);

    expect(layouts).toHaveLength(1);
    expect(layouts[0]!.column).toBe(0);
    expect(layouts[0]!.totalColumns).toBe(1);
    expect(layouts[0]!.width).toBe(100);
    expect(layouts[0]!.left).toBe(0);
  });

  it('重複する2プランは50%ずつに分割', () => {
    const plan1 = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const plan2 = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T10:30:00'),
      end: new Date('2026-01-15T11:30:00'),
    });
    const layouts = calculatePlanLayouts([plan1, plan2]);

    expect(layouts).toHaveLength(2);
    expect(layouts[0]!.totalColumns).toBe(2);
    expect(layouts[1]!.totalColumns).toBe(2);
    expect(layouts[0]!.width).toBe(50);
    expect(layouts[1]!.width).toBe(50);
  });

  it('重複しない2プランは各自full width', () => {
    const plan1 = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const plan2 = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T12:00:00'),
      end: new Date('2026-01-15T13:00:00'),
    });
    const layouts = calculatePlanLayouts([plan1, plan2]);

    expect(layouts).toHaveLength(2);
    layouts.forEach((layout) => {
      expect(layout.totalColumns).toBe(1);
      expect(layout.width).toBe(100);
    });
  });

  it('同時刻の重複プランは開始時間順でカラム割当', () => {
    const first = createTimedPlan({
      id: 'first',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const second = createTimedPlan({
      id: 'second',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const layouts = calculatePlanLayouts([second, first]);

    expect(layouts).toHaveLength(2);
    expect(layouts[0]!.totalColumns).toBe(2);
    expect(layouts[1]!.totalColumns).toBe(2);
  });
});

// ========================================
// findOverlapGroups
// ========================================

describe('findOverlapGroups', () => {
  it('重複するプランをグループ化', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T10:30'),
        end: new Date('2026-01-15T11:30'),
      }),
      createTimedPlan({
        id: 'c',
        start: new Date('2026-01-15T14:00'),
        end: new Date('2026-01-15T15:00'),
      }),
    ];
    const groups = findOverlapGroups(plans);

    expect(groups).toHaveLength(2);
    expect(groups[0]!.plans).toHaveLength(2);
    expect(groups[1]!.plans).toHaveLength(1);
  });
});

// ========================================
// isOverlapping / plansOverlap
// ========================================

describe('isOverlapping', () => {
  it('時間が重なるプランはtrue', () => {
    const a = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00'),
      end: new Date('2026-01-15T11:00'),
    });
    const b = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T10:30'),
      end: new Date('2026-01-15T11:30'),
    });
    expect(isOverlapping(a, b)).toBe(true);
  });

  it('接触のみ（endとstartが同時刻）はfalse', () => {
    const a = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00'),
      end: new Date('2026-01-15T11:00'),
    });
    const b = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T11:00'),
      end: new Date('2026-01-15T12:00'),
    });
    expect(isOverlapping(a, b)).toBe(false);
  });

  it('完全に離れたプランはfalse', () => {
    const a = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00'),
      end: new Date('2026-01-15T11:00'),
    });
    const b = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T14:00'),
      end: new Date('2026-01-15T15:00'),
    });
    expect(isOverlapping(a, b)).toBe(false);
  });
});

describe('plansOverlap', () => {
  it('区間が交差するプランはtrue', () => {
    const a = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00'),
      end: new Date('2026-01-15T11:00'),
    });
    const b = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T10:30'),
      end: new Date('2026-01-15T11:30'),
    });
    expect(plansOverlap(a, b)).toBe(true);
  });

  it('接触のみはfalse', () => {
    const a = createTimedPlan({
      id: 'a',
      start: new Date('2026-01-15T10:00'),
      end: new Date('2026-01-15T11:00'),
    });
    const b = createTimedPlan({
      id: 'b',
      start: new Date('2026-01-15T11:00'),
      end: new Date('2026-01-15T12:00'),
    });
    expect(plansOverlap(a, b)).toBe(false);
  });
});

// ========================================
// calculateMaxConcurrent
// ========================================

describe('calculateMaxConcurrent', () => {
  it('重複なしは1を返す', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T12:00'),
        end: new Date('2026-01-15T13:00'),
      }),
    ];
    expect(calculateMaxConcurrent(plans)).toBe(1);
  });

  it('2つ重複は2を返す', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T10:30'),
        end: new Date('2026-01-15T11:30'),
      }),
    ];
    expect(calculateMaxConcurrent(plans)).toBe(2);
  });

  it('3つ同時重複は3を返す', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T12:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T10:30'),
        end: new Date('2026-01-15T11:30'),
      }),
      createTimedPlan({
        id: 'c',
        start: new Date('2026-01-15T11:00'),
        end: new Date('2026-01-15T12:00'),
      }),
    ];
    expect(calculateMaxConcurrent(plans)).toBe(3);
  });
});

// ========================================
// detectOverlapGroups
// ========================================

describe('detectOverlapGroups', () => {
  it('空配列で空配列を返す', () => {
    expect(detectOverlapGroups([])).toEqual([]);
  });

  it('重複するプランを同一グループに', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T10:30'),
        end: new Date('2026-01-15T11:30'),
      }),
    ];
    const groups = detectOverlapGroups(plans);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });
});

// ========================================
// calculatePlanPosition
// ========================================

describe('calculatePlanPosition', () => {
  it('10:00-11:00のプランを正しく配置（hourHeight=72）', () => {
    const plan = createTimedPlan({
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const column = { plans: [], columnIndex: 0, totalColumns: 1 };
    const pos = calculatePlanPosition(plan, column, 72);

    expect(pos.top).toBe(720); // 10 * 72
    expect(pos.height).toBe(72); // 1時間 * 72
    expect(pos.left).toBe(0);
    expect(pos.width).toBe(100);
  });

  it('最小高さ20pxを保証', () => {
    const plan = createTimedPlan({
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T10:05:00'), // 5分 = 6px
    });
    const column = { plans: [], columnIndex: 0, totalColumns: 1 };
    const pos = calculatePlanPosition(plan, column, 72);

    expect(pos.height).toBe(20);
  });

  it('2カラム中の2番目を正しく配置', () => {
    const plan = createTimedPlan({
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
    });
    const column = { plans: [], columnIndex: 1, totalColumns: 2 };
    const pos = calculatePlanPosition(plan, column, 72);

    expect(pos.left).toBe(50);
    expect(pos.width).toBe(50);
  });
});

// ========================================
// sortTimedPlans / filterPlansByDate
// ========================================

describe('sortTimedPlans', () => {
  it('開始時刻順にソート', () => {
    const plans = [
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T14:00'),
        end: new Date('2026-01-15T15:00'),
      }),
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
    ];
    const sorted = sortTimedPlans(plans);
    expect(sorted[0]!.id).toBe('a');
    expect(sorted[1]!.id).toBe('b');
  });

  it('元の配列を変更しない', () => {
    const plans = [
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-15T14:00'),
        end: new Date('2026-01-15T15:00'),
      }),
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
    ];
    sortTimedPlans(plans);
    expect(plans[0]!.id).toBe('b');
  });
});

describe('filterPlansByDate', () => {
  it('指定日のプランのみ返す', () => {
    const plans = [
      createTimedPlan({
        id: 'a',
        start: new Date('2026-01-15T10:00'),
        end: new Date('2026-01-15T11:00'),
      }),
      createTimedPlan({
        id: 'b',
        start: new Date('2026-01-16T10:00'),
        end: new Date('2026-01-16T11:00'),
      }),
    ];
    const filtered = filterPlansByDate(plans, new Date('2026-01-15'));
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('a');
  });
});

// ========================================
// computeActualTimeDiffOverlay
// ========================================

describe('computeActualTimeDiffOverlay', () => {
  it('常にNO_OVERLAYを返す（origin廃止後は差分オーバーレイ無効化）', () => {
    const event = createCalendarEvent({
      id: 'test',
      startDate: new Date('2026-01-15T10:00:00'),
      endDate: new Date('2026-01-15T11:00:00'),
      actualStartDate: new Date('2026-01-15T10:15:00'),
      actualEndDate: new Date('2026-01-15T11:00:00'),
      entryState: 'past',
    });
    const overlay = computeActualTimeDiffOverlay(event, 72);

    expect(overlay.topKind).toBe('none');
    expect(overlay.bottomKind).toBe('none');
    expect(overlay.topShift).toBe(0);
    expect(overlay.heightDelta).toBe(0);
  });
});
