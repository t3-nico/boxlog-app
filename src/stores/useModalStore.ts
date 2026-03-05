'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

/**
 * 設定カテゴリの識別子
 */
export type SettingsCategory =
  | 'general'
  | 'calendar'
  | 'personalization'
  | 'notifications'
  | 'data-controls'
  | 'integrations'
  | 'account'
  | 'subscription';

/**
 * 繰り返しプラン編集時のスコープ
 */
export type RecurringEditScope = 'this' | 'thisAndFuture' | 'all';

/**
 * モーダル状態の判別共用体
 *
 * 5つの個別モーダルstoreを1つに統合。
 * `type` フィールドで判別し、TypeScriptの型絞り込みが有効。
 */
export type ModalState =
  | {
      type: 'deleteConfirm';
      planId: string;
      planTitle: string | null;
      onConfirm: () => Promise<void>;
    }
  | {
      type: 'tagCreate';
      defaultGroup?: string;
    }
  | {
      type: 'tagMerge';
      sourceTag: { id: string; name: string; color?: string | null };
    }
  | {
      type: 'settings';
      category: SettingsCategory;
    }
  | {
      type: 'recurringEdit';
      planTitle: string | null;
      mode: 'edit' | 'delete';
      onConfirm: (scope: RecurringEditScope) => Promise<void>;
    };

interface ModalStoreState {
  /** 現在開いているモーダル（null = すべて閉じている） */
  modal: ModalState | null;
  /** モーダルを開く */
  openModal: (modal: ModalState) => void;
  /** モーダルを閉じる */
  closeModal: () => void;
  /** Settings モーダルのカテゴリを変更（settings モーダルが開いている場合のみ有効） */
  setSettingsCategory: (category: SettingsCategory) => void;
}

const useModalStoreBase = create<ModalStoreState>()(
  devtools(
    (set) => ({
      modal: null,
      openModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: null }),
      setSettingsCategory: (category) =>
        set((state) => {
          if (state.modal?.type === 'settings') {
            return { modal: { ...state.modal, category } };
          }
          return state;
        }),
    }),
    { name: 'modal-store' },
  ),
);

/**
 * 統合モーダルStore
 *
 * 旧 useDeleteConfirmStore, useTagCreateModalStore, useTagMergeModalStore,
 * useSettingsModalStore, useRecurringEditConfirmStore を1つに統合。
 *
 * @example
 * ```tsx
 * // モーダルの状態取得
 * const modal = useModalStore.use.modal();
 * const isDeleteConfirm = modal?.type === 'deleteConfirm';
 *
 * // モーダルを開く（便利関数を使用）
 * openDeleteConfirm(planId, planTitle, onConfirm);
 * openSettingsModal('general');
 *
 * // モーダルを閉じる
 * const closeModal = useModalStore.use.closeModal();
 * closeModal();
 * ```
 */
export const useModalStore = createSelectors(useModalStoreBase);

// ── 便利関数（旧storeの openDialog/openModal を置き換え） ──

export function openDeleteConfirm(
  planId: string,
  planTitle: string | null,
  onConfirm: () => Promise<void>,
) {
  useModalStore.getState().openModal({ type: 'deleteConfirm', planId, planTitle, onConfirm });
}

export function openTagCreateModal(defaultGroup?: string) {
  useModalStore
    .getState()
    .openModal(defaultGroup ? { type: 'tagCreate', defaultGroup } : { type: 'tagCreate' });
}

export function openTagMergeModal(sourceTag: { id: string; name: string; color?: string | null }) {
  useModalStore.getState().openModal({ type: 'tagMerge', sourceTag });
}

export function openSettingsModal(category: SettingsCategory = 'general') {
  useModalStore.getState().openModal({ type: 'settings', category });
}

export function openRecurringEditConfirm(
  planTitle: string | null,
  mode: 'edit' | 'delete',
  onConfirm: (scope: RecurringEditScope) => Promise<void>,
) {
  useModalStore.getState().openModal({ type: 'recurringEdit', planTitle, mode, onConfirm });
}

export function closeModal() {
  useModalStore.getState().closeModal();
}
