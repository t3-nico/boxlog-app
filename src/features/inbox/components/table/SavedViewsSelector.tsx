import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useInboxViewStore } from '../../stores/useInboxViewStore'
import type { InboxView } from '../../types/view'
import { ViewSettingsDialog } from './ViewSettingsDialog'

interface SavedViewsSelectorProps {
  /** 新規ビュー作成時の初期状態 */
  currentState?: {
    filters: InboxView['filters']
    sorting?: InboxView['sorting']
    pageSize?: number
  }
}

/**
 * 保存されたビューセレクター
 *
 * ユーザーが保存したビューの切り替えを行うコンポーネント
 * - デフォルトビュー（すべて、作業中、配置済み）
 * - カスタムビュー（ユーザーが保存したビュー）
 * - ビューの作成・編集・削除
 *
 * @example
 * ```tsx
 * <SavedViewsSelector currentState={{ filters, sorting, pageSize }} />
 * ```
 */
export function SavedViewsSelector({ currentState }: SavedViewsSelectorProps) {
  const { views, activeViewId, setActiveView, deleteView } = useInboxViewStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingView, setEditingView] = useState<InboxView | undefined>(undefined)

  // Table typeのビューのみ表示
  const tableViews = views.filter((view) => view.type === 'table')
  const activeView = views.find((view) => view.id === activeViewId)

  // デフォルトビューとカスタムビューに分離
  const defaultViews = tableViews.filter((view) => view.id.startsWith('default-'))
  const customViews = tableViews.filter((view) => !view.id.startsWith('default-'))

  // 新規ビュー作成ダイアログを開く
  const handleCreateView = () => {
    setEditingView(undefined)
    setDialogOpen(true)
  }

  // ビュー編集ダイアログを開く
  const handleEditView = (view: InboxView, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingView(view)
    setDialogOpen(true)
  }

  // ビューを削除
  const handleDeleteView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('このビューを削除してもよろしいですか？')) {
      deleteView(viewId)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Layers className="size-4" />
            {activeView?.name || 'ビューを選択'}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuLabel>保存されたビュー</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* デフォルトビュー */}
          {defaultViews.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className="flex items-center justify-between"
            >
              <span>{view.name}</span>
              {activeViewId === view.id && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}

          {/* カスタムビュー */}
          {customViews.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>カスタムビュー</DropdownMenuLabel>
              {customViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex-1 truncate">{view.name}</span>
                  <div className="flex items-center gap-1">
                    {activeViewId === view.id && <Check className="size-4" />}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleEditView(view, e)}
                      className="size-6 shrink-0"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleDeleteView(view.id, e)}
                      className="hover:text-destructive size-6 shrink-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* 新規ビュー作成 */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateView} className="text-primary">
            <Plus className="size-4" />
            新しいビューを作成
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ビュー作成・編集ダイアログ */}
      <ViewSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        view={editingView}
        currentState={currentState}
      />
    </>
  )
}
