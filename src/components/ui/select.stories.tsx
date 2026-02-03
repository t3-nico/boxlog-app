import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">オプション1</SelectItem>
        <SelectItem value="option2">オプション2</SelectItem>
        <SelectItem value="option3">オプション3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="fruit-select">フルーツ</Label>
      <Select>
        <SelectTrigger id="fruit-select" className="w-48">
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">りんご</SelectItem>
          <SelectItem value="banana">バナナ</SelectItem>
          <SelectItem value="orange">オレンジ</SelectItem>
          <SelectItem value="grape">ぶどう</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="タイムゾーン" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>アジア</SelectLabel>
          <SelectItem value="asia/tokyo">東京 (JST)</SelectItem>
          <SelectItem value="asia/seoul">ソウル (KST)</SelectItem>
          <SelectItem value="asia/shanghai">上海 (CST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>北米</SelectLabel>
          <SelectItem value="america/new_york">ニューヨーク (EST)</SelectItem>
          <SelectItem value="america/los_angeles">ロサンゼルス (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>ヨーロッパ</SelectLabel>
          <SelectItem value="europe/london">ロンドン (GMT)</SelectItem>
          <SelectItem value="europe/paris">パリ (CET)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <Select disabled>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="無効" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="一部無効" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">有効なオプション</SelectItem>
          <SelectItem value="option2" disabled>無効なオプション</SelectItem>
          <SelectItem value="option3">有効なオプション</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledSelect() {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">小</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="large">大</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          選択中: {value || '未選択'}
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">sm</p>
        <Select>
          <SelectTrigger size="sm" className="w-48">
            <SelectValue placeholder="Small" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">オプション1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">default</p>
        <Select>
          <SelectTrigger size="default" className="w-48">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">オプション1</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Select - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">オプション1</SelectItem>
              <SelectItem value="2">オプション2</SelectItem>
              <SelectItem value="3">オプション3</SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">グループ化</h2>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>グループA</SelectLabel>
                <SelectItem value="a1">アイテムA1</SelectItem>
                <SelectItem value="a2">アイテムA2</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>グループB</SelectLabel>
                <SelectItem value="b1">アイテムB1</SelectItem>
                <SelectItem value="b2">アイテムB2</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">無効状態</h2>
          <div className="flex gap-4">
            <Select disabled>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="無効" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">オプション</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">コンポーネント構成</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><code>Select</code> - ルート</li>
            <li><code>SelectTrigger</code> - トリガーボタン</li>
            <li><code>SelectValue</code> - 選択値表示</li>
            <li><code>SelectContent</code> - ドロップダウン</li>
            <li><code>SelectItem</code> - 選択肢</li>
            <li><code>SelectGroup</code> - グループ</li>
            <li><code>SelectLabel</code> - グループラベル</li>
            <li><code>SelectSeparator</code> - 区切り線</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
