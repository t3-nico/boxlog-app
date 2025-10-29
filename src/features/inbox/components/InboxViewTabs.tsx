'use client'

import { Columns3, MoreHorizontal, Pencil, Plus, Table2, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useInboxViewStore } from '../stores/useInboxViewStore'
import type { InboxView, InboxViewType } from '../types/view'
import { SaveViewDialog } from './SaveViewDialog'

/**
 * Inbox View Tabs Component
 *
 * 複数のカスタマイズ可能なViewをタブで表示・切り替え
 *
 * @example
 * ```tsx
 * <InboxViewTabs />
 * ```
 */
export function InboxViewTabs() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string

  const { views, activeViewId, setActiveView, deleteView, createView } = useInboxViewStore()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [editingView, setEditingView] = useState<InboxView | null>(null)

  const activeView = views.find((v) => v.id === activeViewId)

  const handleViewChange = (viewId: string) => {
    const view = views.find((v) => v.id === viewId)
    if (!view) return

    setActiveView(viewId)
    router.push(`/${locale}/inbox?view=${viewId}`)
  }

  const handleSaveView = (name: string, type: InboxViewType) => {
    // TODO: 現在のフィルター状態を取得して保存
    // 今はダミーで空のフィルターを保存
    createView({
      name,
      type,
      filters: {},
    })
  }

  const handleDeleteView = (viewId: string) => {
    if (confirm('このViewを削除しますか？')) {
      deleteView(viewId)
    }
  }

  const getViewIcon = (type: InboxViewType) => {
    switch (type) {
      case 'board':
        return <Columns3 className="h-4 w-4" />
      case 'table':
        return <Table2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <div role="tablist" aria-label="Inbox view selector" className="flex h-10 items-center gap-0">
        {/* 既存のView */}
        {views.map((view) => (
          <div key={view.id} className="group relative flex items-center">
            <button
              role="tab"
              aria-selected={activeViewId === view.id}
              aria-controls="inbox-view-panel"
              onClick={() => handleViewChange(view.id)}
              className={`focus-visible:ring-ring flex h-10 items-center gap-2 rounded-none border-b-2 px-4 py-0 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                activeViewId === view.id
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:border-primary/50 hover:text-foreground border-transparent'
              }`}
            >
              {getViewIcon(view.type)}
              <span>{view.name}</span>
            </button>

            {/* デフォルトView以外は編集・削除メニュー表示 */}
            {!view.id.startsWith('default-') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 -right-2 h-6 w-6 -translate-y-1/2 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">View メニュー</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingView(view)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteView(view.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}

        {/* 新規View追加ボタン */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="text-muted-foreground hover:text-foreground ml-2 h-10 gap-2 border-b-2 border-transparent px-4"
        >
          <Plus className="h-4 w-4" />
          <span>新規View</span>
        </Button>
      </div>

      {/* View保存ダイアログ */}
      <SaveViewDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveView}
        currentFilters={{}}
      />

      {/* View編集ダイアログ（TODO: 実装予定） */}
      {editingView && (
        <div>
          {/* 編集ダイアログをここに実装 */}
          <p>Edit View: {editingView.name}</p>
        </div>
      )}
    </>
  )
}
