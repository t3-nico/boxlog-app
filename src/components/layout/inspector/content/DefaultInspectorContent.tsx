'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { Info, Settings, HelpCircle, Zap, BarChart3, FileText } from 'lucide-react'
import { background, text, border } from '@/config/theme/colors'

export function DefaultInspectorContent() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* ページ情報セクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            ページ情報
          </h3>
          
          <div className={cn(
            'p-4 rounded-lg border',
            background.surface,
            border.subtle
          )}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={cn('text-sm font-medium', text.primary)}>
                  BoxLog Dashboard
                </p>
                <p className={cn('text-xs mt-1', text.muted)}>
                  右側のInspectorパネルでは、選択したアイテムの詳細情報や関連する操作を確認できます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクションセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            クイックアクション
          </h3>
          
          <div className="space-y-2">
            {[
              { 
                icon: Zap, 
                title: 'ショートカット', 
                description: 'よく使う機能への素早いアクセス',
                color: 'text-yellow-600 dark:text-yellow-400'
              },
              { 
                icon: BarChart3, 
                title: '統計情報', 
                description: '現在の使用状況とパフォーマンス',
                color: 'text-green-600 dark:text-green-400'
              },
              { 
                icon: Settings, 
                title: '設定', 
                description: 'アプリケーションの個人設定',
                color: 'text-gray-600 dark:text-gray-400'
              },
              { 
                icon: HelpCircle, 
                title: 'ヘルプ', 
                description: 'サポートとドキュメント',
                color: 'text-purple-600 dark:text-purple-400'
              }
            ].map((action, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  background.surface,
                  border.subtle,
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <action.icon className={cn('w-4 h-4', action.color)} />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', text.primary)}>
                      {action.title}
                    </p>
                    <p className={cn('text-xs', text.muted)}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近のアクティビティセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            最近のアクティビティ
          </h3>
          
          <div className="space-y-2">
            {[
              {
                action: 'タスクを作成',
                item: '新機能のUI設計',
                time: '5分前',
                type: 'create'
              },
              {
                action: 'イベントを更新',
                item: '週次ミーティング',
                time: '15分前',
                type: 'update'
              },
              {
                action: 'ファイルをアップロード',
                item: 'requirements.pdf',
                time: '1時間前',
                type: 'upload'
              }
            ].map((activity, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  background.surface,
                  border.subtle
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'update' ? 'bg-blue-500' :
                    'bg-orange-500'
                  )} />
                  <div className="flex-1">
                    <p className={cn('text-sm', text.primary)}>
                      <span className={text.muted}>{activity.action}</span>
                      {' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className={cn('text-xs mt-1', text.muted)}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ヒントセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            ヒント
          </h3>
          
          <div className={cn(
            'p-4 rounded-lg border',
            'bg-blue-50 dark:bg-blue-950/30',
            'border-blue-200 dark:border-blue-800'
          )}>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={cn('text-sm font-medium text-blue-900 dark:text-blue-100')}>
                  Inspectorの活用法
                </p>
                <p className={cn('text-xs mt-1 text-blue-700 dark:text-blue-300')}>
                  カレンダーのイベントやタスクを選択すると、ここに詳細情報が表示されます。効率的な作業のために活用してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}