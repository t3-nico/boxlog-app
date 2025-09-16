'use client'

import { CheckSquare, Clock, Flag, MessageSquare, Paperclip, User } from 'lucide-react'

import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { colors, typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

export const TaskInspectorContent = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* タスク詳細セクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>タスク詳細</h3>

          <div className="space-y-3">
            {/* タスク名 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-start gap-3">
                <CheckSquare className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>新機能のUI設計</p>
                  <p className={cn(typography.body.xs, 'mt-1', text.muted)}>
                    ユーザー体験を向上させる新しいインターface設計
                  </p>
                </div>
              </div>
            </div>

            {/* 期限と進捗 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="mb-3 flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>期限: 2024年9月15日</p>
                  <p className={cn(typography.body.xs, text.muted)}>残り8日</p>
                </div>
              </div>

              {/* 進捗バー */}
              <div className="space-y-2">
                <div className={cn('flex justify-between', typography.body.xs)}>
                  <span className={text.muted}>進捗</span>
                  <span className={text.primary}>75%</span>
                </div>
                <div className={`w-full ${colors.background.subtle} h-2 rounded-full`}>
                  <div className={`${colors.primary.DEFAULT} h-2 rounded-full`} style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* 優先度 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-center gap-3">
                <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>優先度: 高</p>
                  <p className={cn(typography.body.xs, text.muted)}>今週中に完了必須</p>
                </div>
              </div>
            </div>

            {/* 担当者 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>担当者: 田中太郎</p>
                  <p className={cn(typography.body.xs, text.muted)}>UI/UXデザイナー</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* サブタスクセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>サブタスク</h3>

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
                  'rounded-lg border p-3',
                  colors.background.surface,
                  border.subtle,
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
                    {subtask.completed && <CheckSquare className="h-3 w-3 text-white" />}
                  </div>
                  <p
                    className={cn(
                      typography.body.base,
                      subtask.completed ? cn('line-through', text.muted) : text.primary
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
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>コメント</h3>

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
                className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn(typography.body.xs, 'font-medium', text.primary)}>{comment.author}</span>
                      <span className={cn(typography.body.xs, text.muted)}>{comment.time}</span>
                    </div>
                    <p className={cn(typography.body.base, text.primary)}>{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 添付ファイルセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>添付ファイル</h3>

          <div className="space-y-2">
            {[
              { name: 'wireframe_v2.sketch', size: '2.4MB', type: 'design' },
              { name: 'requirements.pdf', size: '1.1MB', type: 'document' },
            ].map((file, _index) => (
              <div
                key={file.name}
                className={cn(
                  'rounded-lg border p-3',
                  colors.background.surface,
                  border.subtle,
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className={cn(typography.body.base, 'font-medium', text.primary)}>{file.name}</p>
                    <p className={cn(typography.body.xs, text.muted)}>{file.size}</p>
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
