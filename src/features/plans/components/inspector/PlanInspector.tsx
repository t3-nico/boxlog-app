'use client'

import { InspectorContent, InspectorShell, useInspectorKeyboard, type InspectorDisplayMode } from '@/features/inspector'

import { usePlan } from '../../hooks/usePlan'
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore'
import type { Plan } from '../../types/plan'

import { useInspectorNavigation } from './hooks'
import { PlanInspectorContent } from './PlanInspectorContent'

/**
 * Plan Inspector（全ページ共通）
 *
 * 共通Inspector基盤を使用
 * displayModeに応じてSheet（サイドパネル）またはDialog（ポップアップ）で表示
 */
export function PlanInspector() {
  const isOpen = usePlanInspectorStore((state) => state.isOpen)
  const planId = usePlanInspectorStore((state) => state.planId)
  const displayMode = usePlanInspectorStore((state) => state.displayMode) as InspectorDisplayMode
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector)

  const { data: planData, isLoading } = usePlan(planId!, { includeTags: true, enabled: !!planId })
  const plan = (planData ?? null) as unknown as Plan | null

  // ナビゲーション
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId)

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    hasPrevious,
    hasNext,
    onClose: closeInspector,
    onPrevious: goToPrevious,
    onNext: goToNext,
  })

  return (
    <InspectorShell
      isOpen={isOpen}
      onClose={closeInspector}
      displayMode={displayMode}
      title={plan?.title || '予定の詳細'}
      resizable={displayMode === 'sheet'}
      modal={false}
    >
      <InspectorContent isLoading={isLoading} hasData={!!plan} emptyMessage="プランが見つかりません">
        <PlanInspectorContent />
      </InspectorContent>
    </InspectorShell>
  )
}
