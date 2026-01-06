'use client';

import { create } from 'zustand';

import type { RecurringEditScope } from '../components/RecurringEditConfirmDialog';

interface RecurringEditConfirmState {
  isOpen: boolean;
  planTitle: string | null;
  mode: 'edit' | 'delete';
  onConfirm: ((scope: RecurringEditScope) => Promise<void>) | null;
  openDialog: (
    planTitle: string | null,
    mode: 'edit' | 'delete',
    onConfirm: (scope: RecurringEditScope) => Promise<void>,
  ) => void;
  closeDialog: () => void;
}

/**
 * 繰り返しプラン編集確認ダイアログの状態管理
 *
 * Googleカレンダー風のスコープ選択:
 * - このイベントのみ
 * - このイベント以降すべて
 * - すべてのイベント
 */
export const useRecurringEditConfirmStore = create<RecurringEditConfirmState>((set) => ({
  isOpen: false,
  planTitle: null,
  mode: 'edit',
  onConfirm: null,
  openDialog: (planTitle, mode, onConfirm) =>
    set({
      isOpen: true,
      planTitle,
      mode,
      onConfirm,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      planTitle: null,
      mode: 'edit',
      onConfirm: null,
    }),
}));
