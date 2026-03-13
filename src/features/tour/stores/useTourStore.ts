'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

interface TourState {
  /** ツアー完了済み（persist） */
  completed: boolean;
  /** ツアー表示中（ephemeral） */
  isActive: boolean;
  /** 現在のステップインデックス（ephemeral） */
  currentStepIndex: number;
}

interface TourActions {
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  /** Settings「ツアーをもう一度見る」用 */
  reset: () => void;
}

const useTourStoreBase = create<TourState & TourActions>()(
  devtools(
    persist(
      (set, get) => ({
        completed: false,
        isActive: false,
        currentStepIndex: 0,

        startTour: () => {
          if (get().completed) return;
          set({ isActive: true, currentStepIndex: 0 });
        },

        nextStep: () => {
          const { currentStepIndex } = get();
          set({ currentStepIndex: currentStepIndex + 1 });
        },

        skipTour: () => {
          set({ isActive: false, completed: true, currentStepIndex: 0 });
        },

        completeTour: () => {
          set({ isActive: false, completed: true, currentStepIndex: 0 });
        },

        reset: () => {
          set({ completed: false, isActive: false, currentStepIndex: 0 });
        },
      }),
      {
        name: 'tour-storage',
        partialize: (state) => ({
          completed: state.completed,
        }),
      },
    ),
    { name: 'tour-store' },
  ),
);

export const useTourStore = createSelectors(useTourStoreBase);
