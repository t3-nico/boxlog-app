import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/**
 * Select - ドロップダウン選択
 *
 * ## 使用コンポーネント
 *
 * | コンポーネント | 用途 |
 * |----------------|------|
 * | Select | ルート（value, onValueChange） |
 * | SelectTrigger | トリガーボタン |
 * | SelectValue | 選択値表示 |
 * | SelectContent | ドロップダウンコンテンツ |
 * | SelectItem | 選択肢アイテム |
 *
 * ## Select vs DropdownMenu vs RadioGroup
 *
 * | 観点 | Select | DropdownMenu | RadioGroup |
 * |------|--------|--------------|------------|
 * | 用途 | 値を選ぶ | アクション実行 | 値を選ぶ |
 * | 選択肢数 | 5個以上 | 任意 | 2-4個 |
 * | 一覧性 | 開くまで見えない | 開くまで見えない | 常に見える |
 * | 推奨 | ツールバー、フォーム | メニュー | ダイアログ、設定 |
 *
 * ## 未使用コンポーネント
 *
 * 以下は現在アプリで未使用（必要時に追加）:
 * - SelectGroup / SelectLabel - グループ化
 * - SelectSeparator - 区切り線
 */
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

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [value, setValue] = useState('daily');

    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Select - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold">期間セレクター</h2>
            <p className="text-muted-foreground mb-4 text-sm">
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
            <p className="text-muted-foreground mt-2 text-sm">選択中: {value}</p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <ul className="text-muted-foreground list-inside list-disc text-sm">
              <li>
                <code>Select</code> - ルート（value, onValueChange）
              </li>
              <li>
                <code>SelectTrigger</code> - トリガーボタン（className for size）
              </li>
              <li>
                <code>SelectValue</code> - 選択値表示
              </li>
              <li>
                <code>SelectContent</code> - ドロップダウン
              </li>
              <li>
                <code>SelectItem</code> - 選択肢
              </li>
            </ul>
          </section>

          <section className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
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
