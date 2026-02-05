import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ClockTimePicker } from './clock-time-picker';

const meta = {
  title: 'Components/ClockTimePicker',
  component: ClockTimePicker,
  tags: ['autodocs'],
  parameters: {
  },
  argTypes: {
    value: {
      control: 'text',
      description: '時刻値（HH:MM形式）',
    },
    showIcon: {
      control: 'boolean',
      description: 'アイコンを表示するか',
    },
    iconType: {
      control: 'select',
      options: ['clock', 'flag'],
      description: 'アイコン種別',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    hasError: {
      control: 'boolean',
      description: 'エラー状態',
    },
    minTime: {
      control: 'text',
      description: '最小時刻',
    },
    showDurationInMenu: {
      control: 'boolean',
      description: 'ドロップダウン内にduration表示',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClockTimePicker>;

export default meta;
type Story = StoryObj;

/**
 * 開始時刻（showIcon + clock）。
 * 実使用: ScheduleRow, RecordCreateForm の開始時刻
 */
export const StartTime: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <div className="space-y-2">
          <ClockTimePicker value={value} onChange={setValue} showIcon />
          <p className="text-muted-foreground text-xs">値: {value || '(未選択)'}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * 終了時刻（flag + minTime + duration表示）。
 * 実使用: ScheduleRow, RecordCreateForm の終了時刻
 */
export const EndTime: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <div className="space-y-2">
          <ClockTimePicker
            value={value}
            onChange={setValue}
            showIcon
            iconType="flag"
            minTime="09:00"
            showDurationInMenu
          />
          <p className="text-muted-foreground text-xs">値: {value || '(未選択)'}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * エラー状態。時刻コンフリクト時のバリデーション表示。
 * 実使用: hasError={timeConflictError}
 */
export const ErrorState: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('10:00');
      return <ClockTimePicker value={value} onChange={setValue} showIcon hasError />;
    }
    return <Demo />;
  },
};

/**
 * 無効状態。
 * 実使用: ScheduleRow の disabled
 */
export const Disabled: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('12:00');
      return <ClockTimePicker value={value} onChange={setValue} showIcon disabled />;
    }
    return <Demo />;
  },
};
