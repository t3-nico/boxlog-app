/**
 * プラン選択機能を管理するフック
 */

'use client';

import { useCallback, useState } from 'react';

export interface PlanSelectionState {
  selectedPlanId: string | null;
  hoveredPlanId: string | null;
}

export interface UsePlanSelectionOptions {
  onSelectionChange?: (planId: string | null) => void;
}

const defaultState: PlanSelectionState = {
  selectedPlanId: null,
  hoveredPlanId: null,
};

export function usePlanSelection(options: UsePlanSelectionOptions = {}) {
  const { onSelectionChange } = options;
  const [state, setState] = useState<PlanSelectionState>(defaultState);

  const selectPlan = useCallback(
    (planId: string | null) => {
      setState((prev) => ({ ...prev, selectedPlanId: planId }));
      onSelectionChange?.(planId);
    },
    [onSelectionChange],
  );

  const setHoveredPlan = useCallback((planId: string | null) => {
    setState((prev) => ({ ...prev, hoveredPlanId: planId }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(defaultState);
    onSelectionChange?.(null);
  }, [onSelectionChange]);

  return {
    state,
    actions: {
      selectPlan,
      setHoveredPlan,
      clearSelection,
    },
  };
}
