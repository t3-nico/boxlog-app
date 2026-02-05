import type { Meta, StoryObj } from '@storybook/react';
import { BarChart3, Calendar, CircleCheckBig, Clock } from 'lucide-react';

import { NavigationTabItem } from './NavigationTabItem';

/**
 * ナビゲーションタブ
 *
 * PageHeader中央に配置する水平タブナビゲーション。
 * Calendar / Plan / Record / Stats の4つのセクション間を切り替える。
 *
 * ## 特徴
 * - セグメンテッドコントロールスタイル（iOS準拠）
 * - アイコンのみ表示、ホバーでTooltip
 * - 選択中はピル型背景
 */
const meta = {
  title: 'Features/Navigation/NavigationTabs',
  component: NavigationTabItem,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {
    isActive: {
      control: 'boolean',
      description: '選択状態',
    },
    label: {
      control: 'text',
      description: 'Tooltipに表示されるラベル',
    },
    url: {
      control: 'text',
      description: '遷移先URL',
    },
  },
} satisfies Meta<typeof NavigationTabItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Calendar,
    label: 'カレンダー',
    url: '/ja/calendar',
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    icon: Calendar,
    label: 'カレンダー',
    url: '/ja/calendar',
    isActive: true,
  },
};

/**
 * 実際の使用パターン
 *
 * PageHeader中央に配置され、4つのメインセクションを切り替える。
 */
export const AllTabs: Story = {
  args: {
    icon: Calendar,
    label: 'カレンダー',
    url: '/ja/calendar',
    isActive: true,
  },
  render: function AllTabsStory() {
    const tabs = [
      { id: 'calendar', icon: Calendar, label: 'カレンダー', url: '/ja/calendar' },
      { id: 'plan', icon: CircleCheckBig, label: 'プラン', url: '/ja/plan' },
      { id: 'record', icon: Clock, label: '記録', url: '/ja/record' },
      { id: 'stats', icon: BarChart3, label: '統計', url: '/ja/stats' },
    ];
    const activeId = 'calendar';

    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-foreground mb-4 text-lg font-bold">NavigationTabs</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            PageHeader中央に配置するセグメンテッドコントロール。アイコンのみ表示し、ホバーでTooltipを表示。
          </p>
          <nav
            className="bg-surface-container ring-border flex h-10 items-center rounded-full p-1 ring-1 ring-inset"
            role="navigation"
            aria-label="Main navigation"
          >
            {tabs.map((tab) => (
              <NavigationTabItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                url={tab.url}
                isActive={tab.id === activeId}
              />
            ))}
          </nav>
        </section>

        <section>
          <h3 className="text-foreground mb-3 font-medium">各タブの役割</h3>
          <div className="bg-container space-y-3 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-state-active text-state-active-foreground flex size-8 items-center justify-center rounded-full">
                <Calendar className="size-4" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-medium">Calendar</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  週/日表示、時間帯でのスケジュール確認
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-state-active text-state-active-foreground flex size-8 items-center justify-center rounded-full">
                <CircleCheckBig className="size-4" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-medium">Plan</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  今日のタスク一覧、タイムボクシング
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-state-active text-state-active-foreground flex size-8 items-center justify-center rounded-full">
                <Clock className="size-4" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-medium">Record</span>
                <span className="text-muted-foreground ml-2 text-sm">時間記録、実績管理</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-state-active text-state-active-foreground flex size-8 items-center justify-center rounded-full">
                <BarChart3 className="size-4" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-medium">Stats</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  統計・分析、時間の使い方を可視化
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-foreground mb-3 font-medium">状態比較</h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <nav
                className="bg-surface-container ring-border mb-2 flex h-10 items-center rounded-full p-1 ring-1 ring-inset"
                role="navigation"
              >
                <NavigationTabItem
                  icon={Calendar}
                  label="カレンダー"
                  url="/ja/calendar"
                  isActive={true}
                />
              </nav>
              <p className="text-muted-foreground text-xs">Active</p>
            </div>
            <div className="text-center">
              <nav
                className="bg-surface-container ring-border mb-2 flex h-10 items-center rounded-full p-1 ring-1 ring-inset"
                role="navigation"
              >
                <NavigationTabItem
                  icon={Calendar}
                  label="カレンダー"
                  url="/ja/calendar"
                  isActive={false}
                />
              </nav>
              <p className="text-muted-foreground text-xs">Inactive</p>
            </div>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};
