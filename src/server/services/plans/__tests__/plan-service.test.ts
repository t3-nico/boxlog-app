/**
 * Plan Service Unit Tests
 *
 * PlanServiceのビジネスロジックをモックを使用してテスト
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabase } from '@/test/trpc-test-helpers';

import { createPlanService, PlanService, PlanServiceError } from '../plan-service';

describe('PlanService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let service: PlanService;
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    service = createPlanService(mockSupabase as unknown as Parameters<typeof createPlanService>[0]);
  });

  describe('list', () => {
    it('should return plans for user', async () => {
      const mockPlans = [
        { id: 'plan-1', title: 'Plan 1', user_id: userId, plan_tags: [] },
        { id: 'plan-2', title: 'Plan 2', user_id: userId, plan_tags: [] },
      ];

      setupMockQuery(mockSupabase.from, mockPlans);

      const result = await service.list({ userId });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 'plan-1', title: 'Plan 1' });
      expect(result[1]).toMatchObject({ id: 'plan-2', title: 'Plan 2' });
      expect(mockSupabase.from).toHaveBeenCalledWith('plans');
    });

    it('should apply status filter', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, status: 'closed' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'closed');
    });

    it('should apply date range filters', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({
        userId,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockQuery.gte).toHaveBeenCalledWith('start_time', '2024-01-01');
      expect(mockQuery.lte).toHaveBeenCalledWith('start_time', '2024-01-31');
    });

    it('should apply search filter', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, search: 'meeting' });

      expect(mockQuery.or).toHaveBeenCalledWith(
        'title.ilike.%meeting%,description.ilike.%meeting%',
      );
    });

    it('should apply default sort (created_at desc)', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId });

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should apply custom sort', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, sortBy: 'title', sortOrder: 'asc' });

      expect(mockQuery.order).toHaveBeenCalledWith('title', { ascending: true });
    });

    it('should apply pagination', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.list({ userId, limit: 10, offset: 20 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should return empty array when tag filter yields no plan ids', async () => {
      // First call for plan_tags returns empty
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'plan_tags') {
          return createChainableMock([]);
        }
        return createChainableMock([]);
      });

      const result = await service.list({ userId, tagId: 'tag-1' });

      expect(result).toEqual([]);
    });

    it('should throw PlanServiceError on fetch failure', async () => {
      setupMockQueryError(mockSupabase.from, 'Database connection failed');

      await expect(service.list({ userId })).rejects.toThrow(PlanServiceError);
      await expect(service.list({ userId })).rejects.toThrow('Failed to fetch plans');
    });

    it('should format plan_tags to tagIds array', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          title: 'Plan 1',
          user_id: userId,
          plan_tags: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
        },
      ];

      setupMockQuery(mockSupabase.from, mockPlans);

      const result = await service.list({ userId });

      expect(result[0]?.tagIds).toEqual(['tag-1', 'tag-2']);
      expect(result[0]).not.toHaveProperty('plan_tags');
    });
  });

  describe('getById', () => {
    it('should return plan by id', async () => {
      const mockPlan = {
        id: 'plan-1',
        title: 'Plan 1',
        user_id: userId,
        plan_tags: [{ tag_id: 'tag-1' }],
      };

      setupMockSingleQuery(mockSupabase.from, mockPlan);

      const result = await service.getById({ userId, planId: 'plan-1', includeTags: true });

      expect(result).toMatchObject({ id: 'plan-1', title: 'Plan 1' });
      expect(result.tagIds).toEqual(['tag-1']);
    });

    it('should throw NOT_FOUND when plan does not exist', async () => {
      setupMockSingleQuery(mockSupabase.from, null);

      await expect(service.getById({ userId, planId: 'non-existent' })).rejects.toThrow(
        PlanServiceError,
      );

      try {
        await service.getById({ userId, planId: 'non-existent' });
      } catch (error) {
        expect((error as PlanServiceError).code).toBe('NOT_FOUND');
      }
    });
  });

  describe('checkTimeOverlap', () => {
    it('should return empty array when no overlap', async () => {
      setupMockQuery(mockSupabase.from, []);

      const result = await service.checkTimeOverlap({
        userId,
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
      });

      expect(result).toEqual([]);
    });

    it('should return overlapping plan ids', async () => {
      setupMockQuery(mockSupabase.from, [{ id: 'plan-1' }, { id: 'plan-2' }]);

      const result = await service.checkTimeOverlap({
        userId,
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
      });

      expect(result).toEqual(['plan-1', 'plan-2']);
    });

    it('should exclude specified plan id', async () => {
      const mockQuery = setupMockQuery(mockSupabase.from, []);

      await service.checkTimeOverlap({
        userId,
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
        excludePlanId: 'plan-1',
      });

      expect(mockQuery.neq).toHaveBeenCalledWith('id', 'plan-1');
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const mockPlan = {
        id: 'new-plan-id',
        title: 'New Plan',
        user_id: userId,
      };

      setupMockInsertQuery(mockSupabase.from, mockPlan);

      const result = await service.create({
        userId,
        input: { title: 'New Plan', status: 'open' },
      });

      expect(result).toMatchObject(mockPlan);
    });

    it('should create plan with time fields', async () => {
      const mockPlan = {
        id: 'new-plan-id',
        title: 'New Plan',
        user_id: userId,
        start_time: '2024-01-01T09:00:00Z',
        end_time: '2024-01-01T10:00:00Z',
      };

      setupMockInsertQuery(mockSupabase.from, mockPlan);

      const result = await service.create({
        userId,
        input: {
          title: 'New Plan',
          status: 'open',
          start_time: '2024-01-01T09:00:00Z',
          end_time: '2024-01-01T10:00:00Z',
        },
      });

      expect(result.start_time).toBe('2024-01-01T09:00:00Z');
      expect(result.end_time).toBe('2024-01-01T10:00:00Z');
    });

    it('should throw TIME_OVERLAP when overlap detected and prevention enabled', async () => {
      // First call checks for overlap
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // checkTimeOverlap returns overlapping plans
          return createChainableMock([{ id: 'existing-plan' }]);
        }
        return createChainableMock({ id: 'new-plan' });
      });

      await expect(
        service.create({
          userId,
          input: {
            title: 'New Plan',
            status: 'open',
            start_time: '2024-01-01T09:00:00Z',
            end_time: '2024-01-01T10:00:00Z',
          },
          preventOverlappingPlans: true,
        }),
      ).rejects.toThrow(PlanServiceError);

      try {
        await service.create({
          userId,
          input: {
            title: 'New Plan',
            status: 'open',
            start_time: '2024-01-01T09:00:00Z',
            end_time: '2024-01-01T10:00:00Z',
          },
          preventOverlappingPlans: true,
        });
      } catch (error) {
        expect((error as PlanServiceError).code).toBe('TIME_OVERLAP');
      }
    });

    it('should throw CREATE_FAILED on database error', async () => {
      setupMockInsertError(mockSupabase.from, 'DB_ERROR', 'Database error');

      await expect(
        service.create({
          userId,
          input: { title: 'New Plan', status: 'open' },
        }),
      ).rejects.toThrow(PlanServiceError);
    });
  });

  describe('update', () => {
    const existingPlan = {
      id: 'plan-1',
      title: 'Original',
      status: 'open',
      user_id: userId,
      start_time: null,
      end_time: null,
    };

    it('should update plan title', async () => {
      const updatedPlan = { ...existingPlan, title: 'Updated' };

      setupMockUpdateQuery(mockSupabase.from, existingPlan, updatedPlan);

      const result = await service.update({
        userId,
        planId: 'plan-1',
        input: { title: 'Updated' },
      });

      expect(result.title).toBe('Updated');
    });

    it('should set completed_at when status changes to closed', async () => {
      const updatedPlan = { ...existingPlan, status: 'closed', completed_at: expect.any(String) };

      const mockQuery = setupMockUpdateQuery(mockSupabase.from, existingPlan, updatedPlan);

      await service.update({
        userId,
        planId: 'plan-1',
        input: { status: 'closed' },
      });

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          completed_at: expect.any(String),
        }),
      );
    });

    it('should clear completed_at when status changes back to open', async () => {
      const closedPlan = {
        ...existingPlan,
        status: 'closed',
        completed_at: '2024-01-01T00:00:00Z',
      };
      const reopenedPlan = { ...closedPlan, status: 'open', completed_at: null };

      const mockQuery = setupMockUpdateQuery(mockSupabase.from, closedPlan, reopenedPlan);

      await service.update({
        userId,
        planId: 'plan-1',
        input: { status: 'open' },
      });

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          completed_at: null,
        }),
      );
    });

    it('should throw UPDATE_FAILED on database error', async () => {
      setupMockUpdateError(mockSupabase.from, 'DB_ERROR', 'Database error');

      await expect(
        service.update({
          userId,
          planId: 'plan-1',
          input: { title: 'Updated' },
        }),
      ).rejects.toThrow(PlanServiceError);
    });
  });

  describe('delete', () => {
    it('should delete plan and return success', async () => {
      setupMockDeleteQuery(mockSupabase.from, { title: 'Plan to delete' });

      const result = await service.delete({ userId, planId: 'plan-1' });

      expect(result.success).toBe(true);
    });

    it('should throw DELETE_FAILED on database error', async () => {
      setupMockDeleteError(mockSupabase.from, 'DB_ERROR', 'Database error');

      await expect(service.delete({ userId, planId: 'plan-1' })).rejects.toThrow(PlanServiceError);

      try {
        await service.delete({ userId, planId: 'plan-1' });
      } catch (error) {
        expect((error as PlanServiceError).code).toBe('DELETE_FAILED');
      }
    });
  });
});

// ヘルパー関数

function createChainableMock(
  data: unknown,
  error: { message: string; code?: string } | null = null,
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

function setupMockInsertQuery(mockFrom: ReturnType<typeof vi.fn>, data: unknown) {
  const mock = createChainableMock(data);
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockInsertError(mockFrom: ReturnType<typeof vi.fn>, code: string, message: string) {
  const mock = createChainableMock(null, { message, code });
  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockUpdateQuery(
  mockFrom: ReturnType<typeof vi.fn>,
  existingData: unknown,
  updatedData: unknown,
) {
  let callCount = 0;
  const mock = createChainableMock(existingData);

  mock.single = vi.fn().mockImplementation(() => {
    callCount++;
    return Promise.resolve({
      data: callCount === 1 ? existingData : updatedData,
      error: null,
    });
  });

  mockFrom.mockReturnValue(mock);
  return mock;
}

function setupMockUpdateError(mockFrom: ReturnType<typeof vi.fn>, code: string, message: string) {
  let callCount = 0;
  const existingData = { id: 'plan-1', title: 'Original', status: 'open' };

  mockFrom.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // getExistingPlan succeeds
      return createChainableMock(existingData);
    }
    // update fails
    return createChainableMock(null, { message, code });
  });
}

function setupMockDeleteQuery(mockFrom: ReturnType<typeof vi.fn>, planData: unknown) {
  let callCount = 0;

  mockFrom.mockImplementation((table: string) => {
    callCount++;

    if (table === 'plan_activities') {
      return createChainableMock(null);
    }

    const mock = createChainableMock(planData);
    if (callCount === 1) {
      // First call: get plan title
      mock.single = vi.fn().mockResolvedValue({ data: planData, error: null });
    } else {
      // Second call: delete
      mock.then = vi.fn().mockImplementation((resolve) => resolve({ data: null, error: null }));
    }

    return mock;
  });
}

function setupMockDeleteError(mockFrom: ReturnType<typeof vi.fn>, code: string, message: string) {
  let callCount = 0;

  mockFrom.mockImplementation((table: string) => {
    callCount++;

    if (table === 'plan_activities') {
      return createChainableMock(null);
    }

    if (callCount === 1) {
      // get plan title succeeds
      const mock = createChainableMock({ title: 'Plan' });
      mock.single = vi.fn().mockResolvedValue({ data: { title: 'Plan' }, error: null });
      return mock;
    }

    // delete fails
    return createChainableMock(null, { message, code });
  });
}
