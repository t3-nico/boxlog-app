'use client'

import { CheckSquare, Clock, Flag, MessageSquare, Paperclip, User } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export const TaskInspectorContent = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* タスク詳細セクション */}
        <div className="space-y-3">
          <h3 className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-100')}>タスク詳細</h3>

          <div className="space-y-3">
            {/* タスク名 */}
            <div className={cn('rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800')}>
              <div className="flex items-start gap-3">
                <CheckSquare className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className={cn('text-base font-medium text-neutral-900 dark:text-neutral-100')}>新機能のUI設計</p>
                  <p className={cn('text-xs mt-1 text-neutral-600 dark:text-neutral-400')}>
                    ユーザー体験を向上させる新しいインターface設計
                  </p>
                </div>
              </div>
            </div>

            {/* 期限と進捗 */}
            <div className={cn('rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800')}>
              <div className="mb-3 flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className={cn('text-base font-medium text-neutral-900 dark:text-neutral-100')}>期限: 2024年9月15日</p>
                  <p className={cn('text-xs text-neutral-600 dark:text-neutral-400')}>残り8日</p>
                </div>
              </div>

              {/* 進捗バー */}
              <div className="space-y-2">
                <div className={cn('flex justify-between text-xs')}>
                  <span className="text-neutral-600 dark:text-neutral-400">進捗</span>
                  <span className="text-neutral-900 dark:text-neutral-100">75%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* 優先度 */}
            <div className={cn('rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800')}>
              <div className="flex items-center gap-3">
                <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className={cn('text-base font-medium text-neutral-900 dark:text-neutral-100')}>優先度: 高</p>
                  <p className={cn('text-xs text-neutral-600 dark:text-neutral-400')}>今週中に完了必須</p>
                </div>
              </div>
            </div>

            {/* 担当者 */}
            <div className={cn('rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800')}>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className={cn('text-base font-medium text-neutral-900 dark:text-neutral-100')}>担当者: 田中太郎</p>
                  <p className={cn('text-xs text-neutral-600 dark:text-neutral-400')}>UI/UXデザイナー</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* サブタスクセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-100')}>サブタスク</h3>

          <div className="space-y-2">
            {[
              { title: 'ワイヤーフレーム作成', completed: true },
              { title: 'デザインシステム適用', completed: true },
              { title: 'プロトタイプ作成', completed: false },
              { title: 'ユーザーテスト実施', completed: false },
            ].map((subtask, _index) => (
              <div
                key={subtask.title}
                className={cn(
                  'rounded-lg border border-neutral-300 dark:border-neutral-700 p-3',
                  'bg-white dark:bg-neutral-800',
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border-2',
                      subtask.completed ? 'border-green-600 bg-green-600' : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {subtask.completed ? <CheckSquare className="h-3 w-3 text-white" /> : null}
                  </div>
                  <p
                    className={cn(
                      'text-base',
                      subtask.completed
                        ? cn('line-through text-neutral-600 dark:text-neutral-400')
                        : 'text-neutral-900 dark:text-neutral-100'
                    )}
                  >
                    {subtask.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コメントセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-100')}>コメント</h3>

          <div className="space-y-3">
            {[
              {
                author: '佐藤',
                time: '2時間前',
                content: 'デザインの方向性について確認したいことがあります。',
              },
              {
                author: '田中',
                time: '1時間前',
                content: 'プロトタイプのレビューお疲れさまでした。修正版をアップしました。',
              },
            ].map((comment, _index) => (
              <div
                key={`${comment.author}-${comment.time}`}
                className={cn('rounded-lg border border-neutral-300 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800')}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn('text-xs font-medium text-neutral-900 dark:text-neutral-100')}>{comment.author}</span>
                      <span className={cn('text-xs text-neutral-600 dark:text-neutral-400')}>{comment.time}</span>
                    </div>
                    <p className={cn('text-base text-neutral-900 dark:text-neutral-100')}>{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 添付ファイルセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-100')}>添付ファイル</h3>

          <div className="space-y-2">
            {[
              { name: 'wireframe_v2.sketch', size: '2.4MB', type: 'design' },
              { name: 'requirements.pdf', size: '1.1MB', type: 'document' },
            ].map((file, _index) => (
              <div
                key={file.name}
                className={cn(
                  'rounded-lg border border-neutral-300 dark:border-neutral-700 p-3',
                  'bg-white dark:bg-neutral-800',
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className={cn('text-base font-medium text-neutral-900 dark:text-neutral-100')}>{file.name}</p>
                    <p className={cn('text-xs text-neutral-600 dark:text-neutral-400')}>{file.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
