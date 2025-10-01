import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventCreation } from './useEventCreation'

describe('useEventCreation', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventCreation())

    expect(result.current.state.isCreating).toBe(false)
    expect(result.current.state.creatingEvent).toBeNull()
  })

  it('should start creating event with default duration', () => {
    const { result } = renderHook(() => useEventCreation())
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00')
    })

    expect(result.current.state.isCreating).toBe(true)
    expect(result.current.state.creatingEvent).toEqual({
      date: testDate,
      startTime: '09:00',
      endTime: '09:30', // デフォルト30分後
      isVisible: true,
    })
  })

  it('should start creating event with custom end time', () => {
    const { result } = renderHook(() => useEventCreation())
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00', '10:00')
    })

    expect(result.current.state.creatingEvent?.endTime).toBe('10:00')
  })

  it('should update creating event', () => {
    const { result } = renderHook(() => useEventCreation())
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00')
    })

    act(() => {
      result.current.actions.updateCreatingEvent({ endTime: '11:00' })
    })

    expect(result.current.state.creatingEvent?.endTime).toBe('11:00')
  })

  it('should confirm create and call callback', () => {
    const onConfirmCreate = vi.fn()
    const { result } = renderHook(() => useEventCreation({ onConfirmCreate }))
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00')
    })

    act(() => {
      result.current.actions.confirmCreate()
    })

    expect(onConfirmCreate).toHaveBeenCalledWith({
      date: testDate,
      startTime: '09:00',
      endTime: '09:30',
      isVisible: true,
    })
    expect(result.current.state.isCreating).toBe(false)
    expect(result.current.state.creatingEvent).toBeNull()
  })

  it('should cancel creating', () => {
    const { result } = renderHook(() => useEventCreation())
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00')
    })

    act(() => {
      result.current.actions.cancelCreating()
    })

    expect(result.current.state.isCreating).toBe(false)
    expect(result.current.state.creatingEvent).toBeNull()
  })

  it('should use custom default duration', () => {
    const { result } = renderHook(() =>
      useEventCreation({ defaultDurationMinutes: 60 })
    )
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '09:00')
    })

    expect(result.current.state.creatingEvent?.endTime).toBe('10:00') // 60分後
  })

  it('should handle time overflow past midnight', () => {
    const { result } = renderHook(() => useEventCreation())
    const testDate = new Date('2025-10-01')

    act(() => {
      result.current.actions.startCreating(testDate, '23:45')
    })

    expect(result.current.state.creatingEvent?.endTime).toBe('00:15') // 翌日0:15
  })
})
