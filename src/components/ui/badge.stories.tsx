import type { Meta, StoryObj } from '@storybook/react';
import { AlertCircle, CheckCircle, Info as InfoIcon, Star } from 'lucide-react';

import { Badge } from './badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
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

// =============================================================================
// 基本バリアント
// =============================================================================

export const Primary: Story = {
  args: {
    children: 'NEW',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: '+3件',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'ステータス',
    variant: 'outline',
  },
};

export const Success: Story = {
  args: {
    children: '完了',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: '要確認',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: 'ベータ',
    variant: 'info',
  },
};

export const Destructive: Story = {
  args: {
    children: 'エラー',
    variant: 'destructive',
  },
};

// =============================================================================
// アイコン付き
// =============================================================================

export const WithIcon: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <CheckCircle />
        完了
      </>
    ),
  },
};

export const WarningWithIcon: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertCircle />
        注意
      </>
    ),
  },
};

export const InfoWithIcon: Story = {
  args: {
    variant: 'info',
    children: (
      <>
        <InfoIcon />
        お知らせ
      </>
    ),
  },
};

// =============================================================================
// 使用例
// =============================================================================

export const NewFeature: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <Star />
        NEW
      </>
    ),
  },
};

export const Count: Story = {
  args: {
    variant: 'secondary',
    children: '5',
  },
};

export const Status: Story = {
  args: {
    variant: 'outline',
    children: '進行中',
  },
};

// =============================================================================
// 全バリアント一覧
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">
          <CheckCircle />
          完了
        </Badge>
        <Badge variant="warning">
          <AlertCircle />
          要確認
        </Badge>
        <Badge variant="destructive">
          <AlertCircle />
          エラー
        </Badge>
      </div>
    </div>
  ),
};
