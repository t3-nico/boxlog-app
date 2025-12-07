import { beforeEach, describe, expect, it } from 'vitest'

import { useBoardStatusFilterStore } from './useBoardStatusFilterStore'

describe('useBoardStatusFilterStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useBoardStatusFilterStore.getState().resetFilters()
  })

  describe('初期状態', () => {
    it('すべてのステータスが表示状態', () => {
      const { isStatusVisible } = useBoardStatusFilterStore.getState()

      expect(isStatusVisible('todo')).toBe(true)
      expect(isStatusVisible('doing')).toBe(true)
      expect(isStatusVisible('done')).toBe(true)
    })
  })

  describe('toggleStatus', () => {
    it('表示中のステータスを非表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('done')

      expect(useBoardStatusFilterStore.getState().isStatusVisible('done')).toBe(false)
    })

    it('非表示のステータスを表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('done')
      useBoardStatusFilterStore.getState().toggleStatus('done')

      expect(useBoardStatusFilterStore.getState().isStatusVisible('done')).toBe(true)
    })

    it('他のステータスに影響しない', () => {
      useBoardStatusFilterStore.getState().toggleStatus('done')

      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('doing')).toBe(true)
    })

    it('複数のステータスを非表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('todo')
      useBoardStatusFilterStore.getState().toggleStatus('done')

      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(false)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('doing')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('done')).toBe(false)
    })
  })

  describe('isStatusVisible', () => {
    it('表示中のステータスにtrueを返す', () => {
      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(true)
    })

    it('非表示のステータスにfalseを返す', () => {
      useBoardStatusFilterStore.getState().toggleStatus('todo')

      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(false)
    })
  })

  describe('resetFilters', () => {
    it('すべてのステータスを表示状態にリセットする', () => {
      // いくつかのステータスを非表示に
      useBoardStatusFilterStore.getState().toggleStatus('todo')
      useBoardStatusFilterStore.getState().toggleStatus('done')

      // リセット
      useBoardStatusFilterStore.getState().resetFilters()

      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('doing')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('done')).toBe(true)
    })

    it('既にデフォルト状態でも安全にリセットできる', () => {
      useBoardStatusFilterStore.getState().resetFilters()

      expect(useBoardStatusFilterStore.getState().isStatusVisible('todo')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('doing')).toBe(true)
      expect(useBoardStatusFilterStore.getState().isStatusVisible('done')).toBe(true)
    })
  })

  describe('visibleStatuses', () => {
    it('表示中のステータスのセットを取得できる', () => {
      const { visibleStatuses } = useBoardStatusFilterStore.getState()

      expect(visibleStatuses.has('todo')).toBe(true)
      expect(visibleStatuses.has('doing')).toBe(true)
      expect(visibleStatuses.has('done')).toBe(true)
    })

    it('toggleで変更後のセットを取得できる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('done')

      const { visibleStatuses } = useBoardStatusFilterStore.getState()

      expect(visibleStatuses.has('todo')).toBe(true)
      expect(visibleStatuses.has('doing')).toBe(true)
      expect(visibleStatuses.has('done')).toBe(false)
    })
  })
})
