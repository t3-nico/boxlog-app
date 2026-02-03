import type { Meta, StoryObj } from '@storybook/react';
import { Settings, Info, HelpCircle } from 'lucide-react';

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
    maxWidth: {
      control: 'number',
      description: '最大幅（px）',
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
      <HoverTooltip content="ヘルプ">
        <Button variant="ghost" size="icon" aria-label="ヘルプ">
          <HelpCircle className="size-4" />
        </Button>
      </HoverTooltip>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <HoverTooltip
      content="これは長いツールチップテキストです。複数行に折り返されて表示されます。"
      maxWidth={200}
    >
      <Button variant="outline">長いテキスト</Button>
    </HoverTooltip>
  ),
};

export const CustomDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverTooltip content="すぐに表示" delayMs={0}>
        <Button variant="outline">遅延なし</Button>
      </HoverTooltip>
      <HoverTooltip content="300ms後に表示" delayMs={300}>
        <Button variant="outline">300ms</Button>
      </HoverTooltip>
      <HoverTooltip content="1秒後に表示" delayMs={1000}>
        <Button variant="outline">1秒</Button>
      </HoverTooltip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverTooltip content="有効なツールチップ">
        <Button variant="outline">有効</Button>
      </HoverTooltip>
      <HoverTooltip content="無効なツールチップ" disabled>
        <Button variant="outline">無効</Button>
      </HoverTooltip>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Tooltip - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">位置</h2>
          <div className="flex gap-4">
            <HoverTooltip content="上" side="top">
              <Button variant="outline">上</Button>
            </HoverTooltip>
            <HoverTooltip content="下" side="bottom">
              <Button variant="outline">下</Button>
            </HoverTooltip>
            <HoverTooltip content="左" side="left">
              <Button variant="outline">左</Button>
            </HoverTooltip>
            <HoverTooltip content="右" side="right">
              <Button variant="outline">右</Button>
            </HoverTooltip>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">アイコンボタン</h2>
          <p className="text-sm text-muted-foreground mb-4">
            アイコンのみのボタンには必ずツールチップを付けてください。
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
          <h2 className="text-lg font-semibold mb-4">長いテキスト</h2>
          <HoverTooltip
            content="これは長いツールチップテキストの例です。maxWidthを指定することで、テキストが折り返されます。"
            maxWidth={250}
          >
            <Button variant="outline">長いテキスト（maxWidth: 250px）</Button>
          </HoverTooltip>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">表示遅延</h2>
          <div className="flex gap-4">
            <HoverTooltip content="即座に表示" delayMs={0}>
              <Button variant="outline">0ms</Button>
            </HoverTooltip>
            <HoverTooltip content="デフォルト" delayMs={300}>
              <Button variant="outline">300ms（デフォルト）</Button>
            </HoverTooltip>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用ガイドライン</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>アイコンのみのボタンには必ずツールチップを付ける</li>
            <li>補足情報を提供する（必須情報はラベルに）</li>
            <li>短く簡潔なテキストにする</li>
            <li>モバイルでは動作しないため、代替手段を用意する</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
