import { beforeEach, describe, expect, it } from 'vitest'

import { usePlanInspectorStore } from './usePlanInspectorStore'

describe('usePlanInspectorStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    usePlanInspectorStore.setState({
      isOpen: false,
      planId: null,
      instanceDate: null,
      initialData: undefined,
    })
  })

  describe('初期状態', () => {
    it('isOpenはfalse', () => {
      expect(usePlanInspectorStore.getState().isOpen).toBe(false)
    })

    it('planIdはnull', () => {
      expect(usePlanInspectorStore.getState().planId).toBeNull()
    })

    it('instanceDateはnull', () => {
      expect(usePlanInspectorStore.getState().instanceDate).toBeNull()
    })

    it('initialDataはundefined', () => {
      expect(usePlanInspectorStore.getState().initialData).toBeUndefined()
    })
  })

  describe('openInspector', () => {
    it('既存プランのInspectorを開ける', () => {
      usePlanInspectorStore.getState().openInspector('plan-123')

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.planId).toBe('plan-123')
      expect(state.instanceDate).toBeNull()
      expect(state.initialData).toBeUndefined()
    })

    it('新規作成モード（planId: null）で開ける', () => {
      usePlanInspectorStore.getState().openInspector(null)

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.planId).toBeNull()
    })

    it('instanceDateを指定して開ける', () => {
      usePlanInspectorStore.getState().openInspector('plan-123', {
        instanceDate: '2025-01-15',
      })

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.planId).toBe('plan-123')
      expect(state.instanceDate).toBe('2025-01-15')
    })

    it('新規作成時にinitialDataを設定できる', () => {
      usePlanInspectorStore.getState().openInspector(null, {
        initialData: {
          start_time: '2025-01-15T09:00:00Z',
          end_time: '2025-01-15T10:00:00Z',
        },
      })

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.planId).toBeNull()
      expect(state.initialData).toEqual({
        start_time: '2025-01-15T09:00:00Z',
        end_time: '2025-01-15T10:00:00Z',
      })
    })

    it('既存プランを開く時はinitialDataが設定されない', () => {
      usePlanInspectorStore.getState().openInspector('plan-123', {
        initialData: {
          start_time: '2025-01-15T09:00:00Z',
        },
      })

      const state = usePlanInspectorStore.getState()
      expect(state.planId).toBe('plan-123')
      expect(state.initialData).toBeUndefined()
    })
  })

  describe('closeInspector', () => {
    it('Inspectorを閉じると全ての状態がリセットされる', () => {
      // まず開く
      usePlanInspectorStore.getState().openInspector('plan-123', {
        instanceDate: '2025-01-15',
      })

      // 閉じる
      usePlanInspectorStore.getState().closeInspector()

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.planId).toBeNull()
      expect(state.instanceDate).toBeNull()
      expect(state.initialData).toBeUndefined()
    })

    it('新規作成モードで閉じてもリセットされる', () => {
      usePlanInspectorStore.getState().openInspector(null, {
        initialData: {
          start_time: '2025-01-15T09:00:00Z',
        },
      })

      usePlanInspectorStore.getState().closeInspector()

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.initialData).toBeUndefined()
    })
  })

  describe('ワークフロー', () => {
    it('開く→閉じる→再度開くが正しく動作する', () => {
      // 1回目: 開く
      usePlanInspectorStore.getState().openInspector('plan-1')
      expect(usePlanInspectorStore.getState().isOpen).toBe(true)
      expect(usePlanInspectorStore.getState().planId).toBe('plan-1')

      // 閉じる
      usePlanInspectorStore.getState().closeInspector()
      expect(usePlanInspectorStore.getState().isOpen).toBe(false)

      // 2回目: 別のプランを開く
      usePlanInspectorStore.getState().openInspector('plan-2')
      expect(usePlanInspectorStore.getState().isOpen).toBe(true)
      expect(usePlanInspectorStore.getState().planId).toBe('plan-2')
    })

    it('閉じずに別のプランを開くことができる', () => {
      usePlanInspectorStore.getState().openInspector('plan-1')
      usePlanInspectorStore.getState().openInspector('plan-2')

      const state = usePlanInspectorStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.planId).toBe('plan-2')
    })
  })
})
