import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCalendarColors, useCalendarSelection } from './use-calendars'

describe('useCalendarSelection', () => {
  it('should initialize with provided calendar IDs', () => {
    const { result } = renderHook(() => useCalendarSelection(['cal-1', 'cal-2']))

    expect(result.current.selectedCalendarIds).toEqual(['cal-1', 'cal-2'])
  })

  it('should toggle calendar selection', () => {
    const { result } = renderHook(() => useCalendarSelection([]))

    act(() => {
      result.current.toggleCalendar('cal-1')
    })

    expect(result.current.selectedCalendarIds).toEqual(['cal-1'])

    act(() => {
      result.current.toggleCalendar('cal-1')
    })

    expect(result.current.selectedCalendarIds).toEqual([])
  })

  it('should select all calendars', () => {
    const { result } = renderHook(() => useCalendarSelection([]))

    act(() => {
      result.current.selectAll(['cal-1', 'cal-2', 'cal-3'])
    })

    expect(result.current.selectedCalendarIds).toEqual(['cal-1', 'cal-2', 'cal-3'])
  })

  it('should deselect all calendars', () => {
    const { result } = renderHook(() => useCalendarSelection(['cal-1', 'cal-2']))

    act(() => {
      result.current.deselectAll()
    })

    expect(result.current.selectedCalendarIds).toEqual([])
  })

  it('should check if calendar is selected', () => {
    const { result } = renderHook(() => useCalendarSelection(['cal-1', 'cal-2']))

    expect(result.current.isSelected('cal-1')).toBe(true)
    expect(result.current.isSelected('cal-3')).toBe(false)
  })

  it('should set selected calendar IDs directly', () => {
    const { result } = renderHook(() => useCalendarSelection([]))

    act(() => {
      result.current.setSelectedCalendarIds(['cal-4', 'cal-5'])
    })

    expect(result.current.selectedCalendarIds).toEqual(['cal-4', 'cal-5'])
  })
})

describe('useCalendarColors', () => {
  it('should initialize with default colors', () => {
    const { result } = renderHook(() => useCalendarColors())

    expect(result.current.defaultColors).toHaveLength(10)
    expect(result.current.customColors).toEqual([])
    expect(result.current.allColors).toHaveLength(10)
  })

  it('should add custom color', () => {
    const { result } = renderHook(() => useCalendarColors())

    act(() => {
      result.current.addCustomColor('#ff0000')
    })

    expect(result.current.customColors).toContain('#ff0000')
    expect(result.current.allColors).toHaveLength(11)
  })

  it('should not add duplicate custom color', () => {
    const { result } = renderHook(() => useCalendarColors())

    act(() => {
      result.current.addCustomColor('#ff0000')
    })

    act(() => {
      result.current.addCustomColor('#ff0000')
    })

    expect(result.current.customColors).toEqual(['#ff0000'])
  })

  it('should remove custom color', () => {
    const { result } = renderHook(() => useCalendarColors())

    act(() => {
      result.current.addCustomColor('#ff0000')
      result.current.addCustomColor('#00ff00')
    })

    act(() => {
      result.current.removeCustomColor('#ff0000')
    })

    expect(result.current.customColors).toEqual(['#00ff00'])
    expect(result.current.customColors).not.toContain('#ff0000')
  })

  it('should maintain default colors when managing custom colors', () => {
    const { result } = renderHook(() => useCalendarColors())
    const initialDefaultCount = result.current.defaultColors.length

    act(() => {
      result.current.addCustomColor('#ff0000')
    })

    expect(result.current.defaultColors).toHaveLength(initialDefaultCount)
  })
})
