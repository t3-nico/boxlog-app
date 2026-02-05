import type { Meta, StoryObj } from '@storybook/react';
import { Filter, Info, Search, Settings, SortAsc } from 'lucide-react';

import { Button } from './button';
import { HoverTooltip } from './tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: HoverTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HoverTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  args: {
    content: 'Tooltip',
    children: <span>Trigger</span>,
  },
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Tooltip</h1>
      <p className="text-muted-foreground mb-8">
        ホバー時に補足情報を表示。アイコンボタンには必須。
      </p>

      <div className="grid max-w-lg gap-8">
        <div>
          <h2 className="mb-2 text-lg font-bold">アイコンボタン（主要用途）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            アイコンのみのボタンには必ずツールチップを付ける。aria-labelも必須。
          </p>
          <div className="flex gap-2">
            <HoverTooltip content="検索" side="top">
              <Button variant="ghost" size="icon" aria-label="検索">
                <Search className="size-5" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content="フィルター" side="top">
              <Button variant="ghost" size="icon" aria-label="フィルター">
                <Filter className="size-5" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content="ソート" side="top">
              <Button variant="ghost" size="icon" aria-label="ソート">
                <SortAsc className="size-5" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content="設定" side="top">
              <Button variant="ghost" size="icon" aria-label="設定">
                <Settings className="size-5" />
              </Button>
            </HoverTooltip>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">ナビゲーションタブ</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            ナビゲーションタブでは side=&quot;bottom&quot; を使用。
          </p>
          <div className="flex gap-2">
            <HoverTooltip content="ホーム" side="bottom">
              <Button variant="ghost" size="icon" aria-label="ホーム">
                <Info className="size-5" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content="設定" side="bottom">
              <Button variant="ghost" size="icon" aria-label="設定">
                <Settings className="size-5" />
              </Button>
            </HoverTooltip>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">省略テキスト</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            テキストが省略された場合のみ表示。disabled=&#123;!isTruncated&#125;
          </p>
          <div className="flex flex-col gap-2">
            <HoverTooltip content="短いテキストは省略されない" disabled>
              <span className="text-foreground truncate text-sm">短いテキスト</span>
            </HoverTooltip>
            <HoverTooltip content="長いテキストは省略されるのでツールチップで全文を表示">
              <span className="text-foreground block w-32 truncate text-sm">
                長いテキストは省略されるのでツールチップで全文を表示
              </span>
            </HoverTooltip>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">位置指定（side）</h2>
          <p className="text-muted-foreground mb-4 text-sm">デフォルトは top。</p>
          <div className="flex flex-wrap gap-2">
            <HoverTooltip content="top（デフォルト）" side="top">
              <Button variant="outline" size="sm">
                上
              </Button>
            </HoverTooltip>
            <HoverTooltip content="bottom" side="bottom">
              <Button variant="outline" size="sm">
                下
              </Button>
            </HoverTooltip>
            <HoverTooltip content="left" side="left">
              <Button variant="outline" size="sm">
                左
              </Button>
            </HoverTooltip>
            <HoverTooltip content="right" side="right">
              <Button variant="outline" size="sm">
                右
              </Button>
            </HoverTooltip>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Props / 使い方</h2>
          <div className="bg-surface-container rounded-lg p-4">
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>content - 表示テキスト（ReactNode対応）</li>
              <li>side - 表示位置（top/bottom/left/right、デフォルト: top）</li>
              <li>disabled - 条件付き非表示（省略テキスト判定等）</li>
              <li>delayMs - 表示遅延（デフォルト: 300ms）</li>
              <li>maxWidth - 最大幅（デフォルト: 200px）</li>
              <li>wrapperClassName - ラッパーのクラス（w-full等）</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>TableNavigation - 検索/フィルター/ソート/設定ボタン</li>
            <li>NavigationTabItem - ナビゲーションタブ</li>
            <li>SelectionActions - 一括操作ボタン</li>
            <li>NotificationDropdown - 設定アイコン</li>
            <li>GroupNameWithTooltip - 省略テキスト表示</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};
