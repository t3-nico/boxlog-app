'use client'

import { useState } from 'react'
import { 
  WifiIcon, 
  SignalSlashIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import type { OfflineAction } from '@/lib/offline-manager'

interface SyncDetailsProps {
  pendingActions: OfflineAction[]
  conflictingActions: OfflineAction[]
  lastSyncTime: Date | null
  onRetrySync: () => void
  onClearCompleted: () => void
}

function SyncDetailsPanel({
  pendingActions,
  conflictingActions,
  lastSyncTime,
  onRetrySync,
  onClearCompleted
}: SyncDetailsProps) {
  const totalActions = pendingActions.length + conflictingActions.length
  const syncingActions = pendingActions.filter(a => a.syncStatus === 'syncing')

  const getActionIcon = (action: OfflineAction) => {
    switch (action.type) {
      case 'create':
        return '＋'
      case 'update':
        return '✏️'
      case 'delete':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case 'task':
        return 'タスク'
      case 'record':
        return '記録'
      case 'block':
        return 'ブロック'
      case 'tag':
        return 'タグ'
      default:
        return entity
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'create':
        return '作成'
      case 'update':
        return '更新'
      case 'delete':
        return '削除'
      default:
        return type
    }
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>同期状態</span>
          {totalActions > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalActions}件
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 最終同期時刻 */}
        {lastSyncTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>
              最終同期: {formatDistanceToNow(lastSyncTime, { 
                addSuffix: true, 
                locale: ja 
              })}
            </span>
          </div>
        )}

        {/* 同期中の進捗 */}
        {syncingActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />
              <span>同期中... ({syncingActions.length}件)</span>
            </div>
            <Progress 
              value={(syncingActions.length / totalActions) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* 保留中のアクション */}
        {pendingActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">保留中</span>
              <Badge variant="secondary" className="text-xs">
                {pendingActions.length}件
              </Badge>
            </div>
            
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {pendingActions.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                    <span className="text-base">{getActionIcon(action)}</span>
                    <span className="flex-1 truncate">
                      {getEntityLabel(action.entity)}の{getActionLabel(action.type)}
                    </span>
                    <span className="text-gray-500">
                      {formatDistanceToNow(action.timestamp, { locale: ja })}
                    </span>
                  </div>
                ))}
                {pendingActions.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    他{pendingActions.length - 5}件
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 競合しているアクション */}
        {conflictingActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">競合</span>
              <Badge variant="destructive" className="text-xs">
                {conflictingActions.length}件
              </Badge>
            </div>
            
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {conflictingActions.map((action) => (
                  <div key={action.id} className="flex items-center gap-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500" />
                    <span className="flex-1 truncate">
                      {getEntityLabel(action.entity)}の{getActionLabel(action.type)}
                    </span>
                    <span className="text-yellow-600 text-xs">解決が必要</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 同期完了時のメッセージ */}
        {totalActions === 0 && lastSyncTime && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircleIcon className="h-4 w-4" />
            <span>すべて同期済み</span>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 pt-2">
          {pendingActions.length > 0 && (
            <Button
              size="sm"
              onClick={onRetrySync}
              className="flex-1"
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              再同期
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={onClearCompleted}
            className="flex-1"
          >
            履歴クリア
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SyncStatusIndicator() {
  const { 
    isOnline, 
    pendingActions, 
    conflictingActions, 
    lastSyncTime,
    syncInProgress,
    retrySync,
    clearCompleted
  } = useOfflineSync()
  
  const [isOpen, setIsOpen] = useState(false)
  
  const totalPending = pendingActions.length
  const totalConflicts = conflictingActions.length
  const hasIssues = totalPending > 0 || totalConflicts > 0

  // 状態に応じたスタイルとアイコン
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: SignalSlashIcon,
        label: 'オフライン',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconClassName: 'text-yellow-600'
      }
    }
    
    if (syncInProgress) {
      return {
        icon: ArrowPathIcon,
        label: `同期中 (${totalPending})`,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        iconClassName: 'text-blue-600 animate-spin'
      }
    }
    
    if (totalConflicts > 0) {
      return {
        icon: ExclamationTriangleIcon,
        label: `競合 (${totalConflicts})`,
        className: 'bg-red-100 text-red-800 border-red-200',
        iconClassName: 'text-red-600'
      }
    }
    
    if (totalPending > 0) {
      return {
        icon: ClockIcon,
        label: `保留中 (${totalPending})`,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        iconClassName: 'text-orange-600'
      }
    }
    
    return {
      icon: CheckCircleIcon,
      label: '同期済み',
      className: 'bg-green-100 text-green-800 border-green-200',
      iconClassName: 'text-green-600'
    }
  }

  const config = getStatusConfig()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-8 px-3 transition-all duration-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            config.className
          )}
        >
          <config.icon className={cn("h-4 w-4 mr-2", config.iconClassName)} />
          <span className="text-sm font-medium">{config.label}</span>
          
          {/* 通知バッジ */}
          {hasIssues && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0" 
        align="end"
        sideOffset={5}
      >
        <SyncDetailsPanel
          pendingActions={pendingActions}
          conflictingActions={conflictingActions}
          lastSyncTime={lastSyncTime}
          onRetrySync={retrySync}
          onClearCompleted={clearCompleted}
        />
      </PopoverContent>
    </Popover>
  )
}

// 簡易版のインジケーター（ヘッダーなどで使用）
export function SimpleSyncIndicator() {
  const { isOnline, pendingActions, conflictingActions, syncInProgress } = useOfflineSync()
  
  const totalIssues = pendingActions.length + conflictingActions.length
  
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <SignalSlashIcon className="h-4 w-4" />
        <span className="text-xs">オフライン</span>
      </div>
    )
  }
  
  if (syncInProgress) {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <ArrowPathIcon className="h-4 w-4 animate-spin" />
        <span className="text-xs">同期中</span>
      </div>
    )
  }
  
  if (totalIssues > 0) {
    return (
      <div className="flex items-center gap-1 text-orange-600">
        <ClockIcon className="h-4 w-4" />
        <span className="text-xs">{totalIssues}件待機</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1 text-green-600">
      <CheckCircleIcon className="h-4 w-4" />
      <span className="text-xs">同期済み</span>
    </div>
  )
}

// 接続状態のみを表示するインジケーター
export function ConnectionIndicator() {
  const { isOnline } = useOfflineSync()
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs",
      isOnline ? "text-green-600" : "text-yellow-600"
    )}>
      {isOnline ? (
        <WifiIcon className="h-3 w-3" />
      ) : (
        <SignalSlashIcon className="h-3 w-3" />
      )}
      <span>{isOnline ? 'オンライン' : 'オフライン'}</span>
    </div>
  )
}