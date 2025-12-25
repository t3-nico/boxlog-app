/**
 * イベント選択機能を管理するフック
 */

'use client';

import { useCallback, useState } from 'react';

export interface EventSelectionState {
  selectedEventId: string | null;
  hoveredEventId: string | null;
}

export interface UseEventSelectionOptions {
  onSelectionChange?: (eventId: string | null) => void;
}

const defaultState: EventSelectionState = {
  selectedEventId: null,
  hoveredEventId: null,
};

export function useEventSelection(options: UseEventSelectionOptions = {}) {
  const { onSelectionChange } = options;
  const [state, setState] = useState<EventSelectionState>(defaultState);

  const selectEvent = useCallback(
    (eventId: string | null) => {
      setState((prev) => ({ ...prev, selectedEventId: eventId }));
      onSelectionChange?.(eventId);
    },
    [onSelectionChange],
  );

  const setHoveredEvent = useCallback((eventId: string | null) => {
    setState((prev) => ({ ...prev, hoveredEventId: eventId }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(defaultState);
    onSelectionChange?.(null);
  }, [onSelectionChange]);

  return {
    state,
    actions: {
      selectEvent,
      setHoveredEvent,
      clearSelection,
    },
  };
}
