'use client'

import { create } from 'zustand'

interface DeleteConfirmState {
  isOpen: boolean
  planId: string | null
  planTitle: string | null
  onConfirm: (() => Promise<void>) | null
  openDialog: (planId: string, planTitle: string | null, onConfirm: () => Promise<void>) => void
  closeDialog: () => void
}

/**
 * 削除確認ダイアログの状態管理
 *
 * PlanInspector（Sheet内）からAlertDialogを分離するためのストア
 * Sheet内でAlertDialogを開くとPortalの問題が発生するため、
 * AppLayoutレベルでAlertDialogをレンダリングする
 */
export const useDeleteConfirmStore = create<DeleteConfirmState>((set) => ({
  isOpen: false,
  planId: null,
  planTitle: null,
  onConfirm: null,
  openDialog: (planId, planTitle, onConfirm) =>
    set({
      isOpen: true,
      planId,
      planTitle,
      onConfirm,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      planId: null,
      planTitle: null,
      onConfirm: null,
    }),
}))
