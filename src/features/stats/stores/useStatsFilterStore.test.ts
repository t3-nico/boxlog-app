import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useStatsFilterStore } from './useStatsFilterStore';

describe('useStatsFilterStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));
    useStatsFilterStore.setState({
      granularity: 'week',
      currentDate: new Date(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('granularityがweek', () => {
      expect(useStatsFilterStore.getState().granularity).toBe('week');
    });
  });

  describe('setGranularity', () => {
    it('dayに切り替えできる', () => {
      useStatsFilterStore.getState().setGranularity('day');
      expect(useStatsFilterStore.getState().granularity).toBe('day');
    });

    it('monthに切り替えできる', () => {
      useStatsFilterStore.getState().setGranularity('month');
      expect(useStatsFilterStore.getState().granularity).toBe('month');
    });

    it('yearに切り替えできる', () => {
      useStatsFilterStore.getState().setGranularity('year');
      expect(useStatsFilterStore.getState().granularity).toBe('year');
    });
  });

  describe('navigate', () => {
    it('day粒度で次の日に移動', () => {
      useStatsFilterStore.getState().setGranularity('day');
      useStatsFilterStore.getState().navigate('next');
      expect(useStatsFilterStore.getState().currentDate.getDate()).toBe(11);
    });

    it('day粒度で前の日に移動', () => {
      useStatsFilterStore.getState().setGranularity('day');
      useStatsFilterStore.getState().navigate('prev');
      expect(useStatsFilterStore.getState().currentDate.getDate()).toBe(9);
    });

    it('week粒度で次の週に移動', () => {
      useStatsFilterStore.getState().setGranularity('week');
      useStatsFilterStore.getState().navigate('next');
      expect(useStatsFilterStore.getState().currentDate.getDate()).toBe(17);
    });

    it('month粒度で次の月に移動', () => {
      useStatsFilterStore.getState().setGranularity('month');
      useStatsFilterStore.getState().navigate('next');
      expect(useStatsFilterStore.getState().currentDate.getMonth()).toBe(3); // April
    });

    it('year粒度で次の年に移動', () => {
      useStatsFilterStore.getState().setGranularity('year');
      useStatsFilterStore.getState().navigate('next');
      expect(useStatsFilterStore.getState().currentDate.getFullYear()).toBe(2027);
    });

    it('todayで今日に戻る', () => {
      useStatsFilterStore.getState().setGranularity('week');
      useStatsFilterStore.getState().navigate('next');
      useStatsFilterStore.getState().navigate('next');
      useStatsFilterStore.getState().navigate('today');
      const date = useStatsFilterStore.getState().currentDate;
      expect(date.getDate()).toBe(10);
      expect(date.getMonth()).toBe(2); // March
    });
  });

  describe('状態の独立性', () => {
    it('navigateがgranularityに影響しない', () => {
      useStatsFilterStore.getState().setGranularity('month');
      useStatsFilterStore.getState().navigate('next');
      expect(useStatsFilterStore.getState().granularity).toBe('month');
    });
  });
});
