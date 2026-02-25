import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '@/core/types/calendar-event';

import type { RecordWithPlanInfo } from '../toCalendarEvent';
import { recordsToCalendarEvents, recordToCalendarEvent } from '../toCalendarEvent';

// テスト用ヘルパー: 最小限の RecordWithPlanInfo を生成
function makeRecord(overrides: Partial<RecordWithPlanInfo> = {}): RecordWithPlanInfo {
  return {
    id: 'record-uuid-001',
    plan_id: null,
    title: null,
    worked_at: '2025-03-10',
    start_time: '09:00:00',
    end_time: '10:00:00',
    duration_minutes: 60,
    fulfillment_score: null,
    description: null,
    created_at: '2025-03-10T09:00:00.000Z',
    updated_at: '2025-03-10T10:00:00.000Z',
    tagIds: [],
    plan: null,
    ...overrides,
  };
}

describe('recordToCalendarEvent', () => {
  describe('null 返却ケース', () => {
    it('start_time が null の場合は null を返す', () => {
      const record = makeRecord({ start_time: null });
      expect(recordToCalendarEvent(record)).toBeNull();
    });

    it('end_time が null の場合は null を返す', () => {
      const record = makeRecord({ end_time: null });
      expect(recordToCalendarEvent(record)).toBeNull();
    });

    it('start_time と end_time が両方 null の場合は null を返す', () => {
      const record = makeRecord({ start_time: null, end_time: null });
      expect(recordToCalendarEvent(record)).toBeNull();
    });
  });

  describe('フィールドマッピング', () => {
    it('id が "record-{record.id}" 形式になる', () => {
      const record = makeRecord({ id: 'abc-123' });
      const result = recordToCalendarEvent(record);
      expect(result?.id).toBe('record-abc-123');
    });

    it('typeが "record" に設定される', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.type).toBe('record');
    });

    it('recordId が record.id と一致する', () => {
      const record = makeRecord({ id: 'abc-123' });
      const result = recordToCalendarEvent(record);
      expect(result?.recordId).toBe('abc-123');
    });

    it('status が常に "closed" になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.status).toBe('closed');
    });

    it('color が空文字列になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.color).toBe('');
    });

    it('isMultiDay が false になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.isMultiDay).toBe(false);
    });

    it('isRecurring が false になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.isRecurring).toBe(false);
    });
  });

  describe('title 解決', () => {
    it('record.title がある場合はそれを使用する', () => {
      const record = makeRecord({
        title: 'Direct Title',
        plan: { id: 'plan-1', title: 'Plan Title', status: 'open' },
      });
      const result = recordToCalendarEvent(record);
      expect(result?.title).toBe('Direct Title');
    });

    it('record.title が null で plan.title がある場合は plan.title を使用する', () => {
      const record = makeRecord({
        title: null,
        plan: { id: 'plan-1', title: 'Plan Title', status: 'open' },
      });
      const result = recordToCalendarEvent(record);
      expect(result?.title).toBe('Plan Title');
    });

    it('record.title も plan.title もない場合は空文字列になる', () => {
      const record = makeRecord({ title: null, plan: null });
      const result = recordToCalendarEvent(record);
      expect(result?.title).toBe('');
    });
  });

  describe('description', () => {
    it('description が null の場合は undefined になる', () => {
      const record = makeRecord({ description: null });
      const result = recordToCalendarEvent(record);
      expect(result?.description).toBeUndefined();
    });

    it('description がある場合はそのままマッピングされる', () => {
      const record = makeRecord({ description: 'Work log note' });
      const result = recordToCalendarEvent(record);
      expect(result?.description).toBe('Work log note');
    });
  });

  describe('日時変換', () => {
    it('worked_at と start_time を組み合わせて startDate を生成する（HH:MM:SS 形式）', () => {
      const record = makeRecord({
        worked_at: '2025-03-10',
        start_time: '09:00:00',
      });
      const result = recordToCalendarEvent(record);
      expect(result?.startDate).toBeInstanceOf(Date);
      expect(result?.startDate?.getFullYear()).toBe(2025);
      expect(result?.startDate?.getMonth()).toBe(2); // March = 2
      expect(result?.startDate?.getDate()).toBe(10);
      expect(result?.startDate?.getHours()).toBe(9);
      expect(result?.startDate?.getMinutes()).toBe(0);
    });

    it('worked_at と end_time を組み合わせて endDate を生成する（HH:MM:SS 形式）', () => {
      const record = makeRecord({
        worked_at: '2025-03-10',
        end_time: '10:30:00',
      });
      const result = recordToCalendarEvent(record);
      expect(result?.endDate).toBeInstanceOf(Date);
      expect(result?.endDate?.getHours()).toBe(10);
      expect(result?.endDate?.getMinutes()).toBe(30);
    });

    it('start_time が HH:MM 形式（秒なし）でも正しく変換される', () => {
      const record = makeRecord({
        worked_at: '2025-03-10',
        start_time: '09:00',
        end_time: '10:00',
      });
      const result = recordToCalendarEvent(record);
      expect(result?.startDate).toBeInstanceOf(Date);
      expect(result?.startDate?.getHours()).toBe(9);
      expect(result?.startDate?.getMinutes()).toBe(0);
    });

    it('end_time が HH:MM 形式（秒なし）でも正しく変換される', () => {
      const record = makeRecord({
        worked_at: '2025-03-10',
        start_time: '09:00',
        end_time: '10:30',
      });
      const result = recordToCalendarEvent(record);
      expect(result?.endDate).toBeInstanceOf(Date);
      expect(result?.endDate?.getHours()).toBe(10);
      expect(result?.endDate?.getMinutes()).toBe(30);
    });

    it('created_at が正しく Date に変換される', () => {
      const record = makeRecord({ created_at: '2025-03-10T09:00:00.000Z' });
      const result = recordToCalendarEvent(record);
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.createdAt.toISOString()).toBe('2025-03-10T09:00:00.000Z');
    });

    it('updated_at が正しく Date に変換される', () => {
      const record = makeRecord({ updated_at: '2025-03-10T10:00:00.000Z' });
      const result = recordToCalendarEvent(record);
      expect(result?.updatedAt).toBeInstanceOf(Date);
      expect(result?.updatedAt.toISOString()).toBe('2025-03-10T10:00:00.000Z');
    });
  });

  describe('displayStartDate / displayEndDate', () => {
    it('displayStartDate が startDate と同じ値になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.displayStartDate.toISOString()).toBe(result?.startDate?.toISOString());
    });

    it('displayEndDate が endDate と同じ値になる', () => {
      const result = recordToCalendarEvent(makeRecord());
      expect(result?.displayEndDate.toISOString()).toBe(result?.endDate?.toISOString());
    });
  });

  describe('duration', () => {
    it('duration_minutes がそのまま duration にマッピングされる', () => {
      const record = makeRecord({ duration_minutes: 90 });
      const result = recordToCalendarEvent(record);
      expect(result?.duration).toBe(90);
    });

    it('duration_minutes が 0 でも正しくマッピングされる', () => {
      const record = makeRecord({ duration_minutes: 0 });
      const result = recordToCalendarEvent(record);
      expect(result?.duration).toBe(0);
    });
  });

  describe('tagIds', () => {
    it('tagIds が未定義の場合は空配列になる', () => {
      const record: RecordWithPlanInfo = {
        id: 'record-001',
        plan_id: null,
        title: null,
        worked_at: '2025-03-10',
        start_time: '09:00:00',
        end_time: '10:00:00',
        duration_minutes: 60,
        fulfillment_score: null,
        description: null,
        created_at: '2025-03-10T09:00:00.000Z',
        updated_at: '2025-03-10T10:00:00.000Z',
        plan: null,
        // tagIds を意図的に省略
      };
      const result = recordToCalendarEvent(record);
      expect(result?.tagIds).toEqual([]);
    });

    it('tagIds が渡された場合はそのまま引き継がれる', () => {
      const record = makeRecord({ tagIds: ['tag-1', 'tag-2'] });
      const result = recordToCalendarEvent(record);
      expect(result?.tagIds).toEqual(['tag-1', 'tag-2']);
    });
  });

  describe('fulfillmentScore', () => {
    it('fulfillment_score が null の場合は null になる', () => {
      const record = makeRecord({ fulfillment_score: null });
      const result = recordToCalendarEvent(record);
      expect(result?.fulfillmentScore).toBeNull();
    });

    it('fulfillment_score が数値の場合はそのままマッピングされる', () => {
      const record = makeRecord({ fulfillment_score: 4 });
      const result = recordToCalendarEvent(record);
      expect(result?.fulfillmentScore).toBe(4);
    });
  });

  describe('linkedPlanId / linkedPlanTitle', () => {
    it('plan_id が null の場合は linkedPlanId が undefined になる', () => {
      const record = makeRecord({ plan_id: null });
      const result = recordToCalendarEvent(record);
      expect(result?.linkedPlanId).toBeUndefined();
    });

    it('plan_id がある場合は linkedPlanId にマッピングされる', () => {
      const record = makeRecord({ plan_id: 'plan-abc' });
      const result = recordToCalendarEvent(record);
      expect(result?.linkedPlanId).toBe('plan-abc');
    });

    it('plan がない場合は linkedPlanTitle が undefined になる', () => {
      const record = makeRecord({ plan: null });
      const result = recordToCalendarEvent(record);
      expect(result?.linkedPlanTitle).toBeUndefined();
    });

    it('plan がある場合は linkedPlanTitle に plan.title がマッピングされる', () => {
      const record = makeRecord({
        plan: { id: 'plan-1', title: 'Design Work', status: 'open' },
      });
      const result = recordToCalendarEvent(record);
      expect(result?.linkedPlanTitle).toBe('Design Work');
    });
  });
});

