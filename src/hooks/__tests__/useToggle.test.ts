import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useToggle } from '../useToggle'

describe('useToggle', () => {
  it('should initialize with false by default', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.value).toBe(true)
  })

  it('should toggle value from false to true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)
  })

  it('should toggle value from true to false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it('should set value to true with setTrue', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it('should set value to false with setFalse', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.setFalse()
    })

    expect(result.current.value).toBe(false)
  })

  it('should set custom value with setValue', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setValue(true)
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.setValue(false)
    })

    expect(result.current.value).toBe(false)
  })

  it('should toggle multiple times correctly', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.toggle()
    })
    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.value).toBe(false)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.value).toBe(true)
  })
})
