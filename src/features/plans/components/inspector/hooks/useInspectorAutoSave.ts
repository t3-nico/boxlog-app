'use client'

import { useCallback, useEffect, useRef } from 'react'

import { usePlanMutations } from '../../../hooks/usePlanMutations'
import type { Plan } from '../../../types/plan'

interface UseInspectorAutoSaveOptions {
  planId: string | null
  plan: Plan | null
  debounceMs?: number
}

export function useInspectorAutoSave({ planId, plan, debounceMs = 500 }: UseInspectorAutoSaveOptions) {
  const { updatePlan, deletePlan } = usePlanMutations()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const autoSave = useCallback(
    (field: string, value: string | undefined) => {
      if (!planId || !plan) return

      const currentValue = plan[field as keyof typeof plan]
      if (currentValue === value) return

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        const updateData: Record<string, string | undefined> = {}

        if (field === 'status' && value) {
          updateData.status = value as 'open' | 'in_progress' | 'completed' | 'cancelled'
        } else {
          updateData[field] = value
        }

        updatePlan.mutate({
          id: planId,
          data: updateData,
        })
      }, debounceMs)
    },
    [planId, plan, updatePlan, debounceMs]
  )

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    autoSave,
    updatePlan,
    deletePlan,
  }
}
