import type { Meta, StoryObj } from '@storybook/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

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
    const [chipValue, setChipValue] = useState('daily');
    const [listValue, setListValue] = useState('light');

    const periodOptions = [
      { value: 'daily', label: '日' },
      { value: 'weekly', label: '週' },
      { value: 'monthly', label: '月' },
    ];

    const themeOptions = [
      { value: 'light', label: 'ライト' },
      { value: 'dark', label: 'ダーク' },
      { value: 'system', label: 'システム' },
    ];

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">RadioGroup</h1>
        <p className="text-muted-foreground mb-8">ラジオボタングループ（単一選択）</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">チップスタイル（横並び）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              TableNavigation.tsx で使用。RadioGroupItemはsr-onlyで非表示、Labelがクリック対象。
            </p>
            <RadioGroup value={chipValue} onValueChange={setChipValue}>
              <div className="flex flex-wrap gap-2">
                {periodOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`chip-${option.value}`}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      chipValue === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`chip-${option.value}`}
                      className="sr-only"
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">リストスタイル（Apple Settings風）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              MobileSettingsRadioGroup.tsx で使用。選択中はCheckアイコンを表示。
            </p>
            <RadioGroup value={listValue} onValueChange={setListValue}>
              <div className="border-border bg-card w-64 rounded-lg border">
                {themeOptions.map((option, index) => (
                  <Label
                    key={option.value}
                    htmlFor={`list-${option.value}`}
                    className={`hover:bg-muted flex cursor-pointer items-center justify-between px-4 py-4 text-sm transition-colors ${
                      index !== themeOptions.length - 1 ? 'border-border border-b' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                    <RadioGroupItem
                      value={option.value}
                      id={`list-${option.value}`}
                      className="sr-only"
                    />
                    {listValue === option.value && <Check className="text-primary size-4" />}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>TableNavigation.tsx - 期間切り替え（日/週/月）</li>
              <li>MobileSettingsRadioGroup.tsx - 設定選択</li>
              <li>TagMergeDialog.tsx - マージ先選択</li>
              <li>RecurringEditConfirmDialog.tsx - 繰り返し編集確認</li>
              <li>RecurrenceDialog.tsx - 繰り返し設定</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">実装パターン</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>RadioGroupItem は sr-only で非表示</li>
                <li>Label がクリック対象（視覚的なUI）</li>
                <li>選択状態は value で管理（条件分岐でスタイル変更）</li>
                <li>リストスタイルでは Check アイコンを表示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
