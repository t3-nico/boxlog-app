/**
 * Plans CRUD Router Tests
 *
 * tRPCルーターの単体テスト
 * - 認証チェック
 * - CRUD操作
 * - エラーハンドリング
 */

import type { inferRouterOutputs } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlanFilter } from '@/schemas/plans';
import {
  createAuthenticatedContext,
  createMockContext,
  createMockPlan,
  createMockSupabase,
  createTestCaller,
  expectTRPCError,
} from '@/test/trpc-test-helpers';

import { plansCrudRouter } from '../crud';

// Caller型を明示的に定義（tRPC v11の型推論問題を解決）
type RouterOutputs = inferRouterOutputs<typeof plansCrudRouter>;

interface PlansCrudCaller {
  list: (input?: PlanFilter) => Promise<RouterOutputs['list']>;
  getById: (input: {
    id: string;
    include?: { tags?: boolean };
  }) => Promise<RouterOutputs['getById']>;
  create: (input: {
    title: string;
    status: string;
    due_date?: string;
    start_time?: string;
    end_time?: string;
  }) => Promise<RouterOutputs['create']>;
  update: (input: { id: string; data: { title?: string } }) => Promise<RouterOutputs['update']>;
  delete: (input: { id: string }) => Promise<RouterOutputs['delete']>;
}

/** 型安全なcallerを作成 */
function createTypedCaller(
  router: typeof plansCrudRouter,
  ctx: Parameters<typeof createTestCaller>[1],
): PlansCrudCaller {
  return createTestCaller(router, ctx) as unknown as PlansCrudCaller;
}

// モジュールモック
vi.mock('@/server/utils/activity-tracker', () => ({
  trackPlanChanges: vi.fn().mockResolvedValue(undefined),
}));

