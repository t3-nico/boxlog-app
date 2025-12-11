'use client'

import { useEffect, useRef } from 'react'

import type { PlanInitialData } from '@/features/plans/stores/usePlanInspectorStore'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'

interface UseCalendarPlanKeyboardOptions {
  /** ショートカットを有効にするか */
  enabled?: boolean
  /** 現在選択中（Inspector表示中）のプランを削除する関数 */
  onDeletePlan?: (planId: string) => void
  /** 新規プラン作成時の初期データ取得関数（現在の日時など） */
  getInitialPlanData?: () => PlanInitialData | undefined
}

/**
 * カレンダー用プラン操作キーボードショートカット
 *
 * Google Calendar互換のショートカット：
 * - Delete / Backspace: 選択中のプランを削除
 * - C: 新規プラン作成（現在時刻）
 * - Shift + C: 新規プラン作成（時刻指定なし）
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
  getInitialPlanData,
}: UseCalendarPlanKeyboardOptions) {
  const { isOpen, planId, openInspector, closeInspector } = usePlanInspectorStore()

  // コールバックの最新値を参照
  const onDeletePlanRef = useRef(onDeletePlan)
  const getInitialPlanDataRef = useRef(getInitialPlanData)
  useEffect(() => {
    onDeletePlanRef.current = onDeletePlan
    getInitialPlanDataRef.current = getInitialPlanData
  }, [onDeletePlan, getInitialPlanData])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はショートカットを無効化
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[role="dialog"]') !== null ||
        target.closest('[data-inspector]') !== null

      // Escapeキー: Inspectorを閉じる（入力フィールドでも有効）
      if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault()
          closeInspector()
        }
        return
      }

      // 入力フィールドにフォーカスがある場合は以降のショートカットを無効化
      if (isInputFocused) return

      // Delete / Backspace: 選択中のプランを削除
      if ((e.key === 'Delete' || e.key === 'Backspace') && isOpen && planId) {
        e.preventDefault()
        onDeletePlanRef.current?.(planId)
        closeInspector()
        return
      }

      // C: 新規プラン作成
      if (e.key === 'c' || e.key === 'C') {
        // Cmd/Ctrl + C はコピーなのでスキップ
        if (e.metaKey || e.ctrlKey) return

        e.preventDefault()

        if (e.shiftKey) {
          // Shift + C: 時刻指定なしで新規作成
          openInspector(null)
        } else {
          // C: 現在時刻ベースで新規作成
          const initialData = getInitialPlanDataRef.current?.()
          // exactOptionalPropertyTypes対応: undefinedの場合はオプションを渡さない
          if (initialData) {
            openInspector(null, { initialData })
          } else {
            openInspector(null)
          }
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, isOpen, planId, openInspector, closeInspector])
}
