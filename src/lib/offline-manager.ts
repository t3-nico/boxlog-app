import { generateId } from './utils'

export interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'task' | 'record' | 'block' | 'tag'
  data: any
  timestamp: Date
  syncStatus: 'pending' | 'syncing' | 'completed' | 'conflict'
  retryCount?: number
  originalData?: any
}

export interface ConflictData {
  localData: any
  serverData: any
  localTimestamp: Date
  serverTimestamp: Date
  field: string
}

export interface SyncResult {
  success: boolean
  conflicts?: ConflictData[]
  serverData?: any
  error?: string
}

export class OfflineManager {
  private db: IDBDatabase | null = null
  private isInitialized = false
  private syncQueue: OfflineAction[] = []
  private isOnline = navigator.onLine
  private syncInProgress = false
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.initializeManager()
  }

  private async initializeManager() {
    try {
      await this.initIndexedDB()
      this.setupEventListeners()
      this.isInitialized = true
      this.emit('initialized')
    } catch (error) {
      console.error('Failed to initialize OfflineManager:', error)
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BoxLogOffline', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // オフラインアクションストア
        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' })
          actionStore.createIndex('timestamp', 'timestamp')
          actionStore.createIndex('syncStatus', 'syncStatus')
          actionStore.createIndex('entity', 'entity')
        }
        
        // ローカルキャッシュストア
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
          cacheStore.createIndex('expiry', 'expiry')
        }
        
        // 競合解決履歴ストア
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' })
          conflictStore.createIndex('resolvedAt', 'resolvedAt')
        }
      }
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }
    })
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.emit('online')
      this.processPendingActions()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('offline')
    })

    // ページアンロード時の処理
    window.addEventListener('beforeunload', () => {
      this.flushPendingActions()
    })

    // 定期的な同期チェック
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processPendingActions()
      }
    }, 30000) // 30秒ごと
  }

  // イベントエミッター機能
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // アクションの記録
  async recordAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'syncStatus'>): Promise<string> {
    if (!this.db) {
      throw new Error('OfflineManager not initialized')
    }

    const offlineAction: OfflineAction = {
      ...action,
      id: generateId(),
      timestamp: new Date(),
      syncStatus: 'pending',
      retryCount: 0
    }

    try {
      // IndexedDBに保存
      const transaction = this.db.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      await this.promisifyRequest(store.add(offlineAction))

      // メモリキューに追加
      this.syncQueue.push(offlineAction)

      this.emit('actionRecorded', offlineAction)

      // オンラインなら即座に同期試行
      if (this.isOnline && !this.syncInProgress) {
        this.processPendingActions()
      }

      return offlineAction.id
    } catch (error) {
      console.error('Failed to record action:', error)
      throw error
    }
  }

  // 保留中のアクションを処理
  async processPendingActions() {
    if (!this.db || !this.isOnline || this.syncInProgress) {
      return
    }

    this.syncInProgress = true
    this.emit('syncStarted')

    try {
      // DBから保留中のアクションを取得
      const transaction = this.db.transaction(['actions'], 'readonly')
      const store = transaction.objectStore('actions')
      const index = store.index('syncStatus')
      const pendingActions = await this.promisifyRequest(index.getAll('pending'))

      if (pendingActions.length === 0) {
        this.syncInProgress = false
        this.emit('syncCompleted', { processed: 0, conflicts: 0 })
        return
      }

      let processed = 0
      let conflicts = 0

      // 順序を保って処理
      for (const action of pendingActions.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )) {
        try {
          const result = await this.syncAction(action)
          if (result.conflicts && result.conflicts.length > 0) {
            conflicts++
            await this.handleConflict(action, result.conflicts)
          } else {
            processed++
          }
        } catch (error) {
          console.error('Sync failed for action:', action.id, error)
          await this.handleSyncFailure(action, error)
        }
      }

      this.emit('syncCompleted', { processed, conflicts })
    } catch (error) {
      console.error('Failed to process pending actions:', error)
      this.emit('syncError', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // 個別アクションの同期
  private async syncAction(action: OfflineAction): Promise<SyncResult> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    // 同期中フラグを立てる
    await this.updateActionStatus(action.id, 'syncing')

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Client-Timestamp': action.timestamp.toISOString()
        },
        body: JSON.stringify({
          action: action.type,
          entity: action.entity,
          data: action.data,
          clientTimestamp: action.timestamp,
          actionId: action.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.type === 'conflict') {
          return {
            success: false,
            conflicts: error.conflicts,
            serverData: error.serverData
          }
        }
        throw new Error(error.message || 'Sync failed')
      }

      const result = await response.json()

      // ローカルデータを更新
      if (result.data) {
        await this.updateLocalCache(action.entity, result.data)
      }

      // 同期完了
      await this.updateActionStatus(action.id, 'completed')

      return { success: true, serverData: result.data }
    } catch (error) {
      await this.updateActionStatus(action.id, 'pending')
      throw error
    }
  }

  // 競合処理
  private async handleConflict(action: OfflineAction, conflicts: ConflictData[]) {
    await this.updateActionStatus(action.id, 'conflict')

    // 競合データを保存
    const conflictRecord = {
      id: generateId(),
      actionId: action.id,
      conflicts: conflicts,
      createdAt: new Date(),
      resolvedAt: null,
      resolution: null
    }

    const transaction = this.db!.transaction(['conflicts'], 'readwrite')
    const store = transaction.objectStore('conflicts')
    await this.promisifyRequest(store.add(conflictRecord))

    // 競合解決イベントを発火
    this.emit('conflictDetected', {
      action,
      conflicts,
      conflictId: conflictRecord.id
    })
  }

  // 競合解決
  async resolveConflict(conflictId: string, resolution: {
    choice: 'local' | 'server' | 'merge'
    mergedData?: any
  }) {
    if (!this.db) {
      throw new Error('Database not available')
    }

    try {
      // 競合データを取得
      const transaction = this.db.transaction(['conflicts'], 'readonly')
      const store = transaction.objectStore('conflicts')
      const conflict = await this.promisifyRequest(store.get(conflictId))

      if (!conflict) {
        throw new Error('Conflict not found')
      }

      // 元のアクションを取得
      const actionTransaction = this.db.transaction(['actions'], 'readonly')
      const actionStore = actionTransaction.objectStore('actions')
      const action = await this.promisifyRequest(actionStore.get(conflict.actionId))

      if (!action) {
        throw new Error('Original action not found')
      }

      let finalData = action.data

      if (resolution.choice === 'server') {
        // サーバーの変更を受け入れ
        finalData = conflict.conflicts[0].serverData
      } else if (resolution.choice === 'merge') {
        // マージした結果を使用
        finalData = resolution.mergedData
      }
      // 'local'の場合は元のデータを使用

      // 解決されたデータで同期
      const syncResult = await this.forceSyncData(action.entity, finalData, action.id)

      if (syncResult.success) {
        // 競合解決完了をマーク
        await this.markConflictResolved(conflictId, resolution)
        await this.updateActionStatus(action.id, 'completed')
        
        this.emit('conflictResolved', {
          conflictId,
          resolution,
          finalData
        })
      }

      return syncResult
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      throw error
    }
  }

  // 強制同期
  private async forceSyncData(entity: string, data: any, actionId: string): Promise<SyncResult> {
    try {
      const response = await fetch('/api/sync/force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity,
          data,
          actionId,
          force: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Force sync failed')
      }

      const result = await response.json()
      return { success: true, serverData: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ユーティリティメソッド
  private async updateActionStatus(actionId: string, status: OfflineAction['syncStatus']) {
    if (!this.db) return

    const transaction = this.db.transaction(['actions'], 'readwrite')
    const store = transaction.objectStore('actions')
    const action = await this.promisifyRequest(store.get(actionId))
    
    if (action) {
      action.syncStatus = status
      await this.promisifyRequest(store.put(action))
    }
  }

  private async updateLocalCache(entity: string, data: any) {
    if (!this.db) return

    const transaction = this.db.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    
    await this.promisifyRequest(store.put({
      key: `${entity}_${data.id}`,
      data,
      updatedAt: new Date(),
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間
    }))
  }

  private async markConflictResolved(conflictId: string, resolution: any) {
    if (!this.db) return

    const transaction = this.db.transaction(['conflicts'], 'readwrite')
    const store = transaction.objectStore('conflicts')
    const conflict = await this.promisifyRequest(store.get(conflictId))
    
    if (conflict) {
      conflict.resolvedAt = new Date()
      conflict.resolution = resolution
      await this.promisifyRequest(store.put(conflict))
    }
  }

  private async handleSyncFailure(action: OfflineAction, error: any) {
    const retryCount = (action.retryCount || 0) + 1
    const maxRetries = 3

    if (retryCount < maxRetries) {
      // リトライ
      action.retryCount = retryCount
      await this.updateActionStatus(action.id, 'pending')
    } else {
      // 最大リトライ回数に達した場合
      this.emit('syncFailed', { action, error })
    }
  }

  private flushPendingActions() {
    // ページアンロード時の処理
    if (this.syncQueue.length > 0) {
      // 緊急時の同期処理
      navigator.sendBeacon('/api/sync/batch', JSON.stringify({
        actions: this.syncQueue.filter(a => a.syncStatus === 'pending')
      }))
    }
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 公開メソッド
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) return []

    const transaction = this.db.transaction(['actions'], 'readonly')
    const store = transaction.objectStore('actions')
    const index = store.index('syncStatus')
    return await this.promisifyRequest(index.getAll('pending'))
  }

  async getConflictingActions(): Promise<OfflineAction[]> {
    if (!this.db) return []

    const transaction = this.db.transaction(['actions'], 'readonly')
    const store = transaction.objectStore('actions')
    const index = store.index('syncStatus')
    return await this.promisifyRequest(index.getAll('conflict'))
  }

  async clearCompletedActions() {
    if (!this.db) return

    const transaction = this.db.transaction(['actions'], 'readwrite')
    const store = transaction.objectStore('actions')
    const index = store.index('syncStatus')
    const completedActions = await this.promisifyRequest(index.getAll('completed'))
    
    for (const action of completedActions) {
      await this.promisifyRequest(store.delete(action.id))
    }
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      isInitialized: this.isInitialized,
      syncInProgress: this.syncInProgress,
      queueSize: this.syncQueue.length
    }
  }
}

// シングルトンインスタンス
export const offlineManager = new OfflineManager()