'use client'

import { SidebarTabLayout } from '@/features/navigation/components/sidebar/SidebarTabLayout'
import type { SidebarTab } from '@/features/navigation/components/sidebar/types'

/**
 * CalendarSidebar - カレンダーページ専用サイドバー
 *
 * **タブ構成**:
 * - Events: イベント一覧（時系列）
 * - Tasks: タスク一覧（ステータス別）
 * - View: フィルター・DatePicker・表示設定
 *
 * **TODO**:
 * - EventsList コンポーネント実装
 * - TasksList コンポーネント実装
 * - ViewSettings コンポーネント実装
 */
export function CalendarSidebar() {
  const tabs: SidebarTab[] = [
    {
      value: 'events',
      label: 'Events',
      content: (
        <div className="flex flex-col gap-4 p-4">
          <h3 className="text-sm font-semibold">Events Tab</h3>
          <p className="text-muted-foreground text-sm">イベント一覧がここに表示されます</p>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">今日のイベント</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
              <li>Meeting 10:00 - 11:00</li>
              <li>Lunch 12:00 - 13:00</li>
              <li>Review 14:00 - 15:00</li>
            </ul>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">明日のイベント</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
              <li>Standup 09:00 - 09:30</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      value: 'tasks',
      label: 'Tasks',
      content: (
        <div className="flex flex-col gap-4 p-4">
          <h3 className="text-sm font-semibold">Tasks Tab</h3>
          <p className="text-muted-foreground text-sm">タスク一覧がここに表示されます</p>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">期限：今日</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
              <li>タスク1 - 進行中</li>
              <li>タスク2 - 未着手</li>
            </ul>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">期限：明日</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
              <li>タスク3 - 未着手</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      value: 'view',
      label: 'View',
      content: (
        <div className="flex flex-col gap-4 p-4">
          <h3 className="text-sm font-semibold">View Tab</h3>
          <p className="text-muted-foreground text-sm">表示設定がここに表示されます</p>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">DatePicker</p>
            <p className="text-muted-foreground mt-2 text-xs">カレンダーの月選択ウィジェット</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">Filters</p>
            <p className="text-muted-foreground mt-2 text-xs">タグ・カレンダーフィルター</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs">View Options</p>
            <p className="text-muted-foreground mt-2 text-xs">Day / Week / Month 切り替え</p>
          </div>
        </div>
      ),
    },
  ]

  return <SidebarTabLayout title="Calendar" tabs={tabs} defaultTab="events" />
}
