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

  /** タグなしアイテムの表示設定 */
  showUntagged: boolean;

  /** 初期化済みフラグ（タグ一覧取得後に初期化） */
  initialized: boolean;
}

export interface CalendarFilterActions {
  /** 種類の表示切替 */
  toggleType: (type: ItemType) => void;

  /** タグの表示切替 */
  toggleTag: (tagId: string) => void;

  /** タグなしの表示切替 */
  toggleUntagged: () => void;

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

  /** 種類が表示中かチェック */
  isTypeVisible: (type: ItemType) => boolean;

  /** タグが表示中かチェック */
  isTagVisible: (tagId: string) => boolean;

  /** グループ内のタグの表示状態を取得（all: 全ON, none: 全OFF, some: 一部） */
  getGroupVisibility: (tagIds: string[]) => 'all' | 'none' | 'some';

  /** プランが表示対象かチェック（種類とタグの両方） */
  isPlanVisible: (planTagIds: string[]) => boolean;
}

type CalendarFilterStore = CalendarFilterState & CalendarFilterActions;

// シリアライズ済みの状態型
interface SerializedCalendarFilterState {
  visibleTypes: Record<ItemType, boolean>;
  visibleTagIds: string[];
  showUntagged: boolean;
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
      showUntagged: true,
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

      toggleUntagged: () =>
        set((state) => ({
          showUntagged: !state.showUntagged,
        })),

      showAllTags: (tagIds) =>
        set(() => ({
          visibleTagIds: new Set(tagIds),
          showUntagged: true,
        })),

      hideAllTags: () =>
        set(() => ({
          visibleTagIds: new Set(),
          showUntagged: false,
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

      isPlanVisible: (planTagIds) => {
        const state = get();

        // 種類チェック（現時点ではPlanのみ）
        if (!state.visibleTypes.plan) {
          return false;
        }

        // タグなしの場合
        if (planTagIds.length === 0) {
          return state.showUntagged;
        }

        // いずれかのタグが表示中なら表示
        return planTagIds.some((tagId) => state.visibleTagIds.has(tagId));
      },
    }),
    {
      name: 'calendar-filter-storage',
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
    },
  ),
);
