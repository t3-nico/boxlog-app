/**
 * プラン作成機能を管理するフック
 */

'use client';

import { useCallback, useState } from 'react';

export interface CreatingPlan {
  date: Date;
  startTime: string;
  endTime: string;
  isVisible: boolean;
}

export interface PlanCreationState {
  isCreating: boolean;
  creatingPlan: CreatingPlan | null;
}

export interface UsePlanCreationOptions {
  onConfirmCreate?: (plan: CreatingPlan) => void;
  defaultDurationMinutes?: number;
}

const defaultState: PlanCreationState = {
  isCreating: false,
  creatingPlan: null,
};

export function usePlanCreation(options: UsePlanCreationOptions = {}) {
  const { onConfirmCreate, defaultDurationMinutes = 30 } = options;
  const [state, setState] = useState<PlanCreationState>(defaultState);

  const startCreating = useCallback(
    (date: Date, startTime: string, endTime?: string) => {
      const finalEndTime = endTime || addMinutesToTime(startTime, defaultDurationMinutes);

      setState({
        isCreating: true,
        creatingPlan: {
          date,
          startTime,
          endTime: finalEndTime,
          isVisible: true,
        },
      });
    },
    [defaultDurationMinutes],
  );

  const updateCreatingPlan = useCallback((updates: Partial<CreatingPlan>) => {
    setState((prev) => {
      if (!prev.creatingPlan) return prev;

      return {
        ...prev,
        creatingPlan: {
          ...prev.creatingPlan,
          ...updates,
        },
      };
    });
  }, []);

  const confirmCreate = useCallback(() => {
    setState((prev) => {
      if (prev.creatingPlan) {
        onConfirmCreate?.(prev.creatingPlan);
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
      updateCreatingPlan,
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
