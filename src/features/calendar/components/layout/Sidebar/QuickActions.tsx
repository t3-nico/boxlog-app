'use client'

import { memo, useCallback } from 'react'
import { 
  Plus, 
  Clock, 
  Calendar, 
  FileText, 
  Settings, 
  Download,
  Upload,
  Zap,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/shadcn-ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  disabled?: boolean
}

export interface QuickActionsProps {
  onCreateEvent?: () => void
  onCreateTask?: () => void
  onCreateLog?: () => void
  onOpenSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  onSyncCalendars?: () => void
  onGoToToday?: () => void
  customActions?: QuickAction[]
  className?: string
  variant?: 'compact' | 'expanded'
}

export const QuickActions = memo<QuickActionsProps>(({
  onCreateEvent,
  onCreateTask,
  onCreateLog,
  onOpenSettings,
  onExport,
  onImport,
  onSyncCalendars,
  onGoToToday,
  customActions = [],
  className,
  variant = 'expanded'
}) => {
  const handleAction = useCallback((actionId: string, callback?: () => void) => {
    callback?.()
  }, [])

  const defaultActions: QuickAction[] = [
    {
      id: 'create-event',
      label: 'イベント作成',
      icon: Calendar,
      shortcut: 'Ctrl+N',
      color: 'primary'
    },
    {
      id: 'create-task',
      label: 'タスク作成',
      icon: Plus,
      shortcut: 'Ctrl+T',
      color: 'secondary'
    },
    {
      id: 'create-log',
      label: 'ログ作成',
      icon: Clock,
      color: 'success'
    },
    {
      id: 'go-to-today',
      label: '今日に移動',
      icon: RotateCcw,
      shortcut: 'T'
    }
  ]

  const actionCallbacks = {
    'create-event': onCreateEvent,
    'create-task': onCreateTask,
    'create-log': onCreateLog,
    'go-to-today': onGoToToday
  }

  const allActions = [...defaultActions, ...customActions]

  if (variant === 'compact') {
    return (
      <div className={cn("quick-actions-compact", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              クイックアクション
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>作成</DropdownMenuLabel>
            {allActions.slice(0, 3).map(action => {
              const IconComponent = action.icon
              const callback = actionCallbacks[action.id as keyof typeof actionCallbacks]
              
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleAction(action.id, callback)}
                  disabled={action.disabled}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex-1">
                    {action.label}
                    {action.shortcut && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {action.shortcut}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>ナビゲーション</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleAction('go-to-today', onGoToToday)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              今日に移動
              <span className="ml-auto text-xs text-muted-foreground">T</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>その他</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleAction('settings', onOpenSettings)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction('sync', onSyncCalendars)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              カレンダー同期
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction('export', onExport)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              エクスポート
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction('import', onImport)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              インポート
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className={cn("quick-actions space-y-3", className)}>
      {/* ヘッダー */}
      <div className="flex items-center gap-1">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">クイックアクション</span>
      </div>

      {/* メインアクション */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateEvent}
            className={cn(
              "h-12 flex-col gap-1 text-xs",
              "hover:bg-primary hover:text-primary-foreground transition-colors"
            )}
            title="新しいイベントを作成 (Ctrl+N)"
          >
            <Calendar className="h-4 w-4" />
            イベント
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            className={cn(
              "h-12 flex-col gap-1 text-xs",
              "hover:bg-secondary hover:text-secondary-foreground transition-colors"
            )}
            title="新しいタスクを作成 (Ctrl+T)"
          >
            <Plus className="h-4 w-4" />
            タスク
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateLog}
          className={cn(
            "w-full h-10 gap-2 text-xs",
            "hover:bg-green-500 hover:text-white transition-colors"
          )}
        >
          <Clock className="h-4 w-4" />
          ログを記録
        </Button>
      </div>

      {/* ナビゲーション */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">ナビゲーション</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoToToday}
          className="w-full h-8 gap-2 text-xs justify-start"
        >
          <RotateCcw className="h-3 w-3" />
          今日に移動
          <span className="ml-auto text-xs text-muted-foreground">T</span>
        </Button>
      </div>

      {/* その他のアクション */}
      <div className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 gap-2 text-xs justify-start"
            >
              <Settings className="h-3 w-3" />
              その他のアクション
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSyncCalendars}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              カレンダー同期
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              エクスポート
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onImport}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              インポート
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* カスタムアクション */}
      {customActions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">カスタムアクション</div>
          <div className="space-y-1">
            {customActions.map(action => {
              const IconComponent = action.icon
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={action.disabled}
                  className="w-full h-8 gap-2 text-xs justify-start"
                >
                  <IconComponent className="h-3 w-3" />
                  {action.label}
                  {action.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {action.shortcut}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})

QuickActions.displayName = 'QuickActions'