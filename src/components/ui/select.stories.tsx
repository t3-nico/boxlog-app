import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
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

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [value, setValue] = useState('daily');

    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">Select - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">期間セレクター</h2>
            <p className="text-sm text-muted-foreground mb-4">
              stats-toolbarで使用されているパターン
            </p>
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
            <p className="text-sm text-muted-foreground mt-2">
              選択中: {value}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">コンポーネント構成</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li><code>Select</code> - ルート（value, onValueChange）</li>
              <li><code>SelectTrigger</code> - トリガーボタン（className for size）</li>
              <li><code>SelectValue</code> - 選択値表示</li>
              <li><code>SelectContent</code> - ドロップダウン</li>
              <li><code>SelectItem</code> - 選択肢</li>
            </ul>
          </section>

          <section className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> SelectGroup, SelectLabel, SelectSeparatorは現在未使用
            </p>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
