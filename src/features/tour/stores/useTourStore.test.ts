import { beforeEach, describe, expect, it } from 'vitest';

import { TOUR_STEPS } from '../constants';

import { useTourStore } from './useTourStore';

describe('useTourStore', () => {
  beforeEach(() => {
    useTourStore.setState({
      completed: false,
      isActive: false,
      currentStepIndex: 0,
    });
  });

  describe('初期状態', () => {
    it('ツアーは非アクティブ・未完了', () => {
      const state = useTourStore.getState();
      expect(state.isActive).toBe(false);
      expect(state.completed).toBe(false);
      expect(state.currentStepIndex).toBe(0);
    });
  });

  describe('startTour', () => {
    it('ツアーを開始する', () => {
      useTourStore.getState().startTour();
      const state = useTourStore.getState();
      expect(state.isActive).toBe(true);
      expect(state.currentStepIndex).toBe(0);
    });

    it('完了済みの場合は開始しない', () => {
      useTourStore.setState({ completed: true });
      useTourStore.getState().startTour();
      expect(useTourStore.getState().isActive).toBe(false);
    });
  });

  describe('nextStep', () => {
    it('次のステップに進む', () => {
      useTourStore.getState().startTour();
      useTourStore.getState().nextStep();
      expect(useTourStore.getState().currentStepIndex).toBe(1);
    });

    it('最後のステップの次へ進む（done カード表示用、isActive 維持）', () => {
      useTourStore.setState({
        isActive: true,
        currentStepIndex: TOUR_STEPS.length - 1,
      });
      useTourStore.getState().nextStep();
      const state = useTourStore.getState();
      // isActive は維持（done カードを表示するため）
      expect(state.isActive).toBe(true);
      expect(state.completed).toBe(false);
      // index が範囲外 → TOUR_STEPS[index] は undefined → done カード分岐
      expect(state.currentStepIndex).toBe(TOUR_STEPS.length);
    });
  });

  describe('skipTour', () => {
    it('ツアーをスキップして完了にする', () => {
      useTourStore.getState().startTour();
      useTourStore.getState().skipTour();
      const state = useTourStore.getState();
      expect(state.isActive).toBe(false);
      expect(state.completed).toBe(true);
    });
  });

  describe('completeTour', () => {
    it('ツアーを完了にする', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 2 });
      useTourStore.getState().completeTour();
      const state = useTourStore.getState();
      expect(state.isActive).toBe(false);
      expect(state.completed).toBe(true);
      expect(state.currentStepIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('全状態をリセットする', () => {
      useTourStore.setState({ completed: true, isActive: false });
      useTourStore.getState().reset();
      const state = useTourStore.getState();
      expect(state.completed).toBe(false);
      expect(state.isActive).toBe(false);
      expect(state.currentStepIndex).toBe(0);
    });
  });

  describe('createSelectors', () => {
    it('セレクタで個別の値を取得できる', () => {
      useTourStore.getState().startTour();
      expect(useTourStore.use).toBeDefined();
    });
  });
});
