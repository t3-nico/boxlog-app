import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { DatePickerPopover } from './date-picker-popover';

const meta = {
  title: 'Components/DatePickerPopover',
  component: DatePickerPopover,
  tags: ['autodocs'],
  parameters: {},
  argTypes: {
    showIcon: {
      control: 'boolean',
      description: 'アイコンを表示するか',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePickerPopover>;

export default meta;
type Story = StoryObj;

/**
 * 基本形（showIcon + placeholder）。
 * 実使用: ScheduleRow, RecordCreateForm（常にshowIcon + placeholder指定）
 */
export const Default: Story = {
  render: () => {
    function Demo() {
      const [date, setDate] = useState<Date | undefined>();
      return (
        <div className="space-y-2">
          <DatePickerPopover
            selectedDate={date}
            onDateChange={setDate}
            showIcon
            placeholder="日付..."
          />
          <p className="text-muted-foreground text-xs">
            値: {date ? date.toLocaleDateString('ja-JP') : '(未選択)'}
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * 日付選択済みの状態。
 */
export const WithSelectedDate: Story = {
  render: () => {
    function Demo() {
      const [date, setDate] = useState<Date | undefined>(new Date());
      return (
        <div className="space-y-2">
          <DatePickerPopover
            selectedDate={date}
            onDateChange={setDate}
            showIcon
            placeholder="日付..."
          />
          <p className="text-muted-foreground text-xs">
            値: {date ? date.toLocaleDateString('ja-JP') : '(未選択)'}
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};
