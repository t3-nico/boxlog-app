import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { useDebounce } from '../use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期値をそのまま返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('指定した遅延時間後に値が更新される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // 値を変更
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // まだ更新されていない

    // 500ms経過
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated') // 更新された
  })

  it('遅延時間前に値が変更された場合、タイマーがリセットされる', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // 値を変更
    rerender({ value: 'first', delay: 500 })

    // 300ms経過
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('initial') // まだ更新されていない

    // 再度値を変更（タイマーリセット）
    rerender({ value: 'second', delay: 500 })

    // さらに300ms経過（合計600ms）
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('initial') // まだ更新されていない

    // 残り200ms経過
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('second') // 最後の値に更新された
  })

  it('数値型の値もデバウンスできる', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 },
      }
    )

    expect(result.current).toBe(0)

    rerender({ value: 42, delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(42)
  })

  it('オブジェクト型の値もデバウンスできる', () => {
    const initialObj = { name: 'John', age: 30 }
    const updatedObj = { name: 'Jane', age: 25 }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 300 },
      }
    )

    expect(result.current).toEqual(initialObj)

    rerender({ value: updatedObj, delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toEqual(updatedObj)
  })

  it('遅延時間を動的に変更できる', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    rerender({ value: 'updated', delay: 1000 }) // 遅延時間を1000msに変更

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('initial') // まだ更新されていない

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated') // 1000ms後に更新された
  })

  it('複数回の連続した値変更をデバウンスする', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'value1', delay: 300 },
      }
    )

    rerender({ value: 'value2', delay: 300 })
    act(() => vi.advanceTimersByTime(100))

    rerender({ value: 'value3', delay: 300 })
    act(() => vi.advanceTimersByTime(100))

    rerender({ value: 'value4', delay: 300 })
    act(() => vi.advanceTimersByTime(100))

    expect(result.current).toBe('value1') // まだ更新されていない

    act(() => vi.advanceTimersByTime(200))

    expect(result.current).toBe('value4') // 最後の値のみ反映
  })

  it('アンマウント時にタイマーがクリアされる', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    rerender({ value: 'updated', delay: 500 })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
