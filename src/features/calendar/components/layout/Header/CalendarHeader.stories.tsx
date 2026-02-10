import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { CompactDateNavigator, DateNavigator } from './DateNavigator';
import { HeaderActions } from './HeaderActions';
import { PanelSwitcher } from './PanelSwitcher';
import { ViewSwitcher } from './ViewSwitcher';

import type { PanelType } from './PanelSwitcher';

/** カレンダーヘッダーのサブコンポーネント（ViewSwitcher, DateNavigator, HeaderActions, PanelSwitcher）。 */
const meta = {
  title: 'Features/Calendar/Header',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function ViewSwitcherExample({
  initial = 'week',
}: { initial?: import('@/features/calendar/types/calendar.types').CalendarViewType } = {}) {
  const [current, setCurrent] =
    useState<import('@/features/calendar/types/calendar.types').CalendarViewType>(initial);
  return <ViewSwitcher currentView={current} onChange={setCurrent} />;
}

function PanelSwitcherExample() {
  const [panel, setPanel] = useState<PanelType>('none');
  return <PanelSwitcher currentPanel={panel} onChange={setPanel} />;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** ビュー切替ドロップダウン。日/週/アジェンダ + 日数サブメニュー（2-9日）+ ビューの設定（週末・週数表示、一般設定リンク）。キーボードショートカット対応（D, W, A, 1-9, 0）。 */
export const ViewSwitcherDefault: Story = {
  render: () => <ViewSwitcherExample />,
};

/** 複数日ビュー選択時。ラベルが「3日間」のように表示される。 */
export const ViewSwitcherMultiDay: Story = {
  render: () => <ViewSwitcherExample initial="3day" />,
};

/** 日付ナビゲーション。Todayボタン + 前後矢印。 */
export const DateNavigatorDefault: Story = {
  render: () => <DateNavigator onNavigate={fn()} />,
};

/** コンパクトナビゲーション。矢印のみ。 */
export const DateNavigatorCompact: Story = {
  render: () => <CompactDateNavigator onNavigate={fn()} />,
};

/** ヘッダーアクションボタン群。設定・エクスポート・インポート・その他。 */
export const HeaderActionsAll: Story = {
  render: () => <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} />,
};

/** コンパクトモード。アイコンサイズが小さくなる。 */
export const HeaderActionsCompact: Story = {
  render: () => (
    <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} compact />
  ),
};

/** サイドパネル切替ドロップダウン。None/Plan/Record/Stats。 */
export const PanelSwitcherDefault: Story = {
  render: () => <PanelSwitcherExample />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <ViewSwitcherExample />
      <DateNavigator onNavigate={fn()} />
      <CompactDateNavigator onNavigate={fn()} />
      <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} />
      <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} compact />
      <PanelSwitcherExample />
    </div>
  ),
};
