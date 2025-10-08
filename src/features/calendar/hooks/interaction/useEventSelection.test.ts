import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEventSelection } from './useEventSelection'

describe('useEventSelection', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventSelection())

    expect(result.current.state.selectedEventId).toBeNull()
    expect(result.current.state.hoveredEventId).toBeNull()
  })

  it('should select event', () => {
    const { result } = renderHook(() => useEventSelection())

    act(() => {
      result.current.actions.selectEvent('event-123')
    })

    expect(result.current.state.selectedEventId).toBe('event-123')
  })

  it('should call onSelectionChange when selecting event', () => {
    const onSelectionChange = vi.fn()
    const { result } = renderHook(() => useEventSelection({ onSelectionChange }))

    act(() => {
      result.current.actions.selectEvent('event-123')
    })

    expect(onSelectionChange).toHaveBeenCalledWith('event-123')
  })

  it('should set hovered event', () => {
    const { result } = renderHook(() => useEventSelection())

    act(() => {
      result.current.actions.setHoveredEvent('event-456')
    })

    expect(result.current.state.hoveredEventId).toBe('event-456')
  })

  it('should clear selection', () => {
    const onSelectionChange = vi.fn()
    const { result } = renderHook(() => useEventSelection({ onSelectionChange }))

    act(() => {
      result.current.actions.selectEvent('event-123')
      result.current.actions.setHoveredEvent('event-456')
    })

    act(() => {
      result.current.actions.clearSelection()
    })

    expect(result.current.state.selectedEventId).toBeNull()
    expect(result.current.state.hoveredEventId).toBeNull()
    expect(onSelectionChange).toHaveBeenCalledWith(null)
  })

  it('should allow deselecting by passing null', () => {
    const { result } = renderHook(() => useEventSelection())

    act(() => {
      result.current.actions.selectEvent('event-123')
    })

    act(() => {
      result.current.actions.selectEvent(null)
    })

    expect(result.current.state.selectedEventId).toBeNull()
  })

  it('should maintain hovered state when selecting', () => {
    const { result } = renderHook(() => useEventSelection())

    act(() => {
      result.current.actions.setHoveredEvent('event-hover')
      result.current.actions.selectEvent('event-selected')
    })

    expect(result.current.state.selectedEventId).toBe('event-selected')
    expect(result.current.state.hoveredEventId).toBe('event-hover')
  })
})
