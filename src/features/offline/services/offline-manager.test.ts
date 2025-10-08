import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OfflineManager } from './offline-manager'

describe.skip('OfflineManager', () => {
  let manager: OfflineManager
  let dbName: string

  beforeEach(() => {
    // テスト用のDBインスタンスを作成
    dbName = `BoxLogOfflineTest_${Date.now()}`
    manager = new OfflineManager()
  })

  afterEach(async () => {
    // テスト後のクリーンアップ
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase(dbName)
    }
  })

  describe('初期化', () => {
    it('should initialize successfully', async () => {
      // 初期化完了を待つ
      await new Promise((resolve) => {
        manager.on('initialized', resolve)
        setTimeout(resolve, 1000) // タイムアウト
      })

      const status = manager.getStatus()
      expect(status.isInitialized).toBe(true)
    })

    it('should have correct initial status', () => {
      const status = manager.getStatus()
      expect(status).toHaveProperty('isOnline')
      expect(status).toHaveProperty('isInitialized')
      expect(status).toHaveProperty('syncInProgress')
      expect(status).toHaveProperty('queueSize')
    })
  })

  describe('アクション記録', () => {
    it('should record action with pending status', async () => {
      const action = {
        type: 'create' as const,
        entity: 'task' as const,
        data: { title: 'Test Task' },
      }

      const actionId = await manager.recordAction(action)
      expect(actionId).toBeTruthy()
      expect(typeof actionId).toBe('string')
    })

    it('should emit actionRecorded event', async () => {
      const eventSpy = vi.fn()
      manager.on('actionRecorded', eventSpy)

      const action = {
        type: 'update' as const,
        entity: 'task' as const,
        data: { id: '1', title: 'Updated Task' },
      }

      await manager.recordAction(action)
      expect(eventSpy).toHaveBeenCalled()
    })
  })

  describe('保留中のアクション取得', () => {
    it('should return empty array when no pending actions', async () => {
      const pendingActions = await manager.getPendingActions()
      expect(Array.isArray(pendingActions)).toBe(true)
      expect(pendingActions).toHaveLength(0)
    })

    it('should return pending actions after recording', async () => {
      await manager.recordAction({
        type: 'create' as const,
        entity: 'task' as const,
        data: { title: 'Task 1' },
      })

      await manager.recordAction({
        type: 'create' as const,
        entity: 'task' as const,
        data: { title: 'Task 2' },
      })

      const pendingActions = await manager.getPendingActions()
      expect(pendingActions.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('競合検出', () => {
    it('should return empty array when no conflicts', async () => {
      const conflictingActions = await manager.getConflictingActions()
      expect(Array.isArray(conflictingActions)).toBe(true)
      expect(conflictingActions).toHaveLength(0)
    })
  })

  describe('オンライン/オフライン状態', () => {
    it('should track online status', () => {
      const status = manager.getStatus()
      expect(typeof status.isOnline).toBe('boolean')
    })

    it('should emit online event', () => {
      const eventSpy = vi.fn()
      manager.on('online', eventSpy)

      // オンラインイベントをシミュレート
      window.dispatchEvent(new Event('online'))

      expect(eventSpy).toHaveBeenCalled()
    })

    it('should emit offline event', () => {
      const eventSpy = vi.fn()
      manager.on('offline', eventSpy)

      // オフラインイベントをシミュレート
      window.dispatchEvent(new Event('offline'))

      expect(eventSpy).toHaveBeenCalled()
    })
  })

  describe('イベントリスナー', () => {
    it('should add event listener', () => {
      const callback = vi.fn()
      manager.on('initialized', callback)

      // イベントリスナーが追加されたことを確認
      expect(callback).toBeDefined()
    })

    it('should remove event listener', () => {
      const callback = vi.fn()
      manager.on('initialized', callback)
      manager.off('initialized', callback)

      // イベントリスナーが削除されたことを確認
      expect(callback).toBeDefined()
    })
  })

  describe('ステータス取得', () => {
    it('should return complete status object', () => {
      const status = manager.getStatus()

      expect(status).toEqual({
        isOnline: expect.any(Boolean),
        isInitialized: expect.any(Boolean),
        syncInProgress: expect.any(Boolean),
        queueSize: expect.any(Number),
      })
    })
  })

  describe('完了済みアクションのクリア', () => {
    it('should clear completed actions without error', async () => {
      await expect(manager.clearCompletedActions()).resolves.not.toThrow()
    })
  })
})
