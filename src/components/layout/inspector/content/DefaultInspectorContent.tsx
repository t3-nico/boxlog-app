'use client'

import { BarChart3, FileText, HelpCircle, Info, Settings, Zap } from 'lucide-react'

import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

export const DefaultInspectorContent = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* ページ情報セクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>ページ情報</h3>

          <div className={cn('rounded-lg border p-4', colors.background.surface, border.subtle)}>
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={cn(typography.body.base, 'font-medium', text.primary)}>BoxLog Dashboard</p>
                <p className={cn(typography.body.xs, 'mt-1', text.muted)}>
                  右側のInspectorパネルでは、選択したアイテムの詳細情報や関連する操作を確認できます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクションセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>クイックアクション</h3>

          <div className="space-y-2">
            {[
              {
                icon: Zap,
                title: 'ショートカット',
                description: 'よく使う機能への素早いアクセス',
                color: 'text-yellow-600 dark:text-yellow-400',
              },
              {
                icon: BarChart3,
                title: '統計情報',
                description: '現在の使用状況とパフォーマンス',
                color: 'text-green-600 dark:text-green-400',
              },
              {
                icon: Settings,
                title: '設定',
                description: 'アプリケーションの個人設定',
                color: 'text-gray-600 dark:text-gray-400',
              },
              {
                icon: HelpCircle,
                title: 'ヘルプ',
                description: 'サポートとドキュメント',
                color: 'text-purple-600 dark:text-purple-400',
              },
            ].map((action, _index) => (
              <div
                key={action.title}
                className={cn(
                  'rounded-lg border p-3',
                  colors.background.surface,
                  border.subtle,
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <action.icon className={cn('h-4 w-4', action.color)} />
                  <div className="flex-1">
                    <p className={cn(typography.body.base, 'font-medium', text.primary)}>{action.title}</p>
                    <p className={cn(typography.body.xs, text.muted)}>{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近のアクティビティセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>最近のアクティビティ</h3>

          <div className="space-y-2">
            {[
              {
                action: 'タスクを作成',
                item: '新機能のUI設計',
                time: '5分前',
                type: 'create',
              },
              {
                action: 'イベントを更新',
                item: '週次ミーティング',
                time: '15分前',
                type: 'update',
              },
              {
                action: 'ファイルをアップロード',
                item: 'requirements.pdf',
                time: '1時間前',
                type: 'upload',
              },
            ].map((activity, _index) => (
              <div
                key={`${activity.action}-${activity.item}-${activity.time}`}
                className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-2 h-2 w-2 rounded-full',
                      activity.type === 'create'
                        ? 'bg-green-500'
                        : activity.type === 'update'
                          ? 'bg-blue-500'
                          : 'bg-orange-500'
                    )}
                  />
                  <div className="flex-1">
                    <p className={cn(typography.body.base, text.primary)}>
                      <span className={text.muted}>{activity.action}</span>{' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className={cn(typography.body.xs, 'mt-1', text.muted)}>{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ヒントセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>ヒント</h3>

          <div
            className={cn(
              'rounded-lg border p-4',
              'bg-blue-50 dark:bg-blue-950/30',
              'border-blue-200 dark:border-blue-800'
            )}
          >
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={cn(typography.body.base, 'font-medium text-blue-900 dark:text-blue-100')}>
                  Inspectorの活用法
                </p>
                <p className={cn(typography.body.xs, 'mt-1 text-blue-700 dark:text-blue-300')}>
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
