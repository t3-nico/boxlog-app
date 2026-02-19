import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Plan Inspector状態管理
 *
 * features/inspector パターンに準拠しつつ、Plan固有の拡張を追加
 * - instanceDate: 繰り返しプランの特定インスタンス日付
 *
 * @see {@link @/features/inspector} 基本パターン
 */

/**
 * Plan作成時に事前設定するデータ
 */
export interface PlanInitialData {
  start_time?: string; // ISO datetime string
  end_time?: string; // ISO datetime string
  // 将来的に追加可能: title?, description?, tags?, etc.
}

/**
 * Draft Plan（ローカルのみ、未保存のプラン）
 *
 * PlanとRecord両方の作成に使用される共通インターフェース
 * Record作成時には追加フィールド（tagIds, plan_id, note）も使用
 */
export interface DraftPlan {
  title: string;
  description: string | null;
  status: 'open';
  start_time: string | null;
  end_time: string | null;
  reminder_minutes?: number | null;
  // Record作成時に使用する追加フィールド
  tagIds?: string[];
  plan_id?: string | null;
  note?: string | null;
}

/**
 * 未保存の変更（Google Calendar準拠: 閉じる時に保存）
 * Note: undefined は「このフィールドを変更しない」を意味する
 */
export interface PendingChanges {
  title?: string;
  description?: string;
  status?: 'open' | 'closed';
  start_time?: string | null;
  end_time?: string | null;
  reminder_minutes?: number | null;
  recurrence_rule?: string | null;
}

/**
 * 新規作成時のエントリタイプ
 */
export type CreateEntryType = 'plan' | 'record';

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
  /** ローカルのみのドラフトプラン（未保存） */
  draftPlan: DraftPlan | null;
  /** 未保存の変更（Google Calendar準拠: 閉じる時に一括保存） */
  pendingChanges: PendingChanges | null;
  /** 新規作成時のエントリタイプ（plan または record） */
  createType: CreateEntryType;
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
    },
  ) => void;
  /** Inspector を閉じる */
  closeInspector: () => void;
  /** ドラフトモードでInspectorを開く（DB未保存） */
  openInspectorWithDraft: (initialData?: Partial<DraftPlan>, createType?: CreateEntryType) => void;
  /** 新規作成時のエントリタイプを変更 */
  setCreateType: (type: CreateEntryType) => void;
  /** ドラフトをクリアする */
  clearDraft: () => void;
  /** ドラフトを更新する */
  updateDraft: (updates: Partial<DraftPlan>) => void;
  /** 未保存の変更を追加（Google Calendar準拠） */
  addPendingChange: (changes: Partial<PendingChanges>) => void;
  /** 未保存の変更をクリア */
  clearPendingChanges: () => void;
  /** 未保存の変更を取得してクリア（保存前に呼ぶ） */
  consumePendingChanges: () => PendingChanges | null;
}

/**
 * Plan Inspector Store 型
 */
type PlanInspectorStore = PlanInspectorState & PlanInspectorActions;

export const usePlanInspectorStore = create<PlanInspectorStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      planId: null,
      instanceDate: null,
      initialData: undefined,
      draftPlan: null,
      pendingChanges: null,
      createType: 'plan',

      openInspector: (planId, options) =>
        set(
          {
            isOpen: true,
            planId,
            instanceDate: options?.instanceDate ?? null,
            initialData: planId === null ? options?.initialData : undefined,
            draftPlan: null, // 既存プランを開く時はdraftをクリア
            pendingChanges: null, // 別のプランを開く時は未保存の変更をクリア
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
            draftPlan: null, // 閉じる時はdraftもクリア
            pendingChanges: null, // 未保存の変更もクリア（saveAndClose経由で呼ばれる想定）
            createType: 'plan', // リセット
          },
          false,
          'closeInspector',
        );
      },

      openInspectorWithDraft: (initialData, createType = 'plan') =>
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
              start_time: initialData?.start_time ?? null,
              end_time: initialData?.end_time ?? null,
              ...(initialData?.reminder_minutes !== undefined && {
                reminder_minutes: initialData.reminder_minutes,
              }),
              // Record作成時に使用する追加フィールド
              tagIds: initialData?.tagIds ?? [],
              plan_id: initialData?.plan_id ?? null,
              note: initialData?.note ?? null,
            },
            createType,
          },
          false,
          'openInspectorWithDraft',
        ),

      setCreateType: (type) => set({ createType: type }, false, 'setCreateType'),

      clearDraft: () => set({ draftPlan: null }, false, 'clearDraft'),

      updateDraft: (updates) =>
        set(
          (state) => ({
            draftPlan: state.draftPlan ? { ...state.draftPlan, ...updates } : null,
          }),
          false,
          'updateDraft',
        ),

      addPendingChange: (changes) =>
        set(
          (state) => ({
            pendingChanges: state.pendingChanges
              ? { ...state.pendingChanges, ...changes }
              : changes,
          }),
          false,
          'addPendingChange',
        ),

      clearPendingChanges: () => set({ pendingChanges: null }, false, 'clearPendingChanges'),

      consumePendingChanges: () => {
        const { pendingChanges } = get();
        if (pendingChanges) {
          set({ pendingChanges: null }, false, 'consumePendingChanges');
        }
        return pendingChanges;
      },
    }),
    { name: 'plan-inspector-store' },
  ),
);
