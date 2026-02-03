import type { Meta, StoryObj } from '@storybook/react';
import { Info, Settings } from 'lucide-react';

import { Button } from './button';
import { HoverTooltip } from './tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: HoverTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'ツールチップに表示するテキスト',
    },
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: '表示位置',
    },
    delayMs: {
      control: 'number',
      description: '表示までの遅延（ミリ秒）',
    },
    disabled: {
      control: 'boolean',
      description: '無効化',
    },
  },
} satisfies Meta<typeof HoverTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'ツールチップテキスト',
    children: <Button variant="outline">ホバーしてください</Button>,
  },
};

export const IconButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverTooltip content="設定">
        <Button variant="ghost" size="icon" aria-label="設定">
          <Settings className="size-4" />
        </Button>
      </HoverTooltip>
      <HoverTooltip content="情報">
        <Button variant="ghost" size="icon" aria-label="情報">
          <Info className="size-4" />
        </Button>
      </HoverTooltip>
    </div>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverTooltip content="上に表示" side="top">
        <Button variant="outline">上</Button>
      </HoverTooltip>
      <HoverTooltip content="下に表示" side="bottom">
        <Button variant="outline">下</Button>
      </HoverTooltip>
      <HoverTooltip content="左に表示" side="left">
        <Button variant="outline">左</Button>
      </HoverTooltip>
      <HoverTooltip content="右に表示" side="right">
        <Button variant="outline">右</Button>
      </HoverTooltip>
    </div>
  ),
};

export const AllPatterns: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Tooltip - 実際の使用パターン</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">アイコンボタン</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            アイコンのみのボタンには必ずツールチップを付ける
          </p>
          <div className="flex gap-4">
            <HoverTooltip content="設定を開く">
              <Button variant="ghost" size="icon" aria-label="設定を開く">
                <Settings className="size-4" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content="詳細情報">
              <Button variant="ghost" size="icon" aria-label="詳細情報">
                <Info className="size-4" />
              </Button>
            </HoverTooltip>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">位置指定（side）</h2>
          <div className="flex gap-4">
            <HoverTooltip content="top" side="top">
              <Button variant="outline">上</Button>
            </HoverTooltip>
            <HoverTooltip content="bottom" side="bottom">
              <Button variant="outline">下</Button>
            </HoverTooltip>
            <HoverTooltip content="left" side="left">
              <Button variant="outline">左</Button>
            </HoverTooltip>
            <HoverTooltip content="right" side="right">
              <Button variant="outline">右</Button>
            </HoverTooltip>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">無効化（disabled）</h2>
          <div className="flex gap-4">
            <HoverTooltip content="表示される">
              <Button variant="outline">有効</Button>
            </HoverTooltip>
            <HoverTooltip content="表示されない" disabled>
              <Button variant="outline">無効</Button>
            </HoverTooltip>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">使用Props</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>
              <code>content</code> - 表示テキスト
            </li>
            <li>
              <code>side</code> - 表示位置（top/bottom/left/right）
            </li>
            <li>
              <code>disabled</code> - 無効化
            </li>
            <li>
              <code>delayMs</code> - 表示遅延
            </li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
