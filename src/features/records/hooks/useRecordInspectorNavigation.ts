'use client';

import { useCallback, useMemo } from 'react';

import { useRecordInspectorStore } from '../stores';

import { useRecordData } from '@/hooks/useRecordData';

/**
 * Record Inspector のナビゲーション
 *
 * Plan Inspector と同様の前後移動機能を提供
 */
export function useRecordInspectorNavigation(recordId: string | null) {
  const openInspector = useRecordInspectorStore((state) => state.openInspector);

  const { items: allRecords = [] } = useRecordData();

  const currentIndex = useMemo(() => {
    return allRecords.findIndex((r) => r.id === recordId);
  }, [allRecords, recordId]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allRecords.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevRecordId = allRecords[currentIndex - 1]!.id;
      openInspector(prevRecordId);
    }
  }, [hasPrevious, allRecords, currentIndex, openInspector]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextRecordId = allRecords[currentIndex + 1]!.id;
      openInspector(nextRecordId);
    }
  }, [hasNext, allRecords, currentIndex, openInspector]);

  return {
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  };
}
