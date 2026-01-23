import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Plan Inspector状態管理
 *
 * features/inspector パターンに準拠しつつ、Plan固有の拡張を追加
 * - instanceDate: 繰り返しプランの特定インスタンス日付
 *
 * @see {@link @/features/inspector} 基本パターン
 */

/**
 * Inspector表示モード
 * - sheet: サイドパネル（右側に固定表示）
 * - popover: ポップアップ（クリック位置に表示）
 */
export type InspectorDisplayMode = 'sheet' | 'popover';

/**
 * Plan作成時に事前設定するデータ
 */
export interface PlanInitialData {
  start_time?: string; // ISO datetime string
  end_time?: string; // ISO datetime string
  // 将来的に追加可能: title?, description?, tags?, etc.
}

/**
 * Popover位置情報
 */
export interface PopoverPosition {
  x: number;
  y: number;
}

/**
 * Draft Plan（ローカルのみ、未保存のプラン）
 */
export interface DraftPlan {
  title: string;
  description: string | null;
  status: 'open';
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

/**
 * Plan Inspector Store の状態
 */
interface PlanInspectorState {
  /** Inspector が開いているか */
  isOpen: boolean;
  /** 対象プランのID（null = 新規作成モード） */
  planId: string | null;
  /** 繰り返しプランの特定インスタンス日付（YYYY-MM-DD形式） */
  instanceDate: string | null;
  /** 新規作成時の初期データ */
  initialData?: PlanInitialData | undefined;
  /** 表示モード（sheet: サイドパネル, popover: ポップアップ） */
  displayMode: InspectorDisplayMode;
  /** Popoverのアンカー要素の位置情報 */
  popoverAnchor?: { x: number; y: number } | undefined;
  /** Popoverの保存された位置（ドラッグ移動後） */
  popoverPosition: PopoverPosition | null;
  /** ローカルのみのドラフトプラン（未保存） */
  draftPlan: DraftPlan | null;
}

/**
 * Plan Inspector Store のアクション
 */
interface PlanInspectorActions {
  /** Inspector を開く */
  openInspector: (
    planId: string | null,
    options?: {
      initialData?: PlanInitialData;
      instanceDate?: string;
      anchor?: { x: number; y: number };
    },
  ) => void;
  /** Inspector を閉じる */
  closeInspector: () => void;
  /** 表示モードを変更する */
  setDisplayMode: (mode: InspectorDisplayMode) => void;
  /** Popoverの位置を保存する */
  setPopoverPosition: (position: PopoverPosition | null) => void;
  /** ドラフトモードでInspectorを開く（DB未保存） */
  openInspectorWithDraft: (initialData?: Partial<DraftPlan>) => void;
  /** ドラフトをクリアする */
  clearDraft: () => void;
  /** ドラフトを更新する */
  updateDraft: (updates: Partial<DraftPlan>) => void;
}

/**
 * Plan Inspector Store 型
 */
type PlanInspectorStore = PlanInspectorState & PlanInspectorActions;

export const usePlanInspectorStore = create<PlanInspectorStore>()(
  devtools(
    persist(
      (set) => ({
        isOpen: false,
        planId: null,
        instanceDate: null,
        initialData: undefined,
        displayMode: 'sheet',
        popoverAnchor: undefined,
        popoverPosition: null,
        draftPlan: null,

        openInspector: (planId, options) =>
          set(
            {
              isOpen: true,
              planId,
              instanceDate: options?.instanceDate ?? null,
              initialData: planId === null ? options?.initialData : undefined,
              popoverAnchor: options?.anchor,
              draftPlan: null, // 既存プランを開く時はdraftをクリア
            },
            false,
            'openInspector',
          ),

        closeInspector: () => {
          // カレンダーのドラッグ選択をクリア
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
          }
          set(
            {
              isOpen: false,
              planId: null,
              instanceDate: null,
              initialData: undefined,
              popoverAnchor: undefined,
              draftPlan: null, // 閉じる時はdraftもクリア
            },
            false,
            'closeInspector',
          );
        },

        setDisplayMode: (mode) => set({ displayMode: mode }, false, 'setDisplayMode'),

        setPopoverPosition: (position) =>
          set({ popoverPosition: position }, false, 'setPopoverPosition'),

        openInspectorWithDraft: (initialData) =>
          set(
            {
              isOpen: true,
              planId: null,
              instanceDate: null,
              initialData: undefined,
              draftPlan: {
                title: initialData?.title ?? '',
                description: initialData?.description ?? null,
                status: 'open',
                due_date: initialData?.due_date ?? null,
                start_time: initialData?.start_time ?? null,
                end_time: initialData?.end_time ?? null,
              },
            },
            false,
            'openInspectorWithDraft',
          ),

        clearDraft: () => set({ draftPlan: null }, false, 'clearDraft'),

        updateDraft: (updates) =>
          set(
            (state) => ({
              draftPlan: state.draftPlan ? { ...state.draftPlan, ...updates } : null,
            }),
            false,
            'updateDraft',
          ),
      }),
      {
        name: 'plan-inspector-settings',
        // displayModeとpopoverPositionのみ永続化
        partialize: (state) => ({
          displayMode: state.displayMode,
          popoverPosition: state.popoverPosition,
        }),
      },
    ),
    { name: 'plan-inspector-store' },
  ),
);
