/**
 * マイグレーション計画
 */

import type { AffectedGroup, BreakingChange, MigrationPlan } from '../types'

import { calculateEndDate, generatePlanId, getDefaultStartDate } from './helpers'

/**
 * 📋 マイグレーションフェーズ作成
 */
export function createMigrationPhases(changes: BreakingChange[]) {
  return changes.map((change, index) => ({
    phase: index + 1,
    name: `Phase ${index + 1}: ${change.title}`,
    description: change.description,
    changes: [change.id],
    startDate: getDefaultStartDate(),
    endDate: calculateEndDate([change]),
    successCriteria: [`${change.title}のマイグレーション完了`],
  }))
}

/**
 * 📋 マイグレーション計画生成
 */
export function createMigrationPlan(
  changes: BreakingChange[],
  version: string,
  options: {
    targetGroups?: AffectedGroup[]
    timeConstraints?: {
      startDate?: string
      endDate?: string
    }
  } = {}
): MigrationPlan {
  const relevantChanges = changes.filter(
    (change) =>
      change.version === version &&
      (!options.targetGroups || change.affectedGroups.some((group) => options.targetGroups!.includes(group)))
  )

  const planId = generatePlanId(version)

  const checklist = relevantChanges.flatMap((change) =>
    change.migration.steps.map((step) => ({
      item: `${change.title}: ${step.title}`,
      completed: false,
    }))
  )

  return {
    id: planId,
    changes: relevantChanges,
    schedule: {
      startDate: options.timeConstraints?.startDate || getDefaultStartDate(),
      endDate: options.timeConstraints?.endDate || calculateEndDate(relevantChanges),
      phases: createMigrationPhases(relevantChanges),
    },
    assignees: [],
    status: 'planned',
    progress: 0,
    checklist,
  }
}
