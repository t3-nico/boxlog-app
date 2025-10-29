import { beforeEach, describe, expect, it } from 'vitest'
import { useInboxBoardFilterStore } from './useInboxBoardFilterStore'

describe('useInboxBoardFilterStore', () => {
  beforeEach(() => {
    useInboxBoardFilterStore.getState().reset()
  })

  describe('初期状態', () => {
    it('空の配列と空文字列で初期化される', () => {
      const state = useInboxBoardFilterStore.getState()

      expect(state.status).toEqual([])
      expect(state.priority).toEqual([])
      expect(state.tags).toEqual([])
      expect(state.search).toBe('')
      expect(state.assignee).toBe('')
    })
  })

  describe('setStatus', () => {
    it('ステータスフィルタを設定できる', () => {
      useInboxBoardFilterStore.getState().setStatus(['in_progress', 'completed'])

      const { status } = useInboxBoardFilterStore.getState()
      expect(status).toEqual(['in_progress', 'completed'])
    })

    it('空配列で設定できる', () => {
      useInboxBoardFilterStore.getState().setStatus(['in_progress'])
      useInboxBoardFilterStore.getState().setStatus([])

      const { status } = useInboxBoardFilterStore.getState()
      expect(status).toEqual([])
    })
  })

  describe('setPriority', () => {
    it('優先度フィルタを設定できる', () => {
      useInboxBoardFilterStore.getState().setPriority(['high', 'urgent'])

      const { priority } = useInboxBoardFilterStore.getState()
      expect(priority).toEqual(['high', 'urgent'])
    })

    it('空配列で設定できる', () => {
      useInboxBoardFilterStore.getState().setPriority(['high'])
      useInboxBoardFilterStore.getState().setPriority([])

      const { priority } = useInboxBoardFilterStore.getState()
      expect(priority).toEqual([])
    })
  })

  describe('setTags', () => {
    it('タグフィルタを設定できる', () => {
      useInboxBoardFilterStore.getState().setTags(['tag1', 'tag2'])

      const { tags } = useInboxBoardFilterStore.getState()
      expect(tags).toEqual(['tag1', 'tag2'])
    })

    it('空配列で設定できる', () => {
      useInboxBoardFilterStore.getState().setTags(['tag1'])
      useInboxBoardFilterStore.getState().setTags([])

      const { tags } = useInboxBoardFilterStore.getState()
      expect(tags).toEqual([])
    })
  })

  describe('setSearch', () => {
    it('検索文字列を設定できる', () => {
      useInboxBoardFilterStore.getState().setSearch('test query')

      const { search } = useInboxBoardFilterStore.getState()
      expect(search).toBe('test query')
    })

    it('空文字列で設定できる', () => {
      useInboxBoardFilterStore.getState().setSearch('test')
      useInboxBoardFilterStore.getState().setSearch('')

      const { search } = useInboxBoardFilterStore.getState()
      expect(search).toBe('')
    })
  })

  describe('setAssignee', () => {
    it('担当者フィルタを設定できる', () => {
      useInboxBoardFilterStore.getState().setAssignee('user-123')

      const { assignee } = useInboxBoardFilterStore.getState()
      expect(assignee).toBe('user-123')
    })

    it('空文字列で設定できる', () => {
      useInboxBoardFilterStore.getState().setAssignee('user-123')
      useInboxBoardFilterStore.getState().setAssignee('')

      const { assignee } = useInboxBoardFilterStore.getState()
      expect(assignee).toBe('')
    })
  })

  describe('reset', () => {
    it('すべてのフィルタをリセットできる', () => {
      const store = useInboxBoardFilterStore.getState()

      store.setStatus(['in_progress'])
      store.setPriority(['high'])
      store.setTags(['tag1'])
      store.setSearch('test')
      store.setAssignee('user-123')

      store.reset()

      const state = useInboxBoardFilterStore.getState()
      expect(state.status).toEqual([])
      expect(state.priority).toEqual([])
      expect(state.tags).toEqual([])
      expect(state.search).toBe('')
      expect(state.assignee).toBe('')
    })
  })

  describe('複数フィルタの組み合わせ', () => {
    it('複数のフィルタを同時に設定できる', () => {
      const store = useInboxBoardFilterStore.getState()

      store.setStatus(['in_progress', 'completed'])
      store.setPriority(['high'])
      store.setTags(['work'])
      store.setSearch('important')
      store.setAssignee('user-456')

      const state = useInboxBoardFilterStore.getState()
      expect(state.status).toEqual(['in_progress', 'completed'])
      expect(state.priority).toEqual(['high'])
      expect(state.tags).toEqual(['work'])
      expect(state.search).toBe('important')
      expect(state.assignee).toBe('user-456')
    })
  })
})
