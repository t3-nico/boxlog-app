// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { offlineManager, type OfflineAction } from '@/features/offline/services/offline-manager'
// import { ConflictResolutionModal } from '@/components/ConflictResolutionModal'
// import { toast } from '@/components/shadcn-ui/use-toast'
interface ToastOptions {
  title: string
  description?: string
  variant?: string
}

const toast = (options: ToastOptions) => {
  console.log('Toast:', options.title, options.description)
}

export interface OfflineSyncState {
  isOnline: boolean
  isInitialized: boolean
  pendingActions: OfflineAction[]
  conflictingActions: OfflineAction[]
  syncInProgress: boolean
  lastSyncTime: Date | null
  queueSize: number
}

export interface ConflictContext {
  actionId: string
  entity: string
  localData: unknown
  serverData: unknown
  localTimestamp: Date
  serverTimestamp: Date
  conflicts: unknown[]
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isInitialized: false,
    pendingActions: [],
    conflictingActions: [],
    syncInProgress: false,
    lastSyncTime: null,
    queueSize: 0
  })

  const [currentConflict, setCurrentConflict] = useState<ConflictContext | null>(null)
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  // 状態の更新
  const updateState = useCallback(async () => {
    try {
      const pendingActions = await offlineManager.getPendingActions()
      const conflictingActions = await offlineManager.getConflictingActions()
      const managerStatus = offlineManager.getStatus()
      
      setState(prev => ({
        ...prev,
        pendingActions,
        conflictingActions,
        isOnline: managerStatus.isOnline,
        isInitialized: managerStatus.isInitialized,
        syncInProgress: managerStatus.syncInProgress,
        queueSize: managerStatus.queueSize
      }))
    } catch (error) {
      console.error('Failed to update sync state:', error)
    }
  }, [])

  // デバウンス付きの状態更新
  const debouncedUpdateState = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(updateState, 100)
  }, [updateState])

  // イベントリスナーの設定
  useEffect(() => {
    const handleInitialized = () => {
      setState(prev => ({ ...prev, isInitialized: true }))
      updateState()
    }

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      toast({
        title: "オンラインに復帰しました",
        description: "同期を開始しています...",
        variant: "default"
      })
      debouncedUpdateState()
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
      toast({
        title: "オフラインモードで動作中",
        description: "変更はローカルに保存され、オンライン復帰時に同期されます",
        variant: "default"
      })
    }

    const handleSyncStarted = () => {
      setState(prev => ({ ...prev, syncInProgress: true }))
      debouncedUpdateState()
    }

    const handleSyncCompleted = (data: { processed: number; conflicts: number }) => {
      setState(prev => ({
        ...prev,
        syncInProgress: false,
        lastSyncTime: new Date()
      }))
      
      if (data.processed > 0) {
        toast({
          title: "同期が完了しました",
          description: `${data.processed}件の変更が同期されました`,
          variant: "default"
        })
      }
      
      if (data.conflicts > 0) {
        toast({
          title: "競合が発生しました",
          description: `${data.conflicts}件の競合を解決してください`,
          variant: "destructive"
        })
      }
      
      debouncedUpdateState()
    }

    const handleSyncError = (error: Error) => {
      setState(prev => ({ ...prev, syncInProgress: false }))
      toast({
        title: "同期に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive"
      })
      debouncedUpdateState()
    }

    const handleActionRecorded = () => {
      debouncedUpdateState()
    }

    const handleConflictDetected = (conflictData: {
      action: OfflineAction
      conflicts: unknown[]
      conflictId: string
    }) => {
      setCurrentConflict({
        actionId: conflictData.action.id,
        entity: conflictData.action.entity,
        localData: conflictData.action.data,
        serverData: conflictData.conflicts[0]?.serverData || {},
        localTimestamp: conflictData.action.timestamp,
        serverTimestamp: new Date(conflictData.conflicts[0]?.serverTimestamp || Date.now()),
        conflicts: conflictData.conflicts
      })
      setIsConflictModalOpen(true)
      debouncedUpdateState()
    }

    const handleConflictResolved = () => {
      setCurrentConflict(null)
      setIsConflictModalOpen(false)
      toast({
        title: "競合が解決されました",
        description: "データが正常に同期されました",
        variant: "default"
      })
      debouncedUpdateState()
    }

    const handleSyncFailed = (data: { action: OfflineAction; error: Error }) => {
      toast({
        title: "同期に失敗しました",
        description: `${data.action.entity}の${data.action.type}が失敗しました: ${data.error.message}`,
        variant: "destructive"
      })
      debouncedUpdateState()
    }

    // イベントリスナーの登録
    offlineManager.on('initialized', handleInitialized)
    offlineManager.on('online', handleOnline)
    offlineManager.on('offline', handleOffline)
    offlineManager.on('syncStarted', handleSyncStarted)
    offlineManager.on('syncCompleted', handleSyncCompleted)
    offlineManager.on('syncError', handleSyncError)
    offlineManager.on('actionRecorded', handleActionRecorded)
    offlineManager.on('conflictDetected', handleConflictDetected)
    offlineManager.on('conflictResolved', handleConflictResolved)
    offlineManager.on('syncFailed', handleSyncFailed)

    // 初期状態の取得
    updateState()

    return () => {
      // イベントリスナーのクリーンアップ
      offlineManager.off('initialized', handleInitialized)
      offlineManager.off('online', handleOnline)
      offlineManager.off('offline', handleOffline)
      offlineManager.off('syncStarted', handleSyncStarted)
      offlineManager.off('syncCompleted', handleSyncCompleted)
      offlineManager.off('syncError', handleSyncError)
      offlineManager.off('actionRecorded', handleActionRecorded)
      offlineManager.off('conflictDetected', handleConflictDetected)
      offlineManager.off('conflictResolved', handleConflictResolved)
      offlineManager.off('syncFailed', handleSyncFailed)
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [debouncedUpdateState, updateState])

  // アクションの記録
  const recordAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    entity: 'task' | 'record' | 'block' | 'tag',
    data: unknown
  ) => {
    try {
      const actionId = await offlineManager.recordAction({ type, entity, data })
      debouncedUpdateState()
      return actionId
    } catch (error) {
      console.error('Failed to record action:', error)
      toast({
        title: "アクションの記録に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive"
      })
      throw error
    }
  }, [debouncedUpdateState])

  // 手動同期の実行
  const retrySync = useCallback(async () => {
    try {
      await offlineManager.processPendingActions()
    } catch (error) {
      console.error('Manual sync failed:', error)
      toast({
        title: "同期に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive"
      })
    }
  }, [])

  // 完了したアクションのクリア
  const clearCompleted = useCallback(async () => {
    try {
      await offlineManager.clearCompletedActions()
      debouncedUpdateState()
      toast({
        title: "履歴をクリアしました",
        description: "完了した同期アクションの履歴が削除されました",
        variant: "default"
      })
    } catch (error) {
      console.error('Failed to clear completed actions:', error)
      toast({
        title: "履歴のクリアに失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive"
      })
    }
  }, [debouncedUpdateState])

  // 競合解決
  const resolveConflict = useCallback(async (resolution: {
    choice: 'local' | 'server' | 'merge'
    mergedData?: unknown
  }) => {
    if (!currentConflict) return

    try {
      // 競合IDを取得するためのロジック（実際の実装では適切な方法で取得）
      const conflictId = `conflict_${currentConflict.actionId}`
      await offlineManager.resolveConflict(conflictId, resolution)
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      toast({
        title: "競合の解決に失敗しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive"
      })
    }
  }, [currentConflict])

  // 楽観的更新のヘルパー
  const optimisticUpdate = useCallback(async <T,>(
    optimisticData: T,
    actualUpdate: () => Promise<T>,
    rollback: (data: T) => void
  ): Promise<T> => {
    try {
      const result = await actualUpdate()
      return result
    } catch (error) {
      // エラーが発生した場合はロールバック
      rollback(optimisticData)
      throw error
    }
  }, [])

  return {
    // 状態
    ...state,
    currentConflict,
    
    // アクション
    recordAction,
    retrySync,
    clearCompleted,
    resolveConflict,
    optimisticUpdate,
    
    // 競合解決モーダル
    ConflictModal: null // Temporarily disabled
    // ConflictModal: currentConflict ? (
    //   <ConflictResolutionModal
    //     isOpen={isConflictModalOpen}
    //     conflict={currentConflict}
    //     onResolve={resolveConflict}
    //     onCancel={() => {
    //       setIsConflictModalOpen(false)
    //       setCurrentConflict(null)
    //     }}
    //   />
    // ) : null
  }
}

