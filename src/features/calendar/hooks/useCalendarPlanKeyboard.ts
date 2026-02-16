'use client';

import { useEffect, useRef } from 'react';

import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { usePlanClipboardStore } from '@/features/plans/stores/usePlanClipboardStore';
import type { PlanInitialData } from '@/features/plans/stores/usePlanInspectorStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { toast } from 'sonner';

interface UseCalendarPlanKeyboardOptions {
  /** ショートカットを有効にするか */
  enabled?: boolean;
  /** 現在選択中（Inspector表示中）のプランを削除する関数 */
  onDeletePlan?: (planId: string) => Promise<void>;
  /** 現在選択中のプランのタイトルを取得する関数 */
  getSelectedPlanTitle?: () => string | null;
  /** 新規プラン作成時の初期データ取得関数（現在の日時など） */
  getInitialPlanData?: () => PlanInitialData | undefined;
  /** 現在選択中のプランのコピー情報を取得する関数 */
  getSelectedPlanForCopy?: () => {
    title: string;
    description: string | null;
    startHour: number;
    startMinute: number;
    duration: number;
    tagIds: string[] | undefined;
  } | null;
  /** ペースト先の日付を取得する関数（デフォルトは現在表示中の日付） */
  getPasteDateForKeyboard?: () => Date;
}

/**
 * カレンダー用プラン操作キーボードショートカット
 *
 * Google Calendar互換のショートカット：
 * - Delete / Backspace: 選択中のプランを削除
 * - C: 新規プラン作成（現在時刻）
 * - Shift + C: 新規プラン作成（時刻指定なし）
 * - Cmd/Ctrl + C: 選択中のプランをコピー
 * - Cmd/Ctrl + V: コピーしたプランをペースト（ドラフトモード）
 * - Escape: Inspectorを閉じる
 *
 * @example
 * ```tsx
 * const { deletePlan } = usePlanMutations()
 *
 * useCalendarPlanKeyboard({
 *   enabled: true,
 *   onDeletePlan: (planId) => deletePlan.mutate({ id: planId }),
 *   getInitialPlanData: () => ({
 *     start_time: new Date().toISOString(),
 *     end_time: addHours(new Date(), 1).toISOString(),
 *   }),
 * })
 * ```
 */
export function useCalendarPlanKeyboard({
  enabled = true,
  onDeletePlan,
  getSelectedPlanTitle,
  getInitialPlanData,
  getSelectedPlanForCopy,
  getPasteDateForKeyboard,
}: UseCalendarPlanKeyboardOptions) {
  const { isOpen, planId, openInspector, closeInspector } = usePlanInspectorStore();
  const { openDialog } = useDeleteConfirmStore();

  // コールバックの最新値を参照
  const onDeletePlanRef = useRef(onDeletePlan);
  const getSelectedPlanTitleRef = useRef(getSelectedPlanTitle);
  const getInitialPlanDataRef = useRef(getInitialPlanData);
  const getSelectedPlanForCopyRef = useRef(getSelectedPlanForCopy);
  const getPasteDateForKeyboardRef = useRef(getPasteDateForKeyboard);
  useEffect(() => {
    onDeletePlanRef.current = onDeletePlan;
    getSelectedPlanTitleRef.current = getSelectedPlanTitle;
    getInitialPlanDataRef.current = getInitialPlanData;
    getSelectedPlanForCopyRef.current = getSelectedPlanForCopy;
    getPasteDateForKeyboardRef.current = getPasteDateForKeyboard;
  }, [
    onDeletePlan,
    getSelectedPlanTitle,
    getInitialPlanData,
    getSelectedPlanForCopy,
    getPasteDateForKeyboard,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はショートカットを無効化
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[role="dialog"]') !== null ||
        target.closest('[data-inspector]') !== null;

      // Escapeキー: Inspectorを閉じる（入力フィールドでも有効）
      if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          closeInspector();
        }
        return;
      }

      // 入力フィールドにフォーカスがある場合は以降のショートカットを無効化
      if (isInputFocused) return;

      // Delete / Backspace: 選択中のプランの削除確認ダイアログを表示
      if ((e.key === 'Delete' || e.key === 'Backspace') && isOpen && planId) {
        e.preventDefault();
        const title = getSelectedPlanTitleRef.current?.() ?? null;
        const deleteCallback = onDeletePlanRef.current;
        if (deleteCallback) {
          openDialog(planId, title, async () => {
            await deleteCallback(planId);
            closeInspector();
          });
        }
        return;
      }

      // Cmd/Ctrl + C: コピー
      if ((e.key === 'c' || e.key === 'C') && (e.metaKey || e.ctrlKey)) {
        // Inspectorで選択中のプランがある場合のみコピー
        if (isOpen && planId) {
          const planData = getSelectedPlanForCopyRef.current?.();
          if (planData) {
            e.preventDefault();
            usePlanClipboardStore.getState().copyPlan(planData);
            toast.success('コピーしました');
          }
        }
        return;
      }

      // Cmd/Ctrl + V: ペースト（Googleカレンダー互換: 最後にクリックした日付へ、時刻はコピー元）
      if ((e.key === 'v' || e.key === 'V') && (e.metaKey || e.ctrlKey)) {
        const clipboard = usePlanClipboardStore.getState();
        const copiedPlan = clipboard.copiedPlan;
        if (copiedPlan) {
          e.preventDefault();

          // 最後にクリックした日付があればその日付へ、なければデフォルト
          const lastClicked = clipboard.lastClickedPosition;
          const targetDate =
            lastClicked?.date ?? getPasteDateForKeyboardRef.current?.() ?? new Date();

          // 時刻は常にコピー元の時刻を使用
          const startTime = new Date(targetDate);
          startTime.setHours(copiedPlan.startHour, copiedPlan.startMinute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + copiedPlan.duration);

          const { openInspectorWithDraft } = usePlanInspectorStore.getState();
          openInspectorWithDraft({
            title: copiedPlan.title,
            description: copiedPlan.description,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          });
        }
        return;
      }

      // C: 新規プラン作成（単独のCキー）
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();

        if (e.shiftKey) {
          // Shift + C: 時刻指定なしで新規作成
          openInspector(null);
        } else {
          // C: 現在時刻ベースで新規作成
          const initialData = getInitialPlanDataRef.current?.();
          // exactOptionalPropertyTypes対応: undefinedの場合はオプションを渡さない
          if (initialData) {
            openInspector(null, { initialData });
          } else {
            openInspector(null);
          }
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, isOpen, planId, openInspector, closeInspector, openDialog]);
}