describe('recordsToCalendarEvents', () => {
  it('空配列を渡すと空配列を返す', () => {
    const result = recordsToCalendarEvents([]);
    expect(result).toEqual([]);
  });

  it('複数の Record をすべて CalendarEvent に変換する', () => {
    const records = [
      makeRecord({ id: 'rec-001' }),
      makeRecord({ id: 'rec-002' }),
      makeRecord({ id: 'rec-003' }),
    ];
    const result = recordsToCalendarEvents(records);
    expect(result).toHaveLength(3);
  });

  it('start_time が null の Record はスキップされる', () => {
    const records = [
      makeRecord({ id: 'rec-001' }),
      makeRecord({ id: 'rec-002', start_time: null }),
      makeRecord({ id: 'rec-003' }),
    ];
    const result = recordsToCalendarEvents(records);
    expect(result).toHaveLength(2);
    const ids = result.map((e: CalendarEvent) => e.id);
    expect(ids).toContain('record-rec-001');
    expect(ids).toContain('record-rec-003');
    expect(ids).not.toContain('record-rec-002');
  });

  it('end_time が null の Record はスキップされる', () => {
    const records = [makeRecord({ id: 'rec-001' }), makeRecord({ id: 'rec-002', end_time: null })];
    const result = recordsToCalendarEvents(records);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('record-rec-001');
  });

  it('すべての Record が null の場合は空配列を返す', () => {
    const records = [
      makeRecord({ id: 'rec-001', start_time: null }),
      makeRecord({ id: 'rec-002', end_time: null }),
    ];
    const result = recordsToCalendarEvents(records);
    expect(result).toEqual([]);
  });

  it('変換結果の recordId が元の Record の id と一致する', () => {
    const records = [makeRecord({ id: 'rec-001' }), makeRecord({ id: 'rec-002' })];
    const result = recordsToCalendarEvents(records);
    expect(result[0]!.recordId).toBe('rec-001');
    expect(result[1]!.recordId).toBe('rec-002');
  });

  it('各 CalendarEvent の type が "record" になる', () => {
    const records = [makeRecord(), makeRecord({ id: 'rec-002' })];
    const result = recordsToCalendarEvents(records);
    result.forEach((event: CalendarEvent) => {
      expect(event.type).toBe('record');
    });
  });

  it('各 CalendarEvent の status が "closed" になる', () => {
    const records = [makeRecord(), makeRecord({ id: 'rec-002' })];
    const result = recordsToCalendarEvents(records);
    result.forEach((event: CalendarEvent) => {
      expect(event.status).toBe('closed');
    });
  });

  it('タグIDが各 CalendarEvent に引き継がれる', () => {
    const records = [
      makeRecord({ id: 'rec-001', tagIds: ['tag-a'] }),
      makeRecord({ id: 'rec-002', tagIds: ['tag-b', 'tag-c'] }),
    ];
    const result = recordsToCalendarEvents(records);
    expect(result[0]!.tagIds).toEqual(['tag-a']);
    expect(result[1]!.tagIds).toEqual(['tag-b', 'tag-c']);
  });
});
