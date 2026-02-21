import { describe, expect, it, vi } from 'vitest';

// --- Mocks ---

const mockUtils = {
  plans: {
    list: { invalidate: vi.fn() },
    getById: { invalidate: vi.fn() },
    invalidate: vi.fn(),
  },
};

vi.mock('@/lib/trpc', () => ({
  api: {
    useUtils: () => mockUtils,
  },
}));

let mockIsMutating = false;
vi.mock('../../stores/usePlanCacheStore', () => ({
  usePlanCacheStore: (selector: (state: { isMutating: boolean }) => boolean) =>
    selector({ isMutating: mockIsMutating }),
}));

const mockUseRealtimeSubscription = vi.fn();
vi.mock('@/lib/supabase/realtime/useRealtimeSubscription', () => ({
  useRealtimeSubscription: (config: Record<string, unknown>) => mockUseRealtimeSubscription(config),
}));

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() },
}));

import { renderHook } from '@testing-library/react';
import { beforeEach } from 'vitest';

import { usePlanRealtime } from '../usePlanRealtime';

describe('usePlanRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMutating = false;
  });

  it('正しいテーブル名でサブスクリプションを作成する', () => {
    renderHook(() => usePlanRealtime('user-1'));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'plans',
        event: '*',
        enabled: true,
        filter: 'user_id=eq.user-1',
      }),
    );
  });

  it('チャンネル名にユーザーIDが含まれる', () => {
    renderHook(() => usePlanRealtime('user-123'));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        channelName: 'plan-changes-user-123',
      }),
    );
  });

  it('enabled=falseで無効化できる', () => {
    renderHook(() => usePlanRealtime('user-1', { enabled: false }));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('イベント受信時にキャッシュを無効化する（mutation中でない場合）', () => {
    mockIsMutating = false;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => usePlanRealtime('user-1'));

    // イベントを発火
    capturedOnEvent!({
      eventType: 'UPDATE',
      new: { id: 'plan-1' },
      old: null,
    });

    expect(mockUtils.plans.list.invalidate).toHaveBeenCalled();
    expect(mockUtils.plans.getById.invalidate).toHaveBeenCalledWith({ id: 'plan-1' });
    expect(mockUtils.plans.invalidate).toHaveBeenCalled();
  });

  it('mutation中はキャッシュ無効化をスキップする', () => {
    mockIsMutating = true;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => usePlanRealtime('user-1'));

    // イベントを発火
    capturedOnEvent!({
      eventType: 'UPDATE',
      new: { id: 'plan-1' },
      old: null,
    });

    expect(mockUtils.plans.list.invalidate).not.toHaveBeenCalled();
  });

  it('DELETEイベントでold.idを使用する', () => {
    mockIsMutating = false;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => usePlanRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'DELETE',
      new: null,
      old: { id: 'plan-deleted' },
    });

    expect(mockUtils.plans.getById.invalidate).toHaveBeenCalledWith({ id: 'plan-deleted' });
  });
});
