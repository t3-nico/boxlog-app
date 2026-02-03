import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">オプション1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">オプション2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">オプション3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex flex-row gap-6">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="ha" />
        <Label htmlFor="ha">A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="hb" />
        <Label htmlFor="hb">B</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="c" id="hc" />
        <Label htmlFor="hc">C</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="d1" />
        <Label htmlFor="d1">オプション1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="d2" />
        <Label htmlFor="d2">オプション2</Label>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  render: function InteractiveRadioGroup() {
    const [value, setValue] = useState('comfortable');
    return (
      <div className="space-y-4">
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="default" id="i1" />
            <Label htmlFor="i1">デフォルト</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="comfortable" id="i2" />
            <Label htmlFor="i2">快適</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="compact" id="i3" />
            <Label htmlFor="i3">コンパクト</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-muted-foreground">
          選択中: {value}
        </p>
      </div>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="free">
      <div className="flex items-start gap-3">
        <RadioGroupItem value="free" id="plan-free" className="mt-1" />
        <div>
          <Label htmlFor="plan-free">無料プラン</Label>
          <p className="text-sm text-muted-foreground">
            基本機能が利用可能
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem value="pro" id="plan-pro" className="mt-1" />
        <div>
          <Label htmlFor="plan-pro">Proプラン</Label>
          <p className="text-sm text-muted-foreground">
            ¥980/月 - 全機能が利用可能
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RadioGroupItem value="enterprise" id="plan-enterprise" className="mt-1" />
        <div>
          <Label htmlFor="plan-enterprise">Enterpriseプラン</Label>
          <p className="text-sm text-muted-foreground">
            カスタム料金 - チーム向け機能
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">RadioGroup - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">縦配置（デフォルト）</h2>
          <RadioGroup defaultValue="v1">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="v1" id="v1" />
              <Label htmlFor="v1">オプション1</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="v2" id="v2" />
              <Label htmlFor="v2">オプション2</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="v3" id="v3" />
              <Label htmlFor="v3">オプション3</Label>
            </div>
          </RadioGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">横配置</h2>
          <RadioGroup defaultValue="h1" className="flex flex-row gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="h1" id="h1" />
              <Label htmlFor="h1">小</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="h2" id="h2" />
              <Label htmlFor="h2">中</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="h3" id="h3" />
              <Label htmlFor="h3">大</Label>
            </div>
          </RadioGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">無効状態</h2>
          <RadioGroup defaultValue="dis1" disabled>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dis1" id="dis1" />
              <Label htmlFor="dis1">選択済み（無効）</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dis2" id="dis2" />
              <Label htmlFor="dis2">未選択（無効）</Label>
            </div>
          </RadioGroup>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">説明付き</h2>
          <RadioGroup defaultValue="desc1" className="space-y-4">
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <RadioGroupItem value="desc1" id="desc1" className="mt-0.5" />
              <div>
                <Label htmlFor="desc1" className="font-medium">
                  標準配送
                </Label>
                <p className="text-sm text-muted-foreground">
                  3〜5営業日でお届け（無料）
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
              <RadioGroupItem value="desc2" id="desc2" className="mt-0.5" />
              <div>
                <Label htmlFor="desc2" className="font-medium">
                  速達配送
                </Label>
                <p className="text-sm text-muted-foreground">
                  1〜2営業日でお届け（¥500）
                </p>
              </div>
            </div>
          </RadioGroup>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
