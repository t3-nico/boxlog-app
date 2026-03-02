/**
 * カレンダー表示フィルターストア
 *
 * Googleカレンダーの「マイカレンダー」のように、
 * 種類（Plan/Record）やタグでカレンダー上の表示/非表示を切り替える
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** アイテムの種類 */
export type ItemType = 'plan' | 'record';

export interface CalendarFilterState {
  /** 種類ごとの表示設定（デフォルト: すべて表示） */
  visibleTypes: Record<ItemType, boolean>;

  /** タグIDごとの表示設定（デフォルト: すべて表示） */
  visibleTagIds: Set<string>;

  /** 初期化済みフラグ（タグ一覧取得後に初期化） */
  initialized: boolean;
}

export interface CalendarFilterActions {
  /** 種類の表示切替 */
  toggleType: (type: ItemType) => void;

  /** タグの表示切替 */
  toggleTag: (tagId: string) => void;

  /** すべてのタグを表示 */
  showAllTags: (tagIds: string[]) => void;

  /** すべてのタグを非表示 */
  hideAllTags: () => void;

  /** グループ内のタグを一括表示 */
  showGroupTags: (tagIds: string[]) => void;

  /** グループ内のタグを一括非表示 */
  hideGroupTags: (tagIds: string[]) => void;

  /** グループ内のタグを一括切替（全ON→全OFF、それ以外→全ON） */
  toggleGroupTags: (tagIds: string[]) => void;

  /** タグ一覧で初期化（まだ設定がないタグを追加） */
  initializeWithTags: (tagIds: string[]) => void;

  /** 特定のタグを削除（マージ後などに使用） */
  removeTag: (tagId: string) => void;

  /** このタグだけ表示（他を全てOFF） */
  showOnlyTag: (tagId: string) => void;

  /** 指定タグだけ表示（グループ用） */
  showOnlyGroupTags: (tagIds: string[]) => void;

  /** 種類が表示中かチェック */
  isTypeVisible: (type: ItemType) => boolean;

  /** タグが表示中かチェック */
  isTagVisible: (tagId: string) => boolean;

  /** グループ内のタグの表示状態を取得（all: 全ON, none: 全OFF, some: 一部） */
  getGroupVisibility: (tagIds: string[]) => 'all' | 'none' | 'some';

  /** タグフィルタに一致するかチェック（種類は無視） */
  matchesTagFilter: (tagId: string | null) => boolean;

  /** エントリが表示対象かチェック（種類とタグの両方） */
  isPlanVisible: (tagId: string | null) => boolean;
}

type CalendarFilterStore = CalendarFilterState & CalendarFilterActions;

// シリアライズ済みの状態型
interface SerializedCalendarFilterState {
  visibleTypes: Record<ItemType, boolean>;
  visibleTagIds: string[];
  initialized: boolean;
}

// カスタムシリアライザー（Setの永続化対応）
const setSerializer = {
  serialize: (state: CalendarFilterState): SerializedCalendarFilterState => ({
    ...state,
    visibleTagIds: Array.from(state.visibleTagIds),
  }),
  deserialize: (state: SerializedCalendarFilterState): CalendarFilterState => ({
    ...state,
    visibleTagIds: new Set(state.visibleTagIds),
  }),
};

