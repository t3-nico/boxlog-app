'use client'

import { useCallback, useMemo } from 'react'

import { useInboxFocusStore } from '@/features/inbox/stores/useInboxFocusStore'

import { usePlans } from '../../../hooks/usePlans'
import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore'

export function useInspectorNavigation(planId: string | null) {
  const openInspector = usePlanInspectorStore((state) => state.openInspector)
  const setFocusedId = useInboxFocusStore((state) => state.setFocusedId)

  const { data: allPlans = [] } = usePlans()

  const currentIndex = useMemo(() => {
    return allPlans.findIndex((t) => t.id === planId)
  }, [allPlans, planId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < allPlans.length - 1

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevPlanId = allPlans[currentIndex - 1]!.id
      openInspector(prevPlanId)
      setFocusedId(prevPlanId)
    }
  }, [hasPrevious, allPlans, currentIndex, openInspector, setFocusedId])

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextPlanId = allPlans[currentIndex + 1]!.id
      openInspector(nextPlanId)
      setFocusedId(nextPlanId)
    }
  }, [hasNext, allPlans, currentIndex, openInspector, setFocusedId])

  return {
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  }
}
