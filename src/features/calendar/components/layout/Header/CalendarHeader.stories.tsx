import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  AsideSwitcher,
  type AsideType,
} from '@/features/navigation/components/aside/AsideSwitcher';

import { CompactDateNavigator, DateNavigator } from './DateNavigator';
import { HeaderActions } from './HeaderActions';
import { ViewSwitcher } from './ViewSwitcher';

/** カレンダーヘッダーのサブコンポーネント（ViewSwitcher, DateNavigator, HeaderActions, AsideSwitcher）。 */
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

function AsideSwitcherExample() {
  const [aside, setAside] = useState<AsideType>('none');
  return <AsideSwitcher currentAside={aside} onChange={setAside} />;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** ビュー切替ドロップダウン。日/週/アジェンダ/タイムシート + 日数サブメニュー（2-9日）+ ビューの設定（週末・週数表示、密度切替[コンパクト/標準/ゆったり]、一般設定リンク）。キーボードショートカット対応（D, W, A, T, 1-9, 0）。 */
export const ViewSwitcherDefault: Story = {
  render: () => <ViewSwitcherExample />,
};

/** タイムシートビュー選択時。 */
export const ViewSwitcherTimesheet: Story = {
  render: () => <ViewSwitcherExample initial="timesheet" />,
};

/** 複数日ビュー選択時。ラベルが「3日間」のように表示される。 */
export const ViewSwitcherMultiDay: Story = {
  render: () => <ViewSwitcherExample initial="3day" />,
};

/** 日付ナビゲーション3パターン。Google Calendar風のグループ化ボタンバー（h-8 = sm, 32px）。 */
export const DateNavigatorPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Full: [&lt;] [Today] [&gt;]</p>
        <DateNavigator onNavigate={fn()} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Compact: [&lt;] [&gt;]（矢印のみ）</p>
        <CompactDateNavigator onNavigate={fn()} />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Today only: [Today]</p>
        <DateNavigator onNavigate={fn()} showArrows={false} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons.length).toBeGreaterThan(0);
    const firstButton = buttons[0];
    if (firstButton) {
      await userEvent.click(firstButton);
    }
  },
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

/** アサイド切替セグメントコントロール。None/Plan/Record/Stats。 */
export const AsideSwitcherDefault: Story = {
  render: () => <AsideSwitcherExample />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <ViewSwitcherExample />
      <div className="flex items-center gap-4">
        <DateNavigator onNavigate={fn()} />
        <CompactDateNavigator onNavigate={fn()} />
        <DateNavigator onNavigate={fn()} showArrows={false} />
      </div>
      <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} />
      <HeaderActions onSettings={fn()} onExport={fn()} onImport={fn()} onMore={fn()} compact />
      <AsideSwitcherExample />
    </div>
  ),
};
