import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { ClockTimePicker } from './clock-time-picker';

const meta = {
  title: 'Components/ClockTimePicker',
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

/** 開始時刻（showIcon + clock）。実使用: ScheduleRow, RecordCreateForm の開始時刻 */
export const StartTime: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return <ClockTimePicker value={value} onChange={setValue} showIcon />;
    }
    return <Demo />;
  },
};

/** 終了時刻（flag + minTime + duration表示）。実使用: ScheduleRow, RecordCreateForm の終了時刻 */
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
          <ClockTimePicker value={startValue} onChange={setStartValue} showIcon />
          <ClockTimePicker
            value={endValue}
            onChange={setEndValue}
            showIcon
            iconType="flag"
            minTime="09:00"
            showDurationInMenu
          />
          <ClockTimePicker value={errorValue} onChange={setErrorValue} showIcon hasError />
          <ClockTimePicker value={disabledValue} onChange={setDisabledValue} showIcon disabled />
        </div>
      );
    }
    return <AllPatternsDemo />;
  },
};
