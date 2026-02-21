import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks ---

const mockUtils = {
  plans: {
    list: { invalidate: vi.fn() },
    getById: { invalidate: vi.fn() },
  },
};

vi.mock('@/lib/trpc', () => ({
  api: {
    useUtils: () => mockUtils,
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() },
}));

let capturedConfig: Record<string, unknown> | null = null;
vi.mock('../useRealtimeSubscription', () => ({
  useRealtimeSubscription: (config: Record<string, unknown>) => {
    capturedConfig = config;
  },
}));

import { createRealtimeHook } from '../createRealtimeHook';

describe('createRealtimeHook', () => {
  let mockMutationGuard: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedConfig = null;
    mockMutationGuard = false;
  });

  it('正しいチャンネル名を生成する', () => {
    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => mockMutationGuard,
      onInvalidate: vi.fn(),
    });

    renderHook(() => useHook('user-123'));

    expect(capturedConfig).toMatchObject({
      channelName: 'test-changes-user-123',
      table: 'test_table',
      event: '*',
    });
  });

  it('userIdに基づくフィルタを設定する', () => {
    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => false,
      onInvalidate: vi.fn(),
    });

    renderHook(() => useHook('user-456'));

    expect(capturedConfig).toMatchObject({
      filter: 'user_id=eq.user-456',
    });
  });

  it('enabled=falseが正しく伝播する', () => {
    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => false,
      onInvalidate: vi.fn(),
    });

    renderHook(() => useHook('user-1', { enabled: false }));

    expect(capturedConfig).toMatchObject({ enabled: false });
  });

  it('mutation中はonInvalidateをスキップする', () => {
    mockMutationGuard = true;
    const onInvalidate = vi.fn();

    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => mockMutationGuard,
      onInvalidate,
    });

    renderHook(() => useHook('user-1'));

    // onEventを取得して呼び出し
    const onEvent = (capturedConfig as { onEvent: (payload: unknown) => void }).onEvent;
    onEvent({
      eventType: 'INSERT',
      new: { id: 'record-1' },
      old: null,
    });

    expect(onInvalidate).not.toHaveBeenCalled();
  });

  it('mutation中でない場合はonInvalidateを呼ぶ', () => {
    mockMutationGuard = false;
    const onInvalidate = vi.fn();

    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => mockMutationGuard,
      onInvalidate,
    });

    renderHook(() => useHook('user-1'));

    const onEvent = (capturedConfig as { onEvent: (payload: unknown) => void }).onEvent;
    onEvent({
      eventType: 'UPDATE',
      new: { id: 'record-1' },
      old: { id: 'record-1' },
    });

    expect(onInvalidate).toHaveBeenCalledWith(
      mockUtils,
      expect.objectContaining({
        eventType: 'UPDATE',
        new: { id: 'record-1' },
      }),
    );
  });

  it('userIdがundefinedの場合でもフックが動作する', () => {
    const useHook = createRealtimeHook({
      name: 'test',
      table: 'test_table',
      useMutationGuard: () => false,
      onInvalidate: vi.fn(),
    });

    renderHook(() => useHook(undefined));

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig).toMatchObject({
      channelName: 'test-changes-undefined',
    });
  });
});
