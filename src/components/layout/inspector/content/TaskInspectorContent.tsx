'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { CheckSquare, Clock, Flag, User, MessageSquare, Paperclip } from 'lucide-react'
import { background, text, border } from '@/config/theme/colors'

export function TaskInspectorContent() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* タスク詳細セクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            タスク詳細
          </h3>
          
          <div className="space-y-3">
            {/* タスク名 */}
            <div className={cn(
              'p-3 rounded-lg border',
              background.surface,
              border.subtle
            )}>
              <div className="flex items-start gap-3">
                <CheckSquare className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', text.primary)}>
                    新機能のUI設計
                  </p>
                  <p className={cn('text-xs mt-1', text.muted)}>
                    ユーザー体験を向上させる新しいインターface設計
                  </p>
                </div>
              </div>
            </div>

            {/* 期限と進捗 */}
            <div className={cn(
              'p-3 rounded-lg border',
              background.surface,
              border.subtle
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className={cn('text-sm font-medium', text.primary)}>
                    期限: 2024年9月15日
                  </p>
                  <p className={cn('text-xs', text.muted)}>
                    残り8日
                  </p>
                </div>
              </div>
              
              {/* 進捗バー */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={text.muted}>進捗</span>
                  <span className={text.primary}>75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* 優先度 */}
            <div className={cn(
              'p-3 rounded-lg border',
              background.surface,
              border.subtle
            )}>
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className={cn('text-sm font-medium', text.primary)}>
                    優先度: 高
                  </p>
                  <p className={cn('text-xs', text.muted)}>
                    今週中に完了必須
                  </p>
                </div>
              </div>
            </div>

            {/* 担当者 */}
            <div className={cn(
              'p-3 rounded-lg border',
              background.surface,
              border.subtle
            )}>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className={cn('text-sm font-medium', text.primary)}>
                    担当者: 田中太郎
                  </p>
                  <p className={cn('text-xs', text.muted)}>
                    UI/UXデザイナー
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* サブタスクセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            サブタスク
          </h3>
          
          <div className="space-y-2">
            {[
              { title: 'ワイヤーフレーム作成', completed: true },
              { title: 'デザインシステム適用', completed: true },
              { title: 'プロトタイプ作成', completed: false },
              { title: 'ユーザーテスト実施', completed: false }
            ].map((subtask, index) => (
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
                  <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center',
                    subtask.completed 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {subtask.completed && (
                      <CheckSquare className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <p className={cn(
                    'text-sm',
                    subtask.completed 
                      ? cn('line-through', text.muted)
                      : text.primary
                  )}>
                    {subtask.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* コメントセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            コメント
          </h3>
          
          <div className="space-y-3">
            {[
              { 
                author: '佐藤', 
                time: '2時間前', 
                content: 'デザインの方向性について確認したいことがあります。'
              },
              { 
                author: '田中', 
                time: '1時間前', 
                content: 'プロトタイプのレビューお疲れさまでした。修正版をアップしました。'
              }
            ].map((comment, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  background.surface,
                  border.subtle
                )}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs font-medium', text.primary)}>
                        {comment.author}
                      </span>
                      <span className={cn('text-xs', text.muted)}>
                        {comment.time}
                      </span>
                    </div>
                    <p className={cn('text-sm', text.primary)}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 添付ファイルセクション */}
        <div className="space-y-3">
          <h3 className={cn('text-sm font-semibold', text.primary)}>
            添付ファイル
          </h3>
          
          <div className="space-y-2">
            {[
              { name: 'wireframe_v2.sketch', size: '2.4MB', type: 'design' },
              { name: 'requirements.pdf', size: '1.1MB', type: 'document' }
            ].map((file, index) => (
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
                  <Paperclip className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', text.primary)}>
                      {file.name}
                    </p>
                    <p className={cn('text-xs', text.muted)}>
                      {file.size}
                    </p>
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