import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  it('should call onNewTask on Ctrl+N', () => {
    const onNewTask = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewTask }))

    const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })
    document.dispatchEvent(event)

    expect(onNewTask).toHaveBeenCalledTimes(1)
  })

  it('should call onSave on Ctrl+S', () => {
    const onSave = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onSave }))

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
    document.dispatchEvent(event)

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('should call onSelectAll on Ctrl+A', () => {
    const onSelectAll = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onSelectAll }))

    const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })
    document.dispatchEvent(event)

    expect(onSelectAll).toHaveBeenCalledTimes(1)
  })

  it('should call onDeleteSelected on Delete key', () => {
    const onDeleteSelected = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onDeleteSelected }))

    const event = new KeyboardEvent('keydown', { key: 'Delete' })
    document.dispatchEvent(event)

    expect(onDeleteSelected).toHaveBeenCalledTimes(1)
  })

  it('should call onClearSelection on Escape key', () => {
    const onClearSelection = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onClearSelection }))

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    expect(onClearSelection).toHaveBeenCalledTimes(1)
  })

  it('should not trigger shortcuts when typing in input field', () => {
    const onNewTask = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewTask }))

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })

    input.dispatchEvent(event)

    expect(onNewTask).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should allow Ctrl+S in input fields', () => {
    const onSave = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onSave }))

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })

    input.dispatchEvent(event)

    expect(onSave).toHaveBeenCalledTimes(1)

    document.body.removeChild(input)
  })
})
