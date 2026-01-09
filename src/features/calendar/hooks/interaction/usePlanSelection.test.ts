import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePlanSelection } from './usePlanSelection';

describe('usePlanSelection', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePlanSelection());

    expect(result.current.state.selectedPlanId).toBeNull();
    expect(result.current.state.hoveredPlanId).toBeNull();
  });

  it('should select plan', () => {
    const { result } = renderHook(() => usePlanSelection());

    act(() => {
      result.current.actions.selectPlan('plan-123');
    });

    expect(result.current.state.selectedPlanId).toBe('plan-123');
  });

  it('should call onSelectionChange when selecting plan', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() => usePlanSelection({ onSelectionChange }));

    act(() => {
      result.current.actions.selectPlan('plan-123');
    });

    expect(onSelectionChange).toHaveBeenCalledWith('plan-123');
  });

  it('should set hovered plan', () => {
    const { result } = renderHook(() => usePlanSelection());

    act(() => {
      result.current.actions.setHoveredPlan('plan-456');
    });

    expect(result.current.state.hoveredPlanId).toBe('plan-456');
  });

  it('should clear selection', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() => usePlanSelection({ onSelectionChange }));

    act(() => {
      result.current.actions.selectPlan('plan-123');
      result.current.actions.setHoveredPlan('plan-456');
    });

    act(() => {
      result.current.actions.clearSelection();
    });

    expect(result.current.state.selectedPlanId).toBeNull();
    expect(result.current.state.hoveredPlanId).toBeNull();
    expect(onSelectionChange).toHaveBeenCalledWith(null);
  });

  it('should allow deselecting by passing null', () => {
    const { result } = renderHook(() => usePlanSelection());

    act(() => {
      result.current.actions.selectPlan('plan-123');
    });

    act(() => {
      result.current.actions.selectPlan(null);
    });

    expect(result.current.state.selectedPlanId).toBeNull();
  });

  it('should maintain hovered state when selecting', () => {
    const { result } = renderHook(() => usePlanSelection());

    act(() => {
      result.current.actions.setHoveredPlan('plan-hover');
      result.current.actions.selectPlan('plan-selected');
    });

    expect(result.current.state.selectedPlanId).toBe('plan-selected');
    expect(result.current.state.hoveredPlanId).toBe('plan-hover');
  });
});
