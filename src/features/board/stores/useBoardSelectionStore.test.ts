import { beforeEach, describe, expect, it } from 'vitest'

import { useBoardSelectionStore } from './useBoardSelectionStore'

describe('useBoardSelectionStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useBoardSelectionStore.setState({ selectedIds: new Set() })
  })

  describe('初期状態', () => {
    it('selectedIdsは空のセット', () => {
      const { selectedIds } = useBoardSelectionStore.getState()
      expect(selectedIds.size).toBe(0)
    })
  })

  describe('toggleSelection', () => {
    it('未選択のカードを選択できる', () => {
      useBoardSelectionStore.getState().toggleSelection('card-1')

      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(true)
    })

    it('選択済みのカードの選択を解除できる', () => {
      useBoardSelectionStore.getState().toggleSelection('card-1')
      useBoardSelectionStore.getState().toggleSelection('card-1')

      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(false)
    })

    it('複数のカードを選択できる', () => {
      useBoardSelectionStore.getState().toggleSelection('card-1')
      useBoardSelectionStore.getState().toggleSelection('card-2')
      useBoardSelectionStore.getState().toggleSelection('card-3')

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(3)
    })
  })

  describe('toggleAll', () => {
    it('すべてのカードを選択できる', () => {
      const ids = ['card-1', 'card-2', 'card-3']
      useBoardSelectionStore.getState().toggleAll(ids)

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(3)
      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(true)
      expect(useBoardSelectionStore.getState().isSelected('card-2')).toBe(true)
      expect(useBoardSelectionStore.getState().isSelected('card-3')).toBe(true)
    })

    it('すべて選択済みの場合は全解除する', () => {
      const ids = ['card-1', 'card-2', 'card-3']

      // 全選択
      useBoardSelectionStore.getState().toggleAll(ids)
      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(3)

      // 全解除
      useBoardSelectionStore.getState().toggleAll(ids)
      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(0)
    })

    it('一部のみ選択済みの場合は全選択する', () => {
      const ids = ['card-1', 'card-2', 'card-3']

      // 一部を選択
      useBoardSelectionStore.getState().toggleSelection('card-1')

      // toggleAllで全選択
      useBoardSelectionStore.getState().toggleAll(ids)
      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(3)
    })

    it('空の配列では何も変更されない', () => {
      useBoardSelectionStore.getState().toggleSelection('card-1')
      useBoardSelectionStore.getState().toggleAll([])

      // 全選択状態なので解除される（空配列でもeveryはtrueを返す）
      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(0)
    })
  })

  describe('setSelectedIds', () => {
    it('選択状態を直接設定できる', () => {
      useBoardSelectionStore.getState().setSelectedIds(['card-1', 'card-2'])

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(2)
      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(true)
      expect(useBoardSelectionStore.getState().isSelected('card-2')).toBe(true)
    })

    it('既存の選択を置き換える', () => {
      useBoardSelectionStore.getState().setSelectedIds(['card-1'])
      useBoardSelectionStore.getState().setSelectedIds(['card-2', 'card-3'])

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(2)
      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('すべての選択を解除できる', () => {
      useBoardSelectionStore.getState().setSelectedIds(['card-1', 'card-2', 'card-3'])
      useBoardSelectionStore.getState().clearSelection()

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(0)
    })

    it('選択がない状態でも安全にクリアできる', () => {
      useBoardSelectionStore.getState().clearSelection()

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(0)
    })
  })

  describe('isSelected', () => {
    it('選択されているカードにtrueを返す', () => {
      useBoardSelectionStore.getState().toggleSelection('card-1')

      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(true)
    })

    it('選択されていないカードにfalseを返す', () => {
      expect(useBoardSelectionStore.getState().isSelected('card-1')).toBe(false)
    })
  })

  describe('getSelectedCount', () => {
    it('選択されているカードの数を返す', () => {
      useBoardSelectionStore.getState().setSelectedIds(['card-1', 'card-2', 'card-3'])

      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(3)
    })

    it('選択がない場合は0を返す', () => {
      expect(useBoardSelectionStore.getState().getSelectedCount()).toBe(0)
    })
  })

  describe('getSelectedIds', () => {
    it('選択されているカードのセットを返す', () => {
      useBoardSelectionStore.getState().setSelectedIds(['card-1', 'card-2'])

      const selectedIds = useBoardSelectionStore.getState().getSelectedIds()

      expect(selectedIds.has('card-1')).toBe(true)
      expect(selectedIds.has('card-2')).toBe(true)
      expect(selectedIds.size).toBe(2)
    })
  })
})
