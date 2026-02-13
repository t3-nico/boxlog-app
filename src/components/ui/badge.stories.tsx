import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from './badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'success', 'warning', 'info', 'destructive'],
      description: 'バッジのスタイルバリアント',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'secondary',
  },
};

export const AllPatterns: Story = {
  render: () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Badge - 用途別パターン</h1>

      {/* カウント・数量表示 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">カウント・数量表示</h2>
        <p className="text-muted-foreground mb-4 text-sm">件数、未読数などの数値表示に使用</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">+3件</Badge>
          <Badge variant="secondary">5</Badge>
          <Badge variant="secondary">99+</Badge>
        </div>
      </section>

      {/* ステータス表示 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">ステータス表示</h2>
        <p className="text-muted-foreground mb-4 text-sm">進行状態、カテゴリなどの表示に使用</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">進行中</Badge>
          <Badge variant="outline">完了</Badge>
          <Badge variant="outline">保留</Badge>
        </div>
      </section>

      {/* 強調・注目 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">強調・注目</h2>
        <p className="text-muted-foreground mb-4 text-sm">新機能、重要な情報の強調に使用</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">NEW</Badge>
          <Badge variant="primary">注目</Badge>
          <Badge variant="primary">おすすめ</Badge>
        </div>
      </section>

      {/* Semantic Variants（意味ベース） */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Semantic Variants</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          状態を意味で表現。アウトラインスタイルで軽量に表示。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">完了</Badge>
          <Badge variant="success">+10%</Badge>
          <Badge variant="warning">要確認</Badge>
          <Badge variant="warning">期限切れ間近</Badge>
          <Badge variant="info">ベータ</Badge>
          <Badge variant="info">更新あり</Badge>
          <Badge variant="destructive">エラー</Badge>
          <Badge variant="destructive">-5%</Badge>
        </div>
      </section>

      {/* 増減表示 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">増減表示</h2>
        <p className="text-muted-foreground mb-4 text-sm">統計の増減、成功/失敗の表示に使用</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">+10%</Badge>
          <Badge variant="destructive">-5%</Badge>
        </div>
      </section>

      {/* 連携ステータス */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">連携ステータス</h2>
        <p className="text-muted-foreground mb-4 text-sm">外部サービスとの連携状態表示に使用</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">接続済み</Badge>
          <Badge variant="outline">未接続</Badge>
        </div>
      </section>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
