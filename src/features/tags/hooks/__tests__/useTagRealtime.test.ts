import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks ---

const mockUtils = {
  tags: {
    list: { invalidate: vi.fn() },
    listParentTags: { invalidate: vi.fn() },
    getById: { invalidate: vi.fn() },
  },
};

vi.mock('@/lib/trpc', () => ({
  api: {
    useUtils: () => mockUtils,
  },
}));

let mockMutationCount = 0;
vi.mock('@/stores/useTagCacheStore', () => ({
  useTagCacheStore: (selector: (state: { mutationCount: number }) => boolean) =>
    selector({ mutationCount: mockMutationCount }),
}));

const mockUseRealtimeSubscription = vi.fn();
vi.mock('@/lib/supabase/realtime/useRealtimeSubscription', () => ({
  useRealtimeSubscription: (config: Record<string, unknown>) => mockUseRealtimeSubscription(config),
}));

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() },
}));

import { useTagRealtime } from '../useTagRealtime';

describe('useTagRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutationCount = 0;
  });

  it('tagsテーブルを購読する', () => {
    renderHook(() => useTagRealtime('user-1'));

    expect(mockUseRealtimeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'tags',
        channelName: 'tag-changes-user-1',
      }),
    );
  });

  it('mutationCount > 0の場合はイベントをスキップする（参照カウント方式）', () => {
    mockMutationCount = 2;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => useTagRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'UPDATE',
      new: { id: 'tag-1' },
      old: null,
    });

    expect(mockUtils.tags.list.invalidate).not.toHaveBeenCalled();
  });

  it('mutationCount = 0の場合はキャッシュを無効化する', () => {
    mockMutationCount = 0;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => useTagRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'INSERT',
      new: { id: 'tag-new' },
      old: null,
    });

    expect(mockUtils.tags.list.invalidate).toHaveBeenCalled();
    expect(mockUtils.tags.listParentTags.invalidate).toHaveBeenCalled();
    expect(mockUtils.tags.getById.invalidate).toHaveBeenCalledWith({ id: 'tag-new' });
  });

  it('IDがない場合はgetByIdの無効化をスキップする', () => {
    mockMutationCount = 0;
    let capturedOnEvent: (payload: unknown) => void;

    mockUseRealtimeSubscription.mockImplementation(
      (config: { onEvent: (payload: unknown) => void }) => {
        capturedOnEvent = config.onEvent;
      },
    );

    renderHook(() => useTagRealtime('user-1'));

    capturedOnEvent!({
      eventType: 'DELETE',
      new: null,
      old: null,
    });

    expect(mockUtils.tags.list.invalidate).toHaveBeenCalled();
    expect(mockUtils.tags.getById.invalidate).not.toHaveBeenCalled();
  });
});
