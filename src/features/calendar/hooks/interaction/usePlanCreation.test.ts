import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePlanCreation } from './usePlanCreation';

describe('usePlanCreation', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePlanCreation());

    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.creatingPlan).toBeNull();
  });

  it('should start creating plan with default duration', () => {
    const { result } = renderHook(() => usePlanCreation());
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00');
    });

    expect(result.current.state.isCreating).toBe(true);
    expect(result.current.state.creatingPlan).toEqual({
      date: testDate,
      startTime: '09:00',
      endTime: '09:30', // デフォルト30分後
      isVisible: true,
    });
  });

  it('should start creating plan with custom end time', () => {
    const { result } = renderHook(() => usePlanCreation());
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00', '10:00');
    });

    expect(result.current.state.creatingPlan?.endTime).toBe('10:00');
  });

  it('should update creating plan', () => {
    const { result } = renderHook(() => usePlanCreation());
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00');
    });

    act(() => {
      result.current.actions.updateCreatingPlan({ endTime: '11:00' });
    });

    expect(result.current.state.creatingPlan?.endTime).toBe('11:00');
  });

  it('should confirm create and call callback', () => {
    const onConfirmCreate = vi.fn();
    const { result } = renderHook(() => usePlanCreation({ onConfirmCreate }));
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00');
    });

    act(() => {
      result.current.actions.confirmCreate();
    });

    expect(onConfirmCreate).toHaveBeenCalledWith({
      date: testDate,
      startTime: '09:00',
      endTime: '09:30',
      isVisible: true,
    });
    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.creatingPlan).toBeNull();
  });

  it('should cancel creating', () => {
    const { result } = renderHook(() => usePlanCreation());
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00');
    });

    act(() => {
      result.current.actions.cancelCreating();
    });

    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.creatingPlan).toBeNull();
  });

  it('should use custom default duration', () => {
    const { result } = renderHook(() => usePlanCreation({ defaultDurationMinutes: 60 }));
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '09:00');
    });

    expect(result.current.state.creatingPlan?.endTime).toBe('10:00'); // 60分後
  });

  it('should handle time overflow past midnight', () => {
    const { result } = renderHook(() => usePlanCreation());
    const testDate = new Date('2025-10-01');

    act(() => {
      result.current.actions.startCreating(testDate, '23:45');
    });

    expect(result.current.state.creatingPlan?.endTime).toBe('00:15'); // 翌日0:15
  });
});
