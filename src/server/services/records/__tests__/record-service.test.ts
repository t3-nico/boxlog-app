/**
 * Record Service Unit Tests
 *
 * RecordServiceのビジネスロジックをモックを使用してテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabase } from '@/test/trpc-test-helpers';

import { createRecordService, RecordService, RecordServiceError } from '../record-service';

describe('RecordService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let service: RecordService;
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    service = createRecordService(
      mockSupabase as unknown as Parameters<typeof createRecordService>[0],
    );
  });

  describe('list', () => {
    it('should return records for user with tags', async () => {
      const mockRecords = [
        { id: 'record-1', worked_at: '2024-01-01', user_id: userId, plans: null },
        { id: 'record-2', worked_at: '2024-01-02', user_id: userId, plans: null },
      ];

      setupMockQueryWithTags(mockSupabase.from, mockRecords, new Map());

      const result = await service.list({ userId });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 'record-1' });
      expect(result[1]).toMatchObject({ id: 'record-2' });
    });

    it('should apply plan_id filter', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, plan_id: 'plan-1' });

      expect(mockQuery.eq).toHaveBeenCalledWith('plan_id', 'plan-1');
    });

    it('should apply date range filters', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({
        userId,
        worked_at_from: '2024-01-01',
        worked_at_to: '2024-01-31',
      });

      expect(mockQuery.gte).toHaveBeenCalledWith('worked_at', '2024-01-01');
      expect(mockQuery.lte).toHaveBeenCalledWith('worked_at', '2024-01-31');
    });

    it('should apply fulfillment score filters', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({
        userId,
        fulfillment_score_min: 3,
        fulfillment_score_max: 5,
      });

      expect(mockQuery.gte).toHaveBeenCalledWith('fulfillment_score', 3);
      expect(mockQuery.lte).toHaveBeenCalledWith('fulfillment_score', 5);
    });

    it('should apply default sort (worked_at desc)', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId });

      expect(mockQuery.order).toHaveBeenCalledWith('worked_at', { ascending: false });
    });

    it('should apply pagination', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, limit: 10, offset: 20 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should throw RecordServiceError on fetch failure', async () => {
      setupMockQueryError(mockSupabase.from, 'Database connection failed');

      await expect(service.list({ userId })).rejects.toThrow(RecordServiceError);
      await expect(service.list({ userId })).rejects.toThrow('Failed to fetch records');
    });

    it('should format plans to plan object and include tagIds', async () => {
      const mockRecords = [
        {
          id: 'record-1',
          worked_at: '2024-01-01',
          user_id: userId,
          plans: { id: 'plan-1', title: 'My Plan', status: 'open' },
        },
      ];
      const tagIdsMap = new Map([['record-1', ['tag-1', 'tag-2']]]);

      setupMockQueryWithTags(mockSupabase.from, mockRecords, tagIdsMap);

      const result = await service.list({ userId });

      expect(result[0]?.plan).toEqual({ id: 'plan-1', title: 'My Plan', status: 'open' });
      expect(result[0]?.tagIds).toEqual(['tag-1', 'tag-2']);
      expect(result[0]).not.toHaveProperty('plans');
    });
  });

  describe('getById', () => {
    it('should return record by id with tags', async () => {
      const mockRecord = {
        id: 'record-1',
        worked_at: '2024-01-01',
        user_id: userId,
        plans: { id: 'plan-1', title: 'My Plan', status: 'open' },
      };

      setupMockSingleQueryWithTags(mockSupabase.from, mockRecord, ['tag-1']);

      const result = await service.getById({ userId, recordId: 'record-1', includePlan: true });

      expect(result).toMatchObject({ id: 'record-1' });
      expect(result.plan).toEqual({ id: 'plan-1', title: 'My Plan', status: 'open' });
      expect(result.tagIds).toEqual(['tag-1']);
    });

    it('should throw NOT_FOUND when record does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(service.getById({ userId, recordId: 'non-existent' })).rejects.toThrow(
        RecordServiceError,
      );

      try {
        await service.getById({ userId, recordId: 'non-existent' });
      } catch (error) {
        expect((error as RecordServiceError).code).toBe('NOT_FOUND');
      }
    });
  });

  describe('checkTimeOverlap', () => {
    it('should return empty array when no overlap', async () => {
      setupMockQuery(mockSupabase.from, []);

      const result = await service.checkTimeOverlap({
        userId,
        workedAt: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
      });

      expect(result).toEqual([]);
    });

    it('should return overlapping record ids', async () => {
      setupMockQuery(mockSupabase.from, [{ id: 'record-1' }, { id: 'record-2' }]);

      const result = await service.checkTimeOverlap({
        userId,
        workedAt: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
      });

      expect(result).toEqual(['record-1', 'record-2']);
    });

    it('should exclude specified record id', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.checkTimeOverlap({
        userId,
        workedAt: '2024-01-01',
        startTime: '09:00',
        endTime: '10:00',
        excludeRecordId: 'record-1',
      });

      expect(mockQuery.neq).toHaveBeenCalledWith('id', 'record-1');
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const mockRecord = {
        id: 'new-record-id',
        worked_at: '2024-01-01',
        user_id: userId,
      };

      setupMockInsertQuery(mockSupabase.from, mockRecord);

      const result = await service.create({
        userId,
        input: { worked_at: '2024-01-01', duration_minutes: 60 },
      });

      expect(result).toMatchObject({ id: 'new-record-id', worked_at: '2024-01-01' });
    });

    it('should create record with plan_id after verifying ownership', async () => {
      const mockRecord = {
        id: 'new-record-id',
        worked_at: '2024-01-01',
        plan_id: 'plan-1',
        user_id: userId,
      };

      setupMockInsertQueryWithPlanVerification(mockSupabase.from, mockRecord, true);

      const result = await service.create({
        userId,
        input: { worked_at: '2024-01-01', duration_minutes: 60, plan_id: 'plan-1' },
      });

      expect(result.plan_id).toBe('plan-1');
    });

    it('should throw PLAN_NOT_FOUND when plan does not exist', async () => {
      setupMockInsertQueryWithPlanVerification(mockSupabase.from, null, false);

      await expect(
        service.create({
          userId,
          input: { worked_at: '2024-01-01', duration_minutes: 60, plan_id: 'invalid-plan' },
        }),
      ).rejects.toThrow(RecordServiceError);

      try {
        await service.create({
          userId,
          input: { worked_at: '2024-01-01', duration_minutes: 60, plan_id: 'invalid-plan' },
        });
      } catch (error) {
        expect((error as RecordServiceError).code).toBe('PLAN_NOT_FOUND');
      }
    });

    it('should throw TIME_OVERLAP when overlap detected', async () => {
      setupMockQueryWithOverlap(mockSupabase.from, [{ id: 'existing-record' }]);

      await expect(
        service.create({
          userId,
          input: {
            worked_at: '2024-01-01',
            duration_minutes: 60,
            start_time: '09:00',
            end_time: '10:00',
          },
        }),
      ).rejects.toThrow(RecordServiceError);

      try {
        await service.create({
          userId,
          input: {
            worked_at: '2024-01-01',
            duration_minutes: 60,
            start_time: '09:00',
            end_time: '10:00',
          },
        });
      } catch (error) {
        expect((error as RecordServiceError).code).toBe('TIME_OVERLAP');
      }
    });

    it('should create record with tags', async () => {
      const mockRecord = {
        id: 'new-record-id',
        worked_at: '2024-01-01',
        user_id: userId,
      };

      setupMockInsertQueryWithTags(mockSupabase.from, mockRecord);

      const result = await service.create({
        userId,
        input: { worked_at: '2024-01-01', duration_minutes: 60, tagIds: ['tag-1', 'tag-2'] },
      });

      expect(result.tagIds).toEqual(['tag-1', 'tag-2']);
    });
  });

  describe('update', () => {
    it('should update record fields', async () => {
      const existingRecord = {
        id: 'record-1',
        worked_at: '2024-01-01',
        start_time: '09:00',
        end_time: '10:00',
        note: 'Original note',
        user_id: userId,
      };
      const updatedRecord = { ...existingRecord, note: 'Updated note' };

      setupMockUpdateQuery(mockSupabase.from, existingRecord, updatedRecord);

      const result = await service.update({
        userId,
        recordId: 'record-1',
        input: { note: 'Updated note' },
      });

      expect(result.note).toBe('Updated note');
    });

    it('should check for time overlap when time fields change', async () => {
      const existingRecord = {
        id: 'record-1',
        worked_at: '2024-01-01',
        start_time: '09:00',
        end_time: '10:00',
        user_id: userId,
      };

      setupMockUpdateQueryWithOverlapCheck(mockSupabase.from, existingRecord, [], {
        ...existingRecord,
        start_time: '11:00',
        end_time: '12:00',
      });

      const result = await service.update({
        userId,
        recordId: 'record-1',
        input: { start_time: '11:00', end_time: '12:00' },
      });

      expect(result.start_time).toBe('11:00');
    });

    it('should throw UPDATE_FAILED on database error', async () => {
      setupMockUpdateError(mockSupabase.from);

      await expect(
        service.update({
          userId,
          recordId: 'record-1',
          input: { note: 'Updated' },
        }),
      ).rejects.toThrow(RecordServiceError);
    });
  });

  describe('delete', () => {
    it('should delete record and return success', async () => {
      setupMockDeleteQuery(mockSupabase.from);

      const result = await service.delete({ userId, recordId: 'record-1' });

      expect(result.success).toBe(true);
    });

    it('should throw DELETE_FAILED on database error', async () => {
      setupMockDeleteError(mockSupabase.from);

      await expect(service.delete({ userId, recordId: 'record-1' })).rejects.toThrow(
        RecordServiceError,
      );

      try {
        await service.delete({ userId, recordId: 'record-1' });
      } catch (error) {
        expect((error as RecordServiceError).code).toBe('DELETE_FAILED');
      }
    });
  });

  describe('duplicate', () => {
    it('should duplicate record with new worked_at date', async () => {
      const originalRecord = {
        id: 'record-1',
        worked_at: '2024-01-01',
        start_time: '09:00',
        end_time: '10:00',
        duration_minutes: 60,
        fulfillment_score: 4,
        note: 'Original note',
        plan_id: 'plan-1',
        user_id: userId,
      };

      const duplicatedRecord = {
        ...originalRecord,
        id: 'record-2',
        worked_at: '2024-01-15',
      };

      setupMockDuplicateQuery(mockSupabase.from, originalRecord, duplicatedRecord);

      const result = await service.duplicate({
        userId,
        recordId: 'record-1',
        workedAt: '2024-01-15',
      });

      expect(result.id).toBe('record-2');
      expect(result.worked_at).toBe('2024-01-15');
      expect(result.start_time).toBe('09:00');
    });

    it('should throw NOT_FOUND when original record does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(
        service.duplicate({
          userId,
          recordId: 'non-existent',
        }),
      ).rejects.toThrow(RecordServiceError);

      try {
        await service.duplicate({ userId, recordId: 'non-existent' });
      } catch (error) {
        expect((error as RecordServiceError).code).toBe('NOT_FOUND');
      }
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple records', async () => {
      setupMockBulkDeleteQuery(mockSupabase.from, 3);

      const result = await service.bulkDelete({
        userId,
        recordIds: ['record-1', 'record-2', 'record-3'],
      });

      expect(result.deletedCount).toBe(3);
    });

    it('should throw BULK_DELETE_FAILED on database error', async () => {
      setupMockBulkDeleteError(mockSupabase.from);

      await expect(
        service.bulkDelete({
          userId,
          recordIds: ['record-1'],
        }),
      ).rejects.toThrow(RecordServiceError);
    });
  });

  describe('listByPlan', () => {
    it('should return records for specific plan', async () => {
      const mockRecords = [
        { id: 'record-1', plan_id: 'plan-1', user_id: userId },
        { id: 'record-2', plan_id: 'plan-1', user_id: userId },
      ];

      setupMockQuery(mockSupabase.from, mockRecords);

      const result = await service.listByPlan({ userId, planId: 'plan-1' });

      expect(result).toHaveLength(2);
    });

    it('should apply limit parameter', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.listByPlan({ userId, planId: 'plan-1', limit: 5 });

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('getRecentRecords', () => {
    it('should return recent records ordered by created_at', async () => {
      const mockRecords = [
        { id: 'record-3', created_at: '2024-01-03', user_id: userId, plans: null },
        { id: 'record-2', created_at: '2024-01-02', user_id: userId, plans: null },
        { id: 'record-1', created_at: '2024-01-01', user_id: userId, plans: null },
      ];

      setupMockQueryWithTags(mockSupabase.from, mockRecords, new Map());

      const result = await service.getRecentRecords(userId, 3);

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('record-3');
    });
  });
});

// ヘルパー関数

function createChainableMock(
  data: unknown,
  error: { message: string; code?: string } | null = null,
  count?: number,
) {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn().mockImplementation((resolve) =>
      resolve({
        data: Array.isArray(data) ? data : data ? [data] : [],
        error,
        count,
      }),
    ),
  };

  Object.keys(mock).forEach((key) => {
    if (!['single', 'maybeSingle', 'then'].includes(key)) {
      mock[key]!.mockReturnValue(mock);
    }
  });

  return mock;
}

function setupMockQuery(mockFrom: ReturnType<typeof vi.fn>, data: unknown[]) {
  const mock = createChainableMock(data);
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockQueryWithTags(
  mockFrom: ReturnType<typeof vi.fn>,
  records: unknown[],
  tagIdsMap: Map<string, string[]>,
) {
  // RecordService は record_tags をネストされたフィールドとして取得するため、
  // レコードデータに record_tags フィールドを追加する
  const recordsWithTags = records.map((record) => {
    const recordId = (record as { id: string }).id;
    const tagIds = tagIdsMap.get(recordId) ?? [];
    return {
      ...(record as Record<string, unknown>),
      record_tags: tagIds.map((tag_id) => ({ tag_id })),
    };
  });

  mockFrom.mockReturnValue(createChainableMock(recordsWithTags));
}

function setupMockQueryError(mockFrom: ReturnType<typeof vi.fn>, errorMessage: string) {
  const mock = createChainableMock(null, { message: errorMessage });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockSingleQuery(mockFrom: ReturnType<typeof vi.fn>, data: unknown) {
  const mock = createChainableMock(data, data ? null : { message: 'Not found', code: 'PGRST116' });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockSingleQueryWithTags(
  mockFrom: ReturnType<typeof vi.fn>,
  record: unknown,
  tagIds: string[],
) {
  // RecordService は record_tags をネストされたフィールドとして取得するため、
  // レコードデータに record_tags フィールドを追加する
  const recordWithTags = {
    ...(record as Record<string, unknown>),
    record_tags: tagIds.map((tag_id) => ({ tag_id })),
  };

  const mock = createChainableMock(recordWithTags);
  mock.single = vi.fn().mockResolvedValue({ data: recordWithTags, error: null });
  mockFrom.mockReturnValue(mock);
}

function setupMockInsertQuery(mockFrom: ReturnType<typeof vi.fn>, data: unknown) {
  const mock = createChainableMock(data);
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockInsertQueryWithPlanVerification(
  mockFrom: ReturnType<typeof vi.fn>,
  recordData: unknown,
  planExists: boolean,
) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'plans') {
      const mock = createChainableMock(planExists ? { id: 'plan-1' } : null);
      mock.single = vi.fn().mockResolvedValue({
        data: planExists ? { id: 'plan-1' } : null,
        error: planExists ? null : { message: 'Not found' },
      });
      return mock;
    }
    return createChainableMock(recordData);
  });
}

function setupMockQueryWithOverlap(
  mockFrom: ReturnType<typeof vi.fn>,
  overlappingRecords: unknown[],
) {
  mockFrom.mockReturnValue(createChainableMock(overlappingRecords));
}

function setupMockInsertQueryWithTags(mockFrom: ReturnType<typeof vi.fn>, recordData: unknown) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'record_tags') {
      return createChainableMock(null);
    }
    return createChainableMock(recordData);
  });
}

function setupMockUpdateQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  _existingData: unknown,
  updatedData: unknown,
) {
  const mock = createChainableMock(updatedData);
  mock.single = vi.fn().mockResolvedValue({ data: updatedData, error: null });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockUpdateQueryWithOverlapCheck(
  mockFrom: ReturnType<typeof vi.fn>,
  existingData: unknown,
  overlappingRecords: unknown[],
  updatedData: unknown,
) {
  let callCount = 0;

  mockFrom.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // fetch current record
      const mock = createChainableMock(existingData);
      mock.single = vi.fn().mockResolvedValue({ data: existingData, error: null });
      return mock;
    }
    if (callCount === 2) {
      // check overlap
      return createChainableMock(overlappingRecords);
    }
    // update
    const mock = createChainableMock(updatedData);
    mock.single = vi.fn().mockResolvedValue({ data: updatedData, error: null });
    return mock;
  });
}

function setupMockUpdateError(mockFrom: ReturnType<typeof vi.fn>) {
  const mock = createChainableMock(null, { message: 'Database error', code: 'DB_ERROR' });
  mockFrom.mockReturnValue(mock);
}

function setupMockDeleteQuery(mockFrom: ReturnType<typeof vi.fn>) {
  const mock = createChainableMock(null);
  mock.then = vi.fn().mockImplementation((resolve) => resolve({ data: null, error: null }));
  mockFrom.mockReturnValue(mock);
}

function setupMockDeleteError(mockFrom: ReturnType<typeof vi.fn>) {
  const mock = createChainableMock(null, { message: 'Database error', code: 'DB_ERROR' });
  mockFrom.mockReturnValue(mock);
}

function setupMockDuplicateQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  originalRecord: unknown,
  duplicatedRecord: unknown,
) {
  let callCount = 0;

  mockFrom.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // fetch original
      const mock = createChainableMock(originalRecord);
      mock.single = vi.fn().mockResolvedValue({ data: originalRecord, error: null });
      return mock;
    }
    if (callCount === 2) {
      // check overlap - no overlap
      return createChainableMock([]);
    }
    // insert duplicate
    const mock = createChainableMock(duplicatedRecord);
    mock.single = vi.fn().mockResolvedValue({ data: duplicatedRecord, error: null });
    return mock;
  });
}

function setupMockBulkDeleteQuery(mockFrom: ReturnType<typeof vi.fn>, deletedCount: number) {
  const mock = createChainableMock(null, null, deletedCount);
  mock.then = vi
    .fn()
    .mockImplementation((resolve) => resolve({ data: null, error: null, count: deletedCount }));
  mockFrom.mockReturnValue(mock);
}

function setupMockBulkDeleteError(mockFrom: ReturnType<typeof vi.fn>) {
  const mock = createChainableMock(null, { message: 'Database error', code: 'DB_ERROR' });
  mockFrom.mockReturnValue(mock);
}
