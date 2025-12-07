import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useInboxSelectionStore } from './useInboxSelectionStore'

describe('useInboxSelectionStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useInboxSelectionStore.getState().clearSelection()
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('初期状態', () => {
    it('selectedIdsは空のSet', () => {
      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })

    it('getSelectedCountは0を返す', () => {
      const count = useInboxSelectionStore.getState().getSelectedCount()
      expect(count).toBe(0)
    })
  })

  describe('toggleSelection', () => {
    it('未選択のアイテムを選択できる', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.has('item-1')).toBe(true)
    })

    it('選択済みのアイテムを解除できる', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-1')
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.has('item-1')).toBe(false)
    })

    it('複数のアイテムを選択できる', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-2')
        useInboxSelectionStore.getState().toggleSelection('item-3')
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(3)
      expect(selectedIds.has('item-1')).toBe(true)
      expect(selectedIds.has('item-2')).toBe(true)
      expect(selectedIds.has('item-3')).toBe(true)
    })

    it('一部のアイテムだけ解除できる', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-2')
        useInboxSelectionStore.getState().toggleSelection('item-3')
        useInboxSelectionStore.getState().toggleSelection('item-2') // 解除
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(2)
      expect(selectedIds.has('item-1')).toBe(true)
      expect(selectedIds.has('item-2')).toBe(false)
      expect(selectedIds.has('item-3')).toBe(true)
    })
  })

  describe('toggleAll', () => {
    it('何も選択されていない場合は全選択', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleAll(['item-1', 'item-2', 'item-3'])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(3)
    })

    it('全て選択済みの場合は全解除', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleAll(['item-1', 'item-2', 'item-3'])
        useInboxSelectionStore.getState().toggleAll(['item-1', 'item-2', 'item-3'])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })

    it('一部選択の場合は全選択', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleAll(['item-1', 'item-2', 'item-3'])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(3)
    })

    it('空配列でも動作する', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleAll([])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })
  })

  describe('setSelectedIds', () => {
    it('選択状態を直接設定できる', () => {
      act(() => {
        useInboxSelectionStore.getState().setSelectedIds(['item-a', 'item-b'])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(2)
      expect(selectedIds.has('item-a')).toBe(true)
      expect(selectedIds.has('item-b')).toBe(true)
    })

    it('既存の選択を上書きする', () => {
      act(() => {
        useInboxSelectionStore.getState().setSelectedIds(['item-1', 'item-2'])
        useInboxSelectionStore.getState().setSelectedIds(['item-3'])
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(1)
      expect(selectedIds.has('item-1')).toBe(false)
      expect(selectedIds.has('item-3')).toBe(true)
    })
  })

  describe('clearSelection', () => {
    it('全ての選択をクリアできる', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-2')
        useInboxSelectionStore.getState().clearSelection()
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })

    it('既に空でもエラーにならない', () => {
      act(() => {
        useInboxSelectionStore.getState().clearSelection()
      })

      const { selectedIds } = useInboxSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })
  })

  describe('isSelected', () => {
    it('選択されているアイテムでtrueを返す', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
      })

      const isSelected = useInboxSelectionStore.getState().isSelected('item-1')
      expect(isSelected).toBe(true)
    })

    it('選択されていないアイテムでfalseを返す', () => {
      const isSelected = useInboxSelectionStore.getState().isSelected('item-1')
      expect(isSelected).toBe(false)
    })

    it('解除後はfalseを返す', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-1')
      })

      const isSelected = useInboxSelectionStore.getState().isSelected('item-1')
      expect(isSelected).toBe(false)
    })
  })

  describe('getSelectedCount', () => {
    it('選択数を正しく返す', () => {
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(0)

      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(1)

      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-2')
        useInboxSelectionStore.getState().toggleSelection('item-3')
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(3)

      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-2')
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(2)
    })
  })

  describe('getSelectedIds', () => {
    it('選択されたIDのSetを返す', () => {
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-1')
        useInboxSelectionStore.getState().toggleSelection('item-2')
      })

      const ids = useInboxSelectionStore.getState().getSelectedIds()
      expect(ids instanceof Set).toBe(true)
      expect(ids.size).toBe(2)
      expect(ids.has('item-1')).toBe(true)
      expect(ids.has('item-2')).toBe(true)
    })
  })

  describe('一括操作シナリオ', () => {
    it('テーブルでの一括選択→一括削除フロー', () => {
      const allIds = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5']

      // 全選択
      act(() => {
        useInboxSelectionStore.getState().toggleAll(allIds)
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(5)

      // 一部解除
      act(() => {
        useInboxSelectionStore.getState().toggleSelection('item-3')
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(4)

      // 削除処理後にクリア
      act(() => {
        useInboxSelectionStore.getState().clearSelection()
      })
      expect(useInboxSelectionStore.getState().getSelectedCount()).toBe(0)
    })
  })
})
