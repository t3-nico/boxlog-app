import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './label';
import { Textarea } from './textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    rows: {
      control: 'number',
      description: '行数',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'テキストを入力...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="message">メッセージ</Label>
      <Textarea id="message" placeholder="メッセージを入力してください" />
    </div>
  ),
};

export const WithRows: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="short">短い入力（3行）</Label>
        <Textarea id="short" rows={3} placeholder="短いテキスト" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="long">長い入力（8行）</Label>
        <Textarea id="long" rows={8} placeholder="長いテキスト" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: '無効な入力欄',
    disabled: true,
  },
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="error-textarea">コメント</Label>
      <Textarea
        id="error-textarea"
        aria-invalid="true"
        placeholder="エラー状態のテキストエリア"
      />
      <p className="text-sm text-destructive">入力内容に問題があります</p>
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="limited">自己紹介</Label>
      <Textarea
        id="limited"
        placeholder="あなたについて教えてください"
        maxLength={200}
        defaultValue="これはサンプルテキストです。"
      />
      <p className="text-sm text-muted-foreground text-right">14 / 200</p>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Textarea - 全バリエーション</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Textarea placeholder="テキストを入力..." />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ラベル付き</h2>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea id="description" placeholder="説明を入力してください" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">行数指定</h2>
          <div className="space-y-4">
            <Textarea rows={2} placeholder="2行" />
            <Textarea rows={5} placeholder="5行" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">状態</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>通常</Label>
              <Textarea placeholder="通常状態" />
            </div>
            <div className="space-y-2">
              <Label>無効</Label>
              <Textarea placeholder="無効状態" disabled />
            </div>
            <div className="space-y-2">
              <Label>エラー</Label>
              <Textarea placeholder="エラー状態" aria-invalid="true" />
              <p className="text-sm text-destructive">入力内容に問題があります</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">文字数制限</h2>
          <div className="space-y-2">
            <Label htmlFor="limited-all">コメント（最大100文字）</Label>
            <Textarea
              id="limited-all"
              placeholder="コメントを入力"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground text-right">0 / 100</p>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
