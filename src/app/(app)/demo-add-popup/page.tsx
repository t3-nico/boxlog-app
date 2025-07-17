'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AddPopup, 
  FloatingActionButton,
  useAddPopup,
  useAddPopupKeyboardShortcuts,
  useContextAwarePopup,
  CreateContextData 
} from '@/components/add-popup'

export default function AddPopupDemoPage() {
  const { 
    isOpen, 
    activeTab, 
    openPopup, 
    closePopup, 
    openSchedulePopup, 
    openRecordPopup 
  } = useAddPopup()
  
  const { openFromCalendar, openFromBoard, openFromTable } = useContextAwarePopup()
  
  // Enable keyboard shortcuts
  const { handleKeyDown } = useAddPopupKeyboardShortcuts()
  
  // Add keyboard event listener
  useState(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e)
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  })

  const contextExamples: Array<{ 
    label: string
    description: string
    context: CreateContextData
    action: () => void
  }> = [
    {
      label: 'カレンダーから（明日）',
      description: '明日の予定を作成',
      context: { 
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'Todo' 
      },
      action: () => openFromCalendar(new Date(Date.now() + 24 * 60 * 60 * 1000))
    },
    {
      label: 'ボードから（完了）',
      description: '完了したタスクを記録',
      context: { 
        status: 'Done' 
      },
      action: () => openFromBoard('Done')
    },
    {
      label: 'ボードから（進行中）',
      description: '進行中のタスクを作成',
      context: { 
        status: 'In Progress' 
      },
      action: () => openFromBoard('In Progress')
    },
    {
      label: 'テーブルから（高優先度）',
      description: '高優先度のタスクを作成',
      context: { 
        priority: 'High',
        tags: ['urgent', 'client'] 
      },
      action: () => openFromTable({ priority: 'High', tags: ['urgent', 'client'] })
    }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Popup Demo
          </h1>
          <p className="text-muted-foreground">
            予定と記録の作成ポップアップのデモンストレーション
          </p>
        </div>

        {/* Current State */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">現在の状態</h2>
          <div className="flex items-center gap-4">
            <Badge variant={isOpen ? "default" : "secondary"}>
              ポップアップ: {isOpen ? '開いている' : '閉じている'}
            </Badge>
            <Badge variant="outline">
              アクティブタブ: {activeTab === 'schedule' ? '予定' : '記録'}
            </Badge>
          </div>
        </div>

        {/* Basic Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">基本操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => openSchedulePopup()}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <span className="font-medium">予定タブで開く</span>
              <span className="text-xs opacity-70">新しい予定を作成</span>
            </Button>
            
            <Button 
              onClick={() => openRecordPopup()}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <span className="font-medium">記録タブで開く</span>
              <span className="text-xs opacity-70">完了した作業を記録</span>
            </Button>
            
            <Button 
              onClick={() => openPopup()}
              variant="secondary"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <span className="font-medium">デフォルトで開く</span>
              <span className="text-xs opacity-70">自動でタブ選択</span>
            </Button>
          </div>
        </div>

        {/* Context Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">コンテキスト連携</h2>
          <p className="text-sm text-muted-foreground mb-4">
            各ビューからの呼び出しをシミュレート（スマートタブ選択を含む）
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contextExamples.map((example, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{example.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Context:</p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    {JSON.stringify(example.context, null, 2)}
                  </code>
                </div>
                
                <Button 
                  onClick={example.action}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  実行
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">キーボードショートカット</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">Ctrl+N</Badge>
                <span className="text-sm">予定タブで開く</span>
              </div>
              <p className="text-xs text-muted-foreground">
                新しい予定を素早く作成
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">Ctrl+Shift+N</Badge>
                <span className="text-sm">記録タブで開く</span>
              </div>
              <p className="text-xs text-muted-foreground">
                完了した作業を素早く記録
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                スマートタブ選択
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                コンテキストに基づいて適切なタブを自動選択
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Framer Motion
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                滑らかなアニメーションとトランジション
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                キーボード対応
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                効率的なキーボードショートカット
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="p-6 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">実装メモ</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• shadcn/ui Dialog + custom Tabs で構築</li>
            <li>• Zustand でグローバル状態管理</li>
            <li>• TypeScript による型安全性</li>
            <li>• Framer Motion によるアニメーション</li>
            <li>• レスポンシブデザイン対応</li>
            <li>• ダークモード完全対応</li>
          </ul>
        </div>
      </div>

      {/* Add Popup Component */}
      <AddPopup 
        open={isOpen} 
        onOpenChange={(open) => open ? openPopup() : closePopup()}
        defaultTab={activeTab}
      />

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => openPopup()}
      />
    </div>
  )
}