import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ClockTimePicker } from './clock-time-picker';

const meta = {
  title: 'Primitives/ClockTimePicker',
  component: ClockTimePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
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
    quickActions: {
      control: 'select',
      options: [undefined, 'start', 'end'],
      description: 'クイックアクション（start: 現在時刻ベース, end: プリセットDuration）',
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

/** 開始時刻 + クイックアクション（Now / +30m / +1h）。実使用: TimeRow の開始時刻 */
export const StartTime: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return <ClockTimePicker value={value} onChange={setValue} showIcon quickActions="start" />;
    }
    return <Demo />;
  },
};

/** 終了時刻 + クイックアクション（30m / 1h / 1.5h / 2h）。実使用: TimeRow の終了時刻 */
export const EndTime: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <ClockTimePicker
          value={value}
          onChange={setValue}
          showIcon
          iconType="flag"
          minTime="09:00"
          showDurationInMenu
          quickActions="end"
        />
      );
    }
    return <Demo />;
  },
};

/** エラー状態。時刻コンフリクト時のバリデーション表示。実使用: hasError={timeConflictError} */
export const ErrorState: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('10:00');
      return <ClockTimePicker value={value} onChange={setValue} showIcon hasError />;
    }
    return <Demo />;
  },
};

/** 無効状態。実使用: ScheduleRow の disabled */
export const Disabled: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('12:00');
      return <ClockTimePicker value={value} onChange={setValue} showIcon disabled />;
    }
    return <Demo />;
  },
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => {
    function AllPatternsDemo() {
      const [startValue, setStartValue] = useState('');
      const [endValue, setEndValue] = useState('');
      const [errorValue, setErrorValue] = useState('10:00');
      const [disabledValue, setDisabledValue] = useState('12:00');

      return (
        <div className="flex flex-col items-start gap-6">
          <ClockTimePicker
            value={startValue}
            onChange={setStartValue}
            showIcon
            quickActions="start"
          />
          <ClockTimePicker
            value={endValue}
            onChange={setEndValue}
            showIcon
            iconType="flag"
            minTime="09:00"
            showDurationInMenu
            quickActions="end"
          />
          <ClockTimePicker value={errorValue} onChange={setErrorValue} showIcon hasError />
          <ClockTimePicker value={disabledValue} onChange={setDisabledValue} showIcon disabled />
        </div>
      );
    }
    return <AllPatternsDemo />;
  },
};
