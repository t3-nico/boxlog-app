'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, Layers, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const { views, activeViewId, setActiveView, deleteView, createView, updateView } = useInboxViewStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingViewId, setEditingViewId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const activeView = views.find((view) => view.id === activeViewId)

  // デフォルトビューとカスタムビューに分離
  const defaultViews = views.filter((view) => view.id.startsWith('default-'))
  const customViews = views.filter((view) => !view.id.startsWith('default-'))

  // 入力欄がマウントされたら自動フォーカス
  useEffect(() => {
    if (editingViewId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingViewId])

  // Notionスタイル：クリックで即座にビューを作成してタイトル入力状態にする
  const handleCreateView = () => {
    const newView = createView({
      name: '無題のビュー',
      filters: currentState?.filters || {},
      sorting: currentState?.sorting,
    })
    setEditingViewId(newView.id)
    setEditingName(newView.name)
  }

  // インライン編集開始
  const handleStartEdit = (view: InboxView, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingViewId(view.id)
    setEditingName(view.name)
  }

  // インライン編集確定
  const handleSaveEdit = (viewId: string) => {
    if (editingName.trim()) {
      updateView(viewId, { name: editingName.trim() })
    } else {
      // タイトルが空の場合は削除
      deleteView(viewId)
    }
    setEditingViewId(null)
    setEditingName('')
  }

  // インライン編集キャンセル
  const handleCancelEdit = (viewId: string) => {
    const view = views.find((v) => v.id === viewId)
    // 新規作成直後でタイトルが未入力の場合は削除
    if (view?.name === '無題のビュー' && !editingName.trim()) {
      deleteView(viewId)
    }
    setEditingViewId(null)
    setEditingName('')
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
          <Button variant="outline" size="sm">
            <Layers className="size-4" />
            {activeView?.name || 'ビューを選択'}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
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
                  onClick={() => {
                    if (editingViewId !== view.id) {
                      setActiveView(view.id)
                    }
                  }}
                  className="flex items-center justify-between gap-2"
                  onSelect={(e) => {
                    if (editingViewId === view.id) {
                      e.preventDefault()
                    }
                  }}
                >
                  {editingViewId === view.id ? (
                    <Input
                      ref={inputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(view.id)
                        } else if (e.key === 'Escape') {
                          handleCancelEdit(view.id)
                        }
                      }}
                      onBlur={() => handleSaveEdit(view.id)}
                      className="h-7 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate">{view.name}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {activeViewId === view.id && editingViewId !== view.id && <Check className="size-4 shrink-0" />}
                    {editingViewId === view.id ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelEdit(view.id)
                        }}
                        className="size-6 shrink-0"
                      >
                        <X className="size-3" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleStartEdit(view, e)}
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
                      </>
                    )}
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
      <ViewSettingsDialog open={dialogOpen} onOpenChange={setDialogOpen} view={undefined} currentState={currentState} />
    </>
  )
}
