import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { CompactDateNavigator, DateNavigator } from './DateNavigator';
import { HeaderActions } from './HeaderActions';
import { PanelSwitcher } from './PanelSwitcher';
import { ViewSwitcher } from './ViewSwitcher';

import type { PanelType } from './PanelSwitcher';
import type { ViewOption } from './ViewSwitcher';

/** カレンダーヘッダーのサブコンポーネント（ViewSwitcher, DateNavigator, HeaderActions, PanelSwitcher）。 */
const meta = {
  title: 'Features/Calendar/Header',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

const viewOptions: ViewOption[] = [
  { value: 'day', label: 'Day', shortcut: 'D' },
  { value: '3day', label: '3 Days', shortcut: '3' },
  { value: 'week', label: 'Week', shortcut: 'W' },
  { value: '5day', label: '5 Days', shortcut: '5' },
];

function ViewSwitcherExample() {
  const [current, setCurrent] = useState('day');
  return <ViewSwitcher options={viewOptions} currentView={current} onChange={setCurrent} />;
}

function PanelSwitcherExample() {
  const [panel, setPanel] = useState<PanelType>('none');
  return <PanelSwitcher currentPanel={panel} onChange={setPanel} />;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** ビュー切替ドロップダウン。キーボードショートカット対応（D, 3, W, 5）。 */
export const ViewSwitcherDefault: Story = {
  render: () => <ViewSwitcherExample />,
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
