import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

/**
 * RadioGroup - ラジオボタングループ（単一選択）
 *
 * ## 使用コンポーネント
 *
 * | コンポーネント | 用途 |
 * |----------------|------|
 * | RadioGroup | コンテナ（value, onValueChange） |
 * | RadioGroupItem | 各選択肢（value, id） |
 * | Label/label | クリック領域（htmlFor で紐付け） |
 *
 * ## RadioGroup vs Select
 *
 * | 観点 | RadioGroup | Select |
 * |------|------------|--------|
 * | 選択肢数 | 2-4個に適切 | 5個以上に適切 |
 * | 一覧性 | 全選択肢が常に見える | 開かないと見えない |
 * | スペース | 場所を取る | コンパクト |
 * | 推奨 | ダイアログ内、設定画面 | ツールバー、フォーム |
 *
 * ## 使い分けルール（Material Design準拠）
 *
 * - **2-4個**: RadioGroup（全部見せて比較させる）
 * - **5個以上**: Select（省スペース優先）
 * - **ツールバー**: Select（コンパクトさ優先）
 * - **確認ダイアログ**: RadioGroup（明示的な選択）
 */
const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [value1, setValue1] = useState('this');
    const [value2, setValue2] = useState('');

    const scopeOptions = [
      { value: 'this', label: 'このイベントのみ' },
      { value: 'thisAndFuture', label: 'このイベント以降すべて' },
      { value: 'all', label: 'すべてのイベント' },
    ];

    const tagOptions = [
      { value: 'tag-1', label: '仕事', color: '#3B82F6' },
      { value: 'tag-2', label: 'プライベート', color: '#22C55E' },
      { value: 'tag-3', label: '学習', color: '#F59E0B' },
    ];

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">RadioGroup</h1>
        <p className="text-muted-foreground mb-8">ラジオボタングループ（単一選択）</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">基本リスト（縦並び）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              RecurringEditConfirmDialog.tsx で使用。繰り返し編集のスコープ選択。
            </p>
            <RadioGroup value={value1} onValueChange={setValue1} className="space-y-2">
              {scopeOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`scope-${option.value}`}
                  className="flex cursor-pointer items-center gap-4"
                >
                  <RadioGroupItem value={option.value} id={`scope-${option.value}`} />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">カード内リスト</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              TagMergeDialog.tsx で使用。マージ先タグの選択。
            </p>
            <div className="border-border max-h-60 overflow-y-auto rounded-2xl border">
              <RadioGroup value={value2} onValueChange={setValue2} className="p-2">
                {tagOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`tag-${option.value}`}
                    className={`hover:bg-state-hover flex cursor-pointer items-center gap-4 rounded-lg px-4 py-2 transition-colors ${
                      value2 === option.value ? 'bg-state-selected' : ''
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`tag-${option.value}`}
                      className="shrink-0"
                    />
                    <span className="shrink-0 font-normal" style={{ color: option.color }}>
                      #
                    </span>
                    <span className="flex-1 truncate text-sm">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>RecurringEditConfirmDialog.tsx - 繰り返し編集スコープ</li>
              <li>TagMergeDialog.tsx - マージ先タグ選択</li>
              <li>RecurrenceDialog.tsx - 繰り返し設定</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>RadioGroup - コンテナ（value, onValueChange）</li>
                <li>RadioGroupItem - 各選択肢（value, id）</li>
                <li>Label / label - クリック対象（htmlFor で紐付け）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
