import { create } from 'zustand';

/**
 * Record キャッシュデータ
 */
interface RecordCache {
  fulfillment_score?: number | null;
  note?: string | null;
  tagIds?: string[];
}

/**
 * Record キャッシュストア
 *
 * TanStack Query のキャッシュを補完し、複数コンポーネント間でのリアルタイム同期を実現
 *
 * 用途:
 * - fulfillment_score / note の即座の同期
 * - Inspector、Table が同時に開いている場合の状態管理
 * - mutation 実行中フラグ管理（Realtime 二重更新防止）
 */
interface RecordCacheState {
  /** Record ID → キャッシュデータのマップ */
  cache: Record<string, RecordCache>;

  /** キャッシュ更新 */
  updateCache: (recordId: string, data: RecordCache) => void;

  /** キャッシュ取得 */
  getCache: (recordId: string) => RecordCache | undefined;

  /** キャッシュクリア */
  clearCache: (recordId: string) => void;

  /** mutation 実行中フラグ（Realtime 二重更新防止用） */
  isMutating: boolean;
  setIsMutating: (value: boolean) => void;
}

export const useRecordCacheStore = create<RecordCacheState>((set, get) => ({
  cache: {},
  isMutating: false,

  updateCache: (recordId, data) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [recordId]: {
          ...state.cache[recordId],
          ...data,
        },
      },
    })),

  getCache: (recordId) => get().cache[recordId],

  clearCache: (recordId) =>
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[recordId];
      return { cache: newCache };
    }),

  setIsMutating: (value) => set({ isMutating: value }),
}));