// 特定のエンティティのオフライン操作用カスタムフック
export function useOfflineEntity<T extends Record<string, unknown>>(
  entity: 'task' | 'record' | 'block' | 'tag',
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData)
  const { recordAction, optimisticUpdate } = useOfflineSync()

  const create = useCallback(async (item: Omit<T, 'id'>) => {
    const tempId = `temp_${Date.now()}`
    const optimisticItem = { ...item, id: tempId } as unknown as T
    
    return await optimisticUpdate(
      optimisticItem,
      async () => {
        // 楽観的更新
        setData(prev => [...prev, optimisticItem])
        
        // オフラインアクションを記録
        await recordAction('create', entity, optimisticItem)
        
        return optimisticItem
      },
      (item) => {
        // ロールバック
        setData(prev => prev.filter(i => i.id !== item.id))
      }
    )
  }, [recordAction, optimisticUpdate, entity])

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    const originalItem = data.find(item => item.id === id)
    if (!originalItem) throw new Error('Item not found')

    const updatedItem = { ...originalItem, ...updates }
    
    return await optimisticUpdate(
      updatedItem,
      async () => {
        // 楽観的更新
        setData(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ))
        
        // オフラインアクションを記録
        await recordAction('update', entity, updatedItem)
        
        return updatedItem
      },
      (_item) => {
        // ロールバック
        setData(prev => prev.map(i =>
          i.id === id ? originalItem : i
        ))
      }
    )
  }, [data, recordAction, optimisticUpdate, entity])

  const remove = useCallback(async (id: string) => {
    const originalItem = data.find(item => item.id === id)
    if (!originalItem) throw new Error('Item not found')
    
    return await optimisticUpdate(
      originalItem,
      async () => {
        // 楽観的更新
        setData(prev => prev.filter(item => item.id !== id))
        
        // オフラインアクションを記録
        await recordAction('delete', entity, { id })
        
        return originalItem
      },
      (item) => {
        // ロールバック
        setData(prev => [...prev, item])
      }
    )
  }, [data, recordAction, optimisticUpdate, entity])

  return {
    data,
    setData,
    create,
    update,
    remove
  }
}