describe('plansCrudRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      const ctx = createMockContext(); // userId なし
      const caller = createTypedCaller(plansCrudRouter, ctx);

      await expect(caller.list()).rejects.toThrow(TRPCError);

      try {
        await caller.list();
      } catch (error) {
        expectTRPCError(error, 'UNAUTHORIZED');
      }
    });

    it('should return plans for authenticated user', async () => {
      const mockPlans = [
        createMockPlan({ id: 'plan-1', title: 'Plan 1' }),
        createMockPlan({ id: 'plan-2', title: 'Plan 2' }),
      ];

      const mockSupabase = createMockSupabase();
      setupMockQuery(mockSupabase.from, 'plans', mockPlans);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.list();

      // APIレスポンスにはtagIds配列が追加される
      const expectedPlans = mockPlans.map((plan) => ({ ...plan, tagIds: [] }));
      expect(result).toEqual(expectedPlans);
      expect(mockSupabase.from).toHaveBeenCalledWith('plans');
    });

    it('should apply status filter', async () => {
      const mockPlans = [createMockPlan({ id: 'plan-1', status: 'open' })];

      const mockSupabase = createMockSupabase();
      const mockQuery = setupMockQuery(mockSupabase.from, 'plans', mockPlans);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      await caller.list({ status: 'open' });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'open');
    });

    it('should apply search filter', async () => {
      const mockPlans = [createMockPlan({ id: 'plan-1', title: 'Meeting' })];

      const mockSupabase = createMockSupabase();
      const mockQuery = setupMockQuery(mockSupabase.from, 'plans', mockPlans);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      await caller.list({ search: 'Meeting' });

      expect(mockQuery.or).toHaveBeenCalledWith(
        'title.ilike.%Meeting%,description.ilike.%Meeting%',
      );
    });

    it('should apply sorting', async () => {
      const mockSupabase = createMockSupabase();
      const mockQuery = setupMockQuery(mockSupabase.from, 'plans', []);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      await caller.list({ sortBy: 'title', sortOrder: 'asc' });

      expect(mockQuery.order).toHaveBeenCalledWith('title', { ascending: true });
    });

    it('should apply pagination', async () => {
      const mockSupabase = createMockSupabase();
      const mockQuery = setupMockQuery(mockSupabase.from, 'plans', []);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      await caller.list({ limit: 10, offset: 20 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });
  });

  describe('getById', () => {
    const validPlanId = '550e8400-e29b-41d4-a716-446655440000';
    const nonExistentId = '550e8400-e29b-41d4-a716-446655440001';

    it('should return a plan by id', async () => {
      const mockPlan = createMockPlan({ id: validPlanId, title: 'Test Plan' });

      const mockSupabase = createMockSupabase();
      setupMockSingleQuery(mockSupabase.from, 'plans', mockPlan);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.getById({ id: validPlanId });

      expect(result).toEqual(mockPlan);
    });

    it('should throw NOT_FOUND when plan does not exist', async () => {
      const mockSupabase = createMockSupabase();
      setupMockSingleQueryError(mockSupabase.from, 'plans', 'Plan not found');

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      try {
        await caller.getById({ id: nonExistentId });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expectTRPCError(error, 'NOT_FOUND');
      }
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const mockPlan = createMockPlan({ id: 'new-plan-id', title: 'New Plan' });

      const mockSupabase = createMockSupabase();
      setupMockInsertQuery(mockSupabase.from, 'plans', mockPlan);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.create({
        title: 'New Plan',
        status: 'open',
      });

      expect(result).toEqual(mockPlan);
    });

    it('should normalize date/time consistency on create', async () => {
      const mockPlan = createMockPlan({
        id: 'new-plan-id',
        title: 'New Plan',
        due_date: '2024-01-15',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T11:00:00.000Z',
      });

      const mockSupabase = createMockSupabase();
      setupMockInsertQuery(mockSupabase.from, 'plans', mockPlan);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.create({
        title: 'New Plan',
        status: 'open',
        due_date: '2024-01-15',
        start_time: '2024-01-15T10:00:00.000Z',
        end_time: '2024-01-15T11:00:00.000Z',
      });

      expect((result as { due_date: string }).due_date).toBe('2024-01-15');
    });
  });

  describe('update', () => {
    const validPlanId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update an existing plan', async () => {
      const existingPlan = createMockPlan({ id: validPlanId, title: 'Old Title' });
      const updatedPlan = createMockPlan({ id: validPlanId, title: 'New Title' });

      const mockSupabase = createMockSupabase();
      setupMockUpdateQuery(mockSupabase.from, 'plans', existingPlan, updatedPlan);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.update({
        id: validPlanId,
        data: { title: 'New Title' },
      });

      expect((result as { title: string }).title).toBe('New Title');
    });
  });

  describe('delete', () => {
    const validPlanId = '550e8400-e29b-41d4-a716-446655440000';

    it('should delete a plan', async () => {
      const existingPlan = createMockPlan({ id: validPlanId, title: 'To Delete' });

      const mockSupabase = createMockSupabase();
      setupMockDeleteQuery(mockSupabase.from, 'plans', existingPlan);

      const ctx = createAuthenticatedContext('test-user-id', {
        supabaseOverrides: mockSupabase,
      });
      const caller = createTypedCaller(plansCrudRouter, ctx);

      const result = await caller.delete({ id: validPlanId });

      expect(result).toEqual({ success: true });
    });
  });
});

// ヘルパー関数

interface MockQuery {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
}

/**
 * 複数テーブルに対応するモッククエリビルダーを作成
 */
function createChainableMockQuery<T>(
  data: T | T[] | null,
  error: { message: string; code: string } | null = null,
) {
  const mockQuery: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    not: vi.fn(),
    lt: vi.fn(),
    lte: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    single: vi.fn().mockResolvedValue({
      data: Array.isArray(data) ? data[0] : data,
      error,
    }),
    then: vi.fn().mockImplementation((resolve) =>
      resolve({
        data: Array.isArray(data) ? data : data ? [data] : [],
        error,
      }),
    ),
  };

  // 全メソッドをチェーン可能に
  Object.keys(mockQuery).forEach((key) => {
    if (key !== 'single' && key !== 'then') {
      mockQuery[key]!.mockReturnValue(mockQuery);
    }
  });

  return mockQuery;
}

