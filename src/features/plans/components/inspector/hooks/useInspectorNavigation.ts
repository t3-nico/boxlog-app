'use client';

import { useCallback, useMemo } from 'react';

import { usePlans } from '@/hooks/usePlans';
import { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';

export function useInspectorNavigation(planId: string | null) {
  const openInspector = usePlanInspectorStore((state) => state.openInspector);

  const { data: allPlans = [] } = usePlans();

  const currentIndex = useMemo(() => {
    return allPlans.findIndex((t) => t.id === planId);
  }, [allPlans, planId]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allPlans.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevPlanId = allPlans[currentIndex - 1]!.id;
      openInspector(prevPlanId);
    }
  }, [hasPrevious, allPlans, currentIndex, openInspector]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextPlanId = allPlans[currentIndex + 1]!.id;
      openInspector(nextPlanId);
    }
  }, [hasNext, allPlans, currentIndex, openInspector]);

  return {
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  };
}
