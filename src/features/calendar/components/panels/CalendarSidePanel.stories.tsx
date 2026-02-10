'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import type { PanelType } from '../layout/Header/PanelSwitcher';
import { CalendarSidePanel } from './CalendarSidePanel';

/** CalendarSidePanel - カレンダーサイドパネル */
const meta = {
  title: 'Features/Calendar/CalendarSidePanel',
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

function PanelFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[500px] w-[320px] border">{children}</div>;
}

function InteractivePanelStory() {
  const [panelType, setPanelType] = useState<PanelType>('plan');
  return (
    <PanelFrame>
      <CalendarSidePanel panelType={panelType} onPanelChange={setPanelType} />
    </PanelFrame>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Planパネル（デフォルト） */
export const PlanPanel: Story = {
  render: () => (
    <PanelFrame>
      <CalendarSidePanel panelType="plan" onPanelChange={fn()} />
    </PanelFrame>
  ),
};

/** Recordパネル（Coming soon） */
export const RecordPanel: Story = {
  render: () => (
    <PanelFrame>
      <CalendarSidePanel panelType="record" onPanelChange={fn()} />
    </PanelFrame>
  ),
};

/** インタラクティブ（パネル切替可能） */
export const Interactive: Story = {
  render: () => <InteractivePanelStory />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PanelFrame>
        <CalendarSidePanel panelType="plan" onPanelChange={fn()} />
      </PanelFrame>

      <PanelFrame>
        <CalendarSidePanel panelType="record" onPanelChange={fn()} />
      </PanelFrame>

      <PanelFrame>
        <CalendarSidePanel panelType="stats" onPanelChange={fn()} />
      </PanelFrame>
    </div>
  ),
};