export const useCalendarFilterStore = create<CalendarFilterStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      visibleTypes: {
        plan: true,
        record: true,
      },
      visibleTagIds: new Set<string>(),
      initialized: false,

      // アクション
      toggleType: (type) =>
        set((state) => ({
          visibleTypes: {
            ...state.visibleTypes,
            [type]: !state.visibleTypes[type],
          },
        })),

      toggleTag: (tagId) =>
        set((state) => {
          const newSet = new Set(state.visibleTagIds);
          if (newSet.has(tagId)) {
            newSet.delete(tagId);
          } else {
            newSet.add(tagId);
          }
          return { visibleTagIds: newSet };
        }),

      showAllTags: (tagIds) =>
        set(() => ({
          visibleTagIds: new Set(tagIds),
        })),

      hideAllTags: () =>
        set(() => ({
          visibleTagIds: new Set(),
        })),

      showGroupTags: (tagIds) =>
        set((state) => {
          const newSet = new Set(state.visibleTagIds);
          tagIds.forEach((id) => newSet.add(id));
          return { visibleTagIds: newSet };
        }),

      hideGroupTags: (tagIds) =>
        set((state) => {
          const newSet = new Set(state.visibleTagIds);
          tagIds.forEach((id) => newSet.delete(id));
          return { visibleTagIds: newSet };
        }),

      toggleGroupTags: (tagIds) =>
        set((state) => {
          const newSet = new Set(state.visibleTagIds);
          // 全てONなら全てOFF、それ以外は全てON
          const allVisible = tagIds.every((id) => state.visibleTagIds.has(id));
          if (allVisible) {
            tagIds.forEach((id) => newSet.delete(id));
          } else {
            tagIds.forEach((id) => newSet.add(id));
          }
          return { visibleTagIds: newSet };
        }),

      initializeWithTags: (tagIds) =>
        set((state) => {
          if (state.initialized) {
            // すでに初期化済みの場合は、新しいタグのみ追加
            const newSet = new Set(state.visibleTagIds);
            tagIds.forEach((id) => {
              // 存在しないタグは追加（デフォルト表示）
              if (!state.visibleTagIds.has(id)) {
                newSet.add(id);
              }
            });
            return { visibleTagIds: newSet };
          }

          // 初回は全タグを表示
          return {
            visibleTagIds: new Set(tagIds),
            initialized: true,
          };
        }),

      removeTag: (tagId) =>
        set((state) => {
          const newSet = new Set(state.visibleTagIds);
          newSet.delete(tagId);
          return { visibleTagIds: newSet };
        }),

      showOnlyTag: (tagId) =>
        set(() => ({
          visibleTagIds: new Set([tagId]),
        })),

      showOnlyGroupTags: (tagIds) =>
        set(() => ({
          visibleTagIds: new Set(tagIds),
        })),

      isTypeVisible: (type) => get().visibleTypes[type],

      isTagVisible: (tagId) => get().visibleTagIds.has(tagId),

      getGroupVisibility: (tagIds) => {
        if (tagIds.length === 0) return 'none';
        const state = get();
        const visibleCount = tagIds.filter((id) => state.visibleTagIds.has(id)).length;
        if (visibleCount === 0) return 'none';
        if (visibleCount === tagIds.length) return 'all';
        return 'some';
      },

      matchesTagFilter: (tagId) => {
        const state = get();

        // タグなし → 常に表示（タグなしフィルター廃止）
        if (tagId === null) {
          return true;
        }

        return state.visibleTagIds.has(tagId);
      },

      isPlanVisible: (tagId) => {
        const state = get();

        // 種類チェック
        if (!state.visibleTypes.plan) {
          return false;
        }

        return get().matchesTagFilter(tagId);
      },
    }),
    {
      name: 'calendar-filter-storage',
      // バージョンを上げるとlocalStorageがリセットされる
      // v2: visibleTagIds競合問題の修正に伴いリセット
      // v3: showUntagged削除、matchesTagFilter/isPlanVisible単一タグ対応
      version: 3,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: setSerializer.deserialize(parsed.state),
          };
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: setSerializer.serialize(value.state as CalendarFilterState),
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // バージョンマイグレーション: 古いバージョンからの移行時はリセット
      migrate: (persistedState, version) => {
        if (version < 3) {
          return {
            visibleTypes: { plan: true, record: true },
            visibleTagIds: new Set<string>(),
            initialized: false,
          } as unknown as CalendarFilterStore;
        }
        return persistedState as CalendarFilterStore;
      },
    },
  ),
);
