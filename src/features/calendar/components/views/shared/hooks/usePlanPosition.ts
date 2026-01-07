/**
 * プラン配置計算フック
 */

import { useMemo } from 'react';

import { HOUR_HEIGHT } from '../constants/grid.constants';
import type { PlanCardPosition, TimedPlan } from '../types/plan.types';
import { calculatePlanPosition, calculateViewPlanColumns } from '../utils/planPositioning';

export interface UsePlanPositionOptions {
  hourHeight?: number;
}

export interface PositionedPlan extends TimedPlan {
  position: PlanCardPosition;
}

export function usePlanPosition(plans: TimedPlan[], options: UsePlanPositionOptions = {}) {
  const { hourHeight = HOUR_HEIGHT } = options;

  const planPositions = useMemo(() => {
    const positions = new Map<string, PlanCardPosition>();

    if (plans.length === 0) return positions;

    // プランの列配置を計算
    const columns = calculateViewPlanColumns(plans);

    // 各プランの位置を計算
    plans.forEach((plan) => {
      const column = columns.get(plan.id);
      if (!column) return;

      const position = calculatePlanPosition(plan, column, hourHeight);

      positions.set(plan.id, {
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        zIndex: 10,
      });
    });

    return positions;
  }, [plans, hourHeight]);

  return planPositions;
}

/**
 * プランと位置を結合して配置済みプランを返すフック
 */
export function usePositionedPlans(
  plans: TimedPlan[],
  options: UsePlanPositionOptions = {},
): PositionedPlan[] {
  const positions = usePlanPosition(plans, options);

  return useMemo(() => {
    return plans.map((plan) => ({
      ...plan,
      position: positions.get(plan.id) || {
        top: 0,
        left: 0,
        width: 100,
        height: 20,
        zIndex: 10,
      },
    }));
  }, [plans, positions]);
}
