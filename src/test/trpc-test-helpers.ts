/**
 * tRPC テストヘルパー
 *
 * tRPCルーターの単体テスト・統合テスト用のユーティリティ
 *
 * @example
 * ```typescript
 * import { createTestCaller, createMockContext } from '@/test/trpc-test-helpers'
 * import { plansRouter } from '@/server/api/routers/plans'
 *
 * describe('plans.list', () => {
 *   it('should return plans for authenticated user', async () => {
 *     const ctx = createMockContext({ userId: 'test-user-id' })
 *     const caller = createTestCaller(plansRouter, ctx)
 *
 *     const result = await caller.list()
 *     expect(result).toBeDefined()
 *   })
 * })
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { initTRPC, type AnyRouter } from '@trpc/server';
import superjson from 'superjson';
import { expect, vi } from 'vitest';

import type { Database } from '@/lib/database.types';
import type { Context } from '@/server/api/trpc';

/**
 * モックコンテキストのオプション
 */
export interface MockContextOptions {
  userId?: string;
  sessionId?: string;
  supabaseOverrides?: Partial<MockSupabaseClient>;
}

/**
 * モックSupabaseクライアントの型
 */
export interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
  };
  rpc: ReturnType<typeof vi.fn>;
}

/**
 * Supabaseクエリビルダーのモック結果
 */
export interface MockQueryResult<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}

/**
 * モックSupabaseクライアントを作成
 */
export function createMockSupabase(overrides?: Partial<MockSupabaseClient>): MockSupabaseClient {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockImplementation((resolve) => resolve({ data: [], error: null })),
  });

  return {
    from: mockFrom,
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
}

/**
 * モックコンテキストを作成
 */
export function createMockContext(options: MockContextOptions = {}): Context {
  const { userId, sessionId, supabaseOverrides } = options;

  const mockSupabase = createMockSupabase(supabaseOverrides);

  return {
    req: {
      headers: {},
      cookies: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as Context['req'],
    res: {
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Context['res'],
    userId,
    sessionId,
    supabase: mockSupabase as unknown as SupabaseClient<Database>,
    authMode: 'session' as const,
  };
}

/**
 * 認証済みユーザーのモックコンテキストを作成
 */
export function createAuthenticatedContext(
  userId: string = 'test-user-id',
  options: Omit<MockContextOptions, 'userId'> = {},
): Context {
  return createMockContext({ ...options, userId });
}

// tRPCインスタンス（テスト用）- createCallerFactoryの型推論に必要
const testTrpc = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * tRPCテスト用のcallerを作成
 *
 * @param router - テスト対象のルーター
 * @param ctx - モックコンテキスト
 * @returns ルーターのcaller
 *
 * @example
 * ```typescript
 * // 型安全な使用方法
 * const caller = createTestCaller(plansCrudRouter, ctx);
 * const result = await caller.list(); // 型推論される
 * ```
 */
export function createTestCaller<TRouter extends AnyRouter>(router: TRouter, ctx: Context) {
  const createCaller = testTrpc.createCallerFactory(router);
  return createCaller(ctx);
}

/**
 * Supabaseクエリの成功レスポンスをモック
 */
export function mockSupabaseSuccess<T>(
  mockFrom: MockSupabaseClient['from'],
  tableName: string,
  data: T,
): void {
  mockFrom.mockImplementation((table: string) => {
    if (table === tableName) {
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi
          .fn()
          .mockImplementation((resolve: (value: unknown) => void) =>
            resolve({ data: Array.isArray(data) ? data : [data], error: null }),
          ),
      };
    }
    // デフォルトのモックQueryBuilder を返す
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi
        .fn()
        .mockImplementation((resolve: (value: unknown) => void) =>
          resolve({ data: [], error: null }),
        ),
    };
  });
}

/**
 * Supabaseクエリのエラーレスポンスをモック
 */
export function mockSupabaseError(
  mockFrom: MockSupabaseClient['from'],
  tableName: string,
  errorMessage: string,
  errorCode: string = 'PGRST116',
): void {
  mockFrom.mockImplementation((table: string) => {
    if (table === tableName) {
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: errorMessage, code: errorCode } }),
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: errorMessage, code: errorCode } }),
        then: vi
          .fn()
          .mockImplementation((resolve: (value: unknown) => void) =>
            resolve({ data: null, error: { message: errorMessage, code: errorCode } }),
          ),
      };
    }
    // デフォルトのモックQueryBuilder を返す
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: errorMessage, code: errorCode } }),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: errorMessage, code: errorCode } }),
      then: vi
        .fn()
        .mockImplementation((resolve: (value: unknown) => void) =>
          resolve({ data: null, error: { message: errorMessage, code: errorCode } }),
        ),
    };
  });
}

/**
 * テスト用のプランデータを生成
 */
export function createMockPlan(
  overrides: Partial<Database['public']['Tables']['plans']['Row']> = {},
): Database['public']['Tables']['plans']['Row'] {
  const now = new Date().toISOString();
  return {
    id: 'test-plan-id',
    user_id: 'test-user-id',
    title: 'Test Plan',
    description: null,
    status: 'open',
    start_time: null,
    end_time: null,
    recurrence_type: 'none',
    recurrence_rule: null,
    recurrence_end_date: null,
    reminder_minutes: null,
    reminder_at: null,
    reminder_sent: false,
    completed_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * テスト用のタグデータを生成
 */
export function createMockTag(
  overrides: Partial<Database['public']['Tables']['tags']['Row']> = {},
): Database['public']['Tables']['tags']['Row'] {
  const now = new Date().toISOString();
  return {
    id: 'test-tag-id',
    user_id: 'test-user-id',
    name: 'Test Tag',
    color: '#3B82F6',
    is_active: true,
    parent_id: null,
    sort_order: 0,
    description: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * TRPCErrorをアサート
 */
export function expectTRPCError(error: unknown, code: string): void {
  expect(error).toBeDefined();
  expect((error as { code?: string }).code).toBe(code);
}
