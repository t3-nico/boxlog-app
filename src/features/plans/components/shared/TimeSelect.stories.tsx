import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { TimeSelect } from './TimeSelect';

/** TimeSelect - 時刻選択Combobox（Google Calendar風） */
const meta = {
  title: 'Features/Plans/TimeSelect',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function TimeSelectStory({
  initialValue = '',
  ...props
}: {
  initialValue?: string;
  disabled?: boolean;
  minTime?: string;
  hasError?: boolean;
  showIcon?: boolean;
  iconType?: 'clock' | 'flag';
  showDurationInMenu?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return <TimeSelect value={value} onChange={setValue} {...props} />;
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 値なしの初期状態 */
export const Default: Story = {
  render: () => <TimeSelectStory />,
};

/** 値が設定された状態 */
export const WithValue: Story = {
  render: () => <TimeSelectStory initialValue="10:00" />,
};

/** 無効化状態 */
export const Disabled: Story = {
  render: () => <TimeSelectStory initialValue="10:00" disabled />,
};

/** エラー状態（時間重複など） */
export const WithError: Story = {
  render: () => <TimeSelectStory initialValue="10:00" hasError />,
};

/** アイコン付き（clock） */
export const WithClockIcon: Story = {
  render: () => <TimeSelectStory initialValue="10:00" showIcon iconType="clock" />,
};

/** 終了時刻選択（duration表示付き） */
export const WithDuration: Story = {
  render: () => <TimeSelectStory initialValue="11:00" minTime="10:00" showDurationInMenu />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-end gap-6">
        <TimeSelectStory />
        <TimeSelectStory initialValue="10:00" />
        <TimeSelectStory initialValue="10:00" disabled />
      </div>

      <div className="flex items-end gap-6">
        <TimeSelectStory initialValue="10:00" hasError />
      </div>

      <div className="flex items-end gap-6">
        <TimeSelectStory initialValue="10:00" showIcon iconType="clock" />
        <TimeSelectStory initialValue="10:00" showIcon iconType="flag" />
      </div>

      <div className="flex items-end gap-4">
        <TimeSelectStory initialValue="10:00" showIcon iconType="clock" />
        <span className="text-muted-foreground pb-2">{'\u2192'}</span>
        <TimeSelectStory
          initialValue="11:30"
          showIcon
          iconType="flag"
          minTime="10:00"
          showDurationInMenu
        />
      </div>
    </div>
  ),
};
