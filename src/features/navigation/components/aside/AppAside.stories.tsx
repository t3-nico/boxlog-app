import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { AppAside } from './AppAside';
import type { AsideType } from './AsideSwitcher';

/** AppAside - アプリケーション共通アサイド */
const meta = {
  title: 'Features/Aside/Overview',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function AsideFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[500px] w-[320px] border">{children}</div>;
}

function InteractiveAsideStory() {
  const [asideType, setAsideType] = useState<AsideType>('plan');
  return (
    <AsideFrame>
      <AppAside asideType={asideType} onAsideChange={setAsideType} />
    </AsideFrame>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Planパネル（デフォルト） */
export const PlanPanel: Story = {
  render: () => (
    <AsideFrame>
      <AppAside asideType="plan" onAsideChange={fn()} />
    </AsideFrame>
  ),
};

/** Recordパネル（RecordListPanel） */
export const RecordPanel: Story = {
  render: () => (
    <AsideFrame>
      <AppAside asideType="record" onAsideChange={fn()} />
    </AsideFrame>
  ),
};

/** インタラクティブ（アサイド切替可能） */
export const Interactive: Story = {
  render: () => <InteractiveAsideStory />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <AsideFrame>
        <AppAside asideType="plan" onAsideChange={fn()} />
      </AsideFrame>

      <AsideFrame>
        <AppAside asideType="record" onAsideChange={fn()} />
      </AsideFrame>

      <AsideFrame>
        <AppAside asideType="chat" onAsideChange={fn()} />
      </AsideFrame>
    </div>
  ),
};
