import { beforeEach, describe, expect, it } from 'vitest'
import { useInboxTableFilterStore } from './useInboxTableFilterStore'

describe('useInboxTableFilterStore', () => {
  beforeEach(() => {
    useInboxTableFilterStore.getState().reset()
  })

  describe('初期状態', () => {
    it('空の配列と空文字列で初期化される', () => {
      const state = useInboxTableFilterStore.getState()

      expect(state.status).toEqual([])
      expect(state.priority).toEqual([])
      expect(state.tags).toEqual([])
      expect(state.search).toBe('')
    })
  })

  describe('setStatus', () => {
    it('ステータスフィルタを設定できる', () => {
      useInboxTableFilterStore.getState().setStatus(['in_progress', 'completed'])

      const { status } = useInboxTableFilterStore.getState()
      expect(status).toEqual(['in_progress', 'completed'])
    })

    it('空配列で設定できる', () => {
      useInboxTableFilterStore.getState().setStatus(['in_progress'])
      useInboxTableFilterStore.getState().setStatus([])

      const { status } = useInboxTableFilterStore.getState()
      expect(status).toEqual([])
    })
  })

  describe('setPriority', () => {
    it('優先度フィルタを設定できる', () => {
      useInboxTableFilterStore.getState().setPriority(['high', 'urgent'])

      const { priority } = useInboxTableFilterStore.getState()
      expect(priority).toEqual(['high', 'urgent'])
    })

    it('空配列で設定できる', () => {
      useInboxTableFilterStore.getState().setPriority(['high'])
      useInboxTableFilterStore.getState().setPriority([])

      const { priority } = useInboxTableFilterStore.getState()
      expect(priority).toEqual([])
    })
  })

  describe('setTags', () => {
    it('タグフィルタを設定できる', () => {
      useInboxTableFilterStore.getState().setTags(['tag1', 'tag2'])

      const { tags } = useInboxTableFilterStore.getState()
      expect(tags).toEqual(['tag1', 'tag2'])
    })

    it('空配列で設定できる', () => {
      useInboxTableFilterStore.getState().setTags(['tag1'])
      useInboxTableFilterStore.getState().setTags([])

      const { tags } = useInboxTableFilterStore.getState()
      expect(tags).toEqual([])
    })
  })

  describe('setSearch', () => {
    it('検索文字列を設定できる', () => {
      useInboxTableFilterStore.getState().setSearch('test query')

      const { search } = useInboxTableFilterStore.getState()
      expect(search).toBe('test query')
    })

    it('空文字列で設定できる', () => {
      useInboxTableFilterStore.getState().setSearch('test')
      useInboxTableFilterStore.getState().setSearch('')

      const { search } = useInboxTableFilterStore.getState()
      expect(search).toBe('')
    })
  })

  describe('reset', () => {
    it('すべてのフィルタをリセットできる', () => {
      const store = useInboxTableFilterStore.getState()

      store.setStatus(['in_progress'])
      store.setPriority(['high'])
      store.setTags(['tag1'])
      store.setSearch('test')

      store.reset()

      const state = useInboxTableFilterStore.getState()
      expect(state.status).toEqual([])
      expect(state.priority).toEqual([])
      expect(state.tags).toEqual([])
      expect(state.search).toBe('')
    })
  })

  describe('複数フィルタの組み合わせ', () => {
    it('複数のフィルタを同時に設定できる', () => {
      const store = useInboxTableFilterStore.getState()

      store.setStatus(['in_progress', 'completed'])
      store.setPriority(['high'])
      store.setTags(['work'])
      store.setSearch('important')

      const state = useInboxTableFilterStore.getState()
      expect(state.status).toEqual(['in_progress', 'completed'])
      expect(state.priority).toEqual(['high'])
      expect(state.tags).toEqual(['work'])
      expect(state.search).toBe('important')
    })
  })

  describe('BoardフィルタとTableフィルタの独立性', () => {
    it('BoardフィルタとTableフィルタは独立して動作する', () => {
      const tableStore = useInboxTableFilterStore.getState()

      tableStore.setStatus(['in_progress'])
      tableStore.setPriority(['high'])

      const tableState = useInboxTableFilterStore.getState()
      expect(tableState.status).toEqual(['in_progress'])
      expect(tableState.priority).toEqual(['high'])
    })
  })
})
