import { describe, expect, it, vi } from 'vitest';

// --- Mocks ---

const mockUtils = {
  entries: {
    list: { invalidate: vi.fn() },
    getById: { invalidate: vi.fn() },
    getCumulativeTime: { invalidate: vi.fn() },
    getInstances: { invalidate: vi.fn() },
  },
};

vi.mock('@/lib/trpc', () => ({
  api: {
    useUtils: () => mockUtils,
  },
}));

let mockIsMutating = false;
vi.mock('@/stores/useEntryCacheStore', () => ({
  useEntryCacheStore: (selector: (state: { isMutating: boolean }) => boolean) =>
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

import { useEntryRealtime } from '../useEntryRealtime';

describe('useEntryRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMutating = false;
  });

  it('entries テーブルを購読する', () => {
    renderHook(() => useEntryRealtime('user-1'));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'entries',
        event: '*',
        enabled: true,
        filter: 'user_id=eq.user-1',
      }),
    );
  });

  it('チャンネル名にユーザーIDが含まれる', () => {
    renderHook(() => useEntryRealtime('user-123'));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        channelName: 'entry-changes-user-123',
      }),
    );
  });

  it('enabled=false で無効化できる', () => {
    renderHook(() => useEntryRealtime('user-1', { enabled: false }));

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

    renderHook(() => useEntryRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'UPDATE',
      new: { id: 'entry-1' },
      old: null,
    });

    expect(mockUtils.entries.list.invalidate).toHaveBeenCalled();
    expect(mockUtils.entries.getById.invalidate).toHaveBeenCalledWith({ id: 'entry-1' });
    expect(mockUtils.entries.getCumulativeTime.invalidate).toHaveBeenCalled();
    expect(mockUtils.entries.getInstances.invalidate).toHaveBeenCalled();
  });

  it('mutation中はキャッシュ無効化をスキップする', () => {
    mockIsMutating = true;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => useEntryRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'UPDATE',
      new: { id: 'entry-1' },
      old: null,
    });

    expect(mockUtils.entries.list.invalidate).not.toHaveBeenCalled();
  });

  it('DELETE イベントで old.id を使用する', () => {
    mockIsMutating = false;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => useEntryRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'DELETE',
      new: null,
      old: { id: 'entry-deleted' },
    });

    expect(mockUtils.entries.getById.invalidate).toHaveBeenCalledWith({ id: 'entry-deleted' });
  });
});
