import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Plus, Settings, Trash2 } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'text', 'destructive'],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon-sm', 'icon', 'icon-lg'],
      description: 'ボタンのサイズ',
    },
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// 基本バリアント
// =============================================================================

export const Primary: Story = {
  args: {
    children: '保存',
    variant: 'primary',
  },
};

export const Outline: Story = {
  args: {
    children: 'キャンセル',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: '設定',
    variant: 'ghost',
  },
};

export const Text: Story = {
  args: {
    children: '詳細を見る',
    variant: 'text',
  },
};

export const Destructive: Story = {
  args: {
    children: '削除',
    variant: 'destructive',
  },
};

// =============================================================================
// サイズ
// =============================================================================

export const SizeSmall: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const SizeDefault: Story = {
  args: {
    children: 'Default',
    size: 'default',
  },
};

export const SizeLarge: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

// =============================================================================
// アイコンボタン
// =============================================================================

export const IconButton: Story = {
  args: {
    variant: 'ghost',
    size: 'icon',
    'aria-label': '設定を開く',
    children: <Settings className="size-4" />,
  },
};

export const IconButtonSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'icon-sm',
    'aria-label': '追加',
    children: <Plus className="size-4" />,
  },
};

export const IconButtonLarge: Story = {
  args: {
    variant: 'outline',
    size: 'icon-lg',
    'aria-label': '削除',
    children: <Trash2 className="size-5" />,
  },
};

// =============================================================================
// アイコン付きテキストボタン
// =============================================================================

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="size-4" />
        メールを送信
      </>
    ),
  },
};

// =============================================================================
// 状態
// =============================================================================

export const Loading: Story = {
  args: {
    children: '保存',
    isLoading: true,
  },
};

export const LoadingWithText: Story = {
  args: {
    children: '保存',
    isLoading: true,
    loadingText: '保存中...',
  },
};

export const Disabled: Story = {
  args: {
    children: '無効',
    disabled: true,
  },
};

// =============================================================================
// 全バリアント一覧
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="text">Text</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Small icon">
          <Settings className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Default icon">
          <Settings className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-lg" aria-label="Large icon">
          <Settings className="size-5" />
        </Button>
      </div>
    </div>
  ),
};
