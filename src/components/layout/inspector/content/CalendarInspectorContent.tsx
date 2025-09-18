'use client'

import { Calendar, Clock, MapPin, Tag, Users } from 'lucide-react'

import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { typography } from '@/config/theme'
import { border, colors, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

export const CalendarInspectorContent = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* イベント詳細セクション */}
        <div className="space-y-3">
          <h2 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>イベント詳細</h2>

          <div className="space-y-3">
            {/* イベント名 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>週次ミーティング</p>
                  <p className={cn(typography.body.xs, 'mt-1', text.muted)}>チーム全体での進捗共有とタスク確認</p>
                </div>
              </div>
            </div>

            {/* 時間情報 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>2024年9月7日（土）</p>
                  <p className={cn(typography.body.xs, text.muted)}>14:00 - 15:30 (1時間30分)</p>
                </div>
              </div>
            </div>

            {/* 場所 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>会議室A</p>
                  <p className={cn(typography.body.xs, text.muted)}>オンライン参加も可能</p>
                </div>
              </div>
            </div>

            {/* 参加者 */}
            <div className={cn('rounded-lg border p-3', colors.background.surface, border.subtle)}>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>参加者 (5名)</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {['田中', '佐藤', '鈴木', '高橋', '中村'].map((name) => (
                      <span
                        key={name}
                        className={cn(
                          'rounded-full px-2 py-1',
                          typography.body.xs,
                          'bg-blue-100 dark:bg-blue-900/30',
                          'text-blue-700 dark:text-blue-300'
                        )}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 関連タスクセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>関連タスク</h3>

          <div className="space-y-2">
            {[
              { title: 'プレゼン資料作成', status: '進行中', priority: 'high' },
              { title: 'アジェンダ準備', status: '完了', priority: 'medium' },
              { title: '議事録テンプレート', status: '未着手', priority: 'low' },
            ].map((task, _index) => (
              <div
                key={task.title}
                className={cn(
                  'rounded-lg border p-3',
                  colors.background.surface,
                  border.subtle,
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn(typography.body.base, 'font-medium', text.primary)}>{task.title}</p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1',
                      typography.body.xs,
                      task.status === '完了'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : task.status === '進行中'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                    )}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* タグセクション */}
        <div className="space-y-3">
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>タグ</h3>

          <div className="flex flex-wrap gap-2">
            {['会議', 'チーム', '定期', '重要'].map((tag) => (
              <span
                key={tag}
                className={cn(
                  'rounded-full border px-3 py-1',
                  typography.body.xs,
                  colors.background.surface,
                  border.subtle,
                  text.muted,
                  'hover:bg-accent cursor-pointer transition-colors'
                )}
              >
                <Tag className="mr-1 inline h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
