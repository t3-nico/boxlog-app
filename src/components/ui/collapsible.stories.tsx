import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-80">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted rounded-lg">
          <span className="text-sm font-medium">セクション</span>
          <ChevronDown className="size-4" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-2">
        <p className="text-sm text-muted-foreground">
          これは折りたたまれたコンテンツです。
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const SidebarSection: Story = {
  render: () => (
    <div className="w-64 border border-border rounded-lg">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted">
            <span className="text-sm font-medium">ナビゲーション</span>
            <ChevronDown className="size-4" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-3 space-y-1">
            <div className="px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer">
              ダッシュボード
            </div>
            <div className="px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer">
              プラン
            </div>
            <div className="px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer">
              統計
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Collapsible - 実際の使用パターン</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">サイドバーセクション</h2>
          <p className="text-sm text-muted-foreground mb-4">
            SidebarSection.tsxで使用されているパターン
          </p>
          <div className="border border-border rounded-lg">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted">
                  <span className="text-sm font-medium">セクション</span>
                  <ChevronDown className="size-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-3 space-y-1">
                  <div className="px-2 py-1.5 text-sm hover:bg-muted rounded">アイテム1</div>
                  <div className="px-2 py-1.5 text-sm hover:bg-muted rounded">アイテム2</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用Props</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><code>defaultOpen</code> - 初期状態（true/false）</li>
            <li><code>asChild</code> - カスタムトリガー要素を使用</li>
          </ul>
        </section>

        <section className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> open, onOpenChangeは現在未使用（内部状態管理）
          </p>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
