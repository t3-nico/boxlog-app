'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { EntryWithTags } from '@/types/entry';
import { useEntryMutations } from '../../../hooks/useEntryMutations';

interface UseInspectorAutoSaveOptions {
  planId: string | null;
  plan: EntryWithTags | null;
  debounceMs?: number;
}

export function useInspectorAutoSave({
  planId,
  plan,
  debounceMs = 500,
}: UseInspectorAutoSaveOptions) {
  const { updateEntry: updatePlan, deleteEntry: deletePlan } = useEntryMutations();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(
    (field: string, value: string | undefined) => {
      if (!planId || !plan) return;

      const currentValue = plan[field as keyof typeof plan];
      if (currentValue === value) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const updateData: Record<string, string | undefined> = {};
        updateData[field] = value;

        updatePlan.mutate({
          id: planId,
          data: updateData,
        });
      }, debounceMs);
    },
    [planId, plan, updatePlan, debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    updatePlan,
    deletePlan,
  };
}
