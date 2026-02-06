import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/** Select - ドロップダウン選択。5個以上の選択肢に適切、2-4個はRadioGroupを使用。 */
const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultSelect() {
    const [value, setValue] = useState('daily');
    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-8 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">日</SelectItem>
          <SelectItem value="weekly">週</SelectItem>
          <SelectItem value="monthly">月</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

export const PeriodSelector: Story = {
  render: function PeriodSelect() {
    const [periodType, setPeriodType] = useState('daily');
    const [comparePeriod, setComparePeriod] = useState('previous');

    const periodOptions = [
      { value: 'daily', label: '日' },
      { value: 'weekly', label: '週' },
      { value: 'monthly', label: '月' },
    ];

    const compareOptions = [
      { value: 'previous', label: '前の期間' },
      { value: 'lastYear', label: '前年同期' },
      { value: 'none', label: '比較なし' },
    ];

    return (
      <div className="flex items-center gap-2">
        <Select value={periodType} onValueChange={setPeriodType}>
          <SelectTrigger className="h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={comparePeriod} onValueChange={setComparePeriod}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {compareOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [value, setValue] = useState('daily');

    return (
      <div className="flex flex-col items-start gap-6">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">日</SelectItem>
            <SelectItem value="weekly">週</SelectItem>
            <SelectItem value="monthly">月</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};
