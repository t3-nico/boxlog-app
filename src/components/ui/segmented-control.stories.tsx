import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';

import { SegmentedControl } from './segmented-control';

/** セグメントコントロール。2〜4個の選択肢を横並びで表示し1つを選択するUI。 */
const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    options: [
      { value: 'plan', label: 'Plan' },
      { value: 'record', label: 'Record' },
    ],
    value: 'plan',
    onChange: fn(),
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

function TwoOptionsExample() {
  const [value, setValue] = useState('plan');
  return (
    <SegmentedControl
      options={[
        { value: 'plan', label: 'Plan' },
        { value: 'record', label: 'Record' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

function ThreeOptionsExample() {
  const [value, setValue] = useState('plan');
  return (
    <SegmentedControl
      options={[
        { value: 'plan', label: 'Plan' },
        { value: 'record', label: 'Record' },
        { value: 'stats', label: 'Stats' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

function FourOptionsExample() {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      options={[
        { value: 'day', label: 'Day' },
        { value: '3day', label: '3 Days' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 2つの選択肢。実装例: Inspector Plan/Record切り替え */
export const Default: Story = {};

/** 2つの選択肢（インタラクティブ）。実装例: Inspector DraftModeHeader */
export const TwoOptions: Story = {
  render: () => <TwoOptionsExample />,
};

/** 3つの選択肢。実装例: サイドパネル PanelSwitcher */
export const ThreeOptions: Story = {
  render: () => <ThreeOptionsExample />,
};

/** 4つの選択肢（最大推奨数） */
export const FourOptions: Story = {
  render: () => <FourOptionsExample />,
};

// ---------------------------------------------------------------------------
// AllPatterns
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <TwoOptionsExample />
      <ThreeOptionsExample />
      <FourOptionsExample />
    </div>
  ),
};
