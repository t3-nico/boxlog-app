/**
 * イベント作成機能を管理するフック
 */

'use client';

import { useCallback, useState } from 'react';

export interface CreatingEvent {
  date: Date;
  startTime: string;
  endTime: string;
  isVisible: boolean;
}

export interface EventCreationState {
  isCreating: boolean;
  creatingEvent: CreatingEvent | null;
}

export interface UseEventCreationOptions {
  onConfirmCreate?: (event: CreatingEvent) => void;
  defaultDurationMinutes?: number;
}

const defaultState: EventCreationState = {
  isCreating: false,
  creatingEvent: null,
};

export function useEventCreation(options: UseEventCreationOptions = {}) {
  const { onConfirmCreate, defaultDurationMinutes = 30 } = options;
  const [state, setState] = useState<EventCreationState>(defaultState);

  const startCreating = useCallback(
    (date: Date, startTime: string, endTime?: string) => {
      const finalEndTime = endTime || addMinutesToTime(startTime, defaultDurationMinutes);

      setState({
        isCreating: true,
        creatingEvent: {
          date,
          startTime,
          endTime: finalEndTime,
          isVisible: true,
        },
      });
    },
    [defaultDurationMinutes],
  );

  const updateCreatingEvent = useCallback((updates: Partial<CreatingEvent>) => {
    setState((prev) => {
      if (!prev.creatingEvent) return prev;

      return {
        ...prev,
        creatingEvent: {
          ...prev.creatingEvent,
          ...updates,
        },
      };
    });
  }, []);

  const confirmCreate = useCallback(() => {
    setState((prev) => {
      if (prev.creatingEvent) {
        onConfirmCreate?.(prev.creatingEvent);
      }
      return defaultState;
    });
  }, [onConfirmCreate]);

  const cancelCreating = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    state,
    actions: {
      startCreating,
      updateCreatingEvent,
      confirmCreate,
      cancelCreating,
    },
  };
}

// ユーティリティ関数
function addMinutesToTime(timeString: string, minutesToAdd: number): string {
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}
