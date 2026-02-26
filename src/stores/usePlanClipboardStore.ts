'use client';

import { create } from 'zustand';

/**
 * クリップボードにコピーされたプランの情報
 */
export interface ClipboardPlan {
  /** タイトル */
  title: string;
  /** 説明 */
  description: string | null;
  /** 期間（分単位） */
  duration: number;
  /** 開始時刻（時） */
  startHour: number;
  /** 開始時刻（分） */
  startMinute: number;
  /** タグID配列 */
  tagIds: string[] | undefined;
}

/**
 * 最後にクリックした日付（Googleカレンダー互換のペースト用）
 * 時刻はコピー元のものを使用するため、日付のみ記憶
 */
export interface LastClickedPosition {
  date: Date;
}

interface PlanClipboardState {
  /** コピーされたプラン */
  copiedPlan: ClipboardPlan | null;
  /** 最後にクリックした位置（Cmd+Vでペーストする位置） */
  lastClickedPosition: LastClickedPosition | null;
}

interface PlanClipboardActions {
  /** プランをクリップボードにコピー */
  copyPlan: (plan: ClipboardPlan) => void;
  /** クリップボードをクリア */
  clearClipboard: () => void;
  /** クリップボードにプランがあるかチェック */
  hasCopiedPlan: () => boolean;
  /** 最後にクリックした位置を設定（Googleカレンダー互換のCmd+Vペースト用） */
  setLastClickedPosition: (position: LastClickedPosition) => void;
  /** 最後にクリックした位置をクリア */
  clearLastClickedPosition: () => void;
}

type PlanClipboardStore = PlanClipboardState & PlanClipboardActions;

/**
 * プランクリップボードStore
 *
 * プランのコピー＆ペースト機能用のクリップボード管理
 * - コピー: プランの情報を保存
 * - ペースト: 保存された情報を使って新規プランをドラフトモードで作成
 */
export const usePlanClipboardStore = create<PlanClipboardStore>((set, get) => ({
  // State
  copiedPlan: null,
  lastClickedPosition: null,

  // Actions
  copyPlan: (plan) => {
    set({ copiedPlan: plan });
  },

  clearClipboard: () => {
    set({ copiedPlan: null });
  },

  hasCopiedPlan: () => {
    return get().copiedPlan !== null;
  },

  setLastClickedPosition: (position) => {
    set({ lastClickedPosition: position });
  },

  clearLastClickedPosition: () => {
    set({ lastClickedPosition: null });
  },
}));
