import { create } from 'zustand';

/**
 * Tag キャッシュストア
 *
 * TanStack Queryのキャッシュを補完し、Realtime更新との競合を防止
 *
 * 用途:
 * - mutation実行中フラグ管理（Realtime二重更新防止）
 * - 複数コンポーネント間でのタグ状態同期
 */

interface TagCacheState {
  // mutation実行中フラグ（Realtime二重更新防止用）
  isMutating: boolean;
  setIsMutating: (value: boolean) => void;
  // invalidate完了待機中フラグ（Race Condition防止用）
  isSettling: boolean;
  setIsSettling: (value: boolean) => void;
}

export const useTagCacheStore = create<TagCacheState>((set) => ({
  isMutating: false,
  setIsMutating: (value) => set({ isMutating: value }),
  isSettling: false,
  setIsSettling: (value) => set({ isSettling: value }),
}));