function setupMockQuery<T>(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  data: T[],
): MockQuery {
  const mockQuery = createChainableMockQuery(data);

  // 複数テーブル対応: plans以外のテーブルにも対応
  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities' || table === 'plan_tags') {
      return createChainableMockQuery(null);
    }
    return mockQuery;
  });

  return mockQuery as unknown as MockQuery;
}

function setupMockSingleQuery<T>(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  data: T,
): void {
  const mockQuery = createChainableMockQuery(data);

  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities' || table === 'plan_tags') {
      return createChainableMockQuery(null);
    }
    return mockQuery;
  });
}

function setupMockSingleQueryError(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  errorMessage: string,
): void {
  const errorQuery = createChainableMockQuery(null, { message: errorMessage, code: 'PGRST116' });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities' || table === 'plan_tags') {
      return createChainableMockQuery(null);
    }
    return errorQuery;
  });
}

function setupMockInsertQuery<T>(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  data: T,
): void {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities' || table === 'plan_tags') {
      return createChainableMockQuery(null);
    }

    // SELECT（重複チェック）とINSERTを区別するモック
    let isInsert = false;
    const mockQuery: Record<string, ReturnType<typeof vi.fn>> = {
      select: vi.fn(),
      insert: vi.fn().mockImplementation(() => {
        isInsert = true;
        return mockQuery;
      }),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      not: vi.fn(),
      lt: vi.fn(),
      lte: vi.fn(),
      gt: vi.fn(),
      gte: vi.fn(),
      in: vi.fn(),
      or: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn().mockImplementation(() => {
        // INSERTならデータを返す、SELECTなら空（重複なし）
        return Promise.resolve({
          data: isInsert ? data : null,
          error: null,
        });
      }),
      then: vi.fn().mockImplementation((resolve) => {
        // INSERTならデータを返す、SELECTなら空（重複なし）
        return resolve({
          data: isInsert ? (Array.isArray(data) ? data : [data]) : [],
          error: null,
        });
      }),
    };

    // 全メソッドをチェーン可能に（single, then, insert以外）
    Object.keys(mockQuery).forEach((key) => {
      if (key !== 'single' && key !== 'then' && key !== 'insert') {
        mockQuery[key]!.mockReturnValue(mockQuery);
      }
    });

    return mockQuery;
  });
}

function setupMockUpdateQuery<T>(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  existingData: T,
  updatedData: T,
): void {
  const callCounts: Record<string, number> = {};

  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities' || table === 'plan_tags') {
      return createChainableMockQuery(null);
    }

    callCounts[table] = (callCounts[table] || 0) + 1;
    const count = callCounts[table];

    const mockQuery: Record<string, ReturnType<typeof vi.fn>> = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      not: vi.fn(),
      lt: vi.fn(),
      lte: vi.fn(),
      gt: vi.fn(),
      gte: vi.fn(),
      in: vi.fn(),
      or: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn().mockResolvedValue({
        // 1回目: 既存データ取得、2回目: 更新後データ
        data: count === 1 ? existingData : updatedData,
        error: null,
      }),
    };

    Object.keys(mockQuery).forEach((key) => {
      if (key !== 'single') {
        mockQuery[key]!.mockReturnValue(mockQuery);
      }
    });

    return mockQuery;
  });
}

function setupMockDeleteQuery<T>(
  mockFrom: ReturnType<typeof vi.fn>,
  _tableName: string,
  existingData: T,
): void {
  const callCounts: Record<string, number> = {};

  mockFrom.mockImplementation((table: string) => {
    if (table === 'plan_activities') {
      return createChainableMockQuery(null);
    }

    callCounts[table] = (callCounts[table] || 0) + 1;
    const count = callCounts[table];

    const mockQuery: Record<string, ReturnType<typeof vi.fn>> = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      in: vi.fn(),
      or: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn().mockResolvedValue({
        data: count === 1 ? existingData : null,
        error: null,
      }),
      then: vi.fn().mockImplementation((resolve) => resolve({ data: null, error: null })),
    };

    Object.keys(mockQuery).forEach((key) => {
      if (key !== 'single' && key !== 'then') {
        mockQuery[key]!.mockReturnValue(mockQuery);
      }
    });

    return mockQuery;
  });
}
