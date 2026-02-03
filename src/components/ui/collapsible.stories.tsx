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
        <div className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg px-4 py-2">
          <span className="text-sm font-bold">セクション</span>
          <ChevronDown className="size-4" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-2">
        <p className="text-muted-foreground text-sm">これは折りたたまれたコンテンツです。</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const SidebarSection: Story = {
  render: () => (
    <div className="border-border w-64 rounded-lg border">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <div className="hover:bg-muted flex cursor-pointer items-center justify-between px-4 py-4">
            <span className="text-sm font-bold">ナビゲーション</span>
            <ChevronDown className="size-4" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1 px-4 pb-4">
            <div className="hover:bg-muted cursor-pointer rounded px-2 py-2 text-sm">
              ダッシュボード
            </div>
            <div className="hover:bg-muted cursor-pointer rounded px-2 py-2 text-sm">プラン</div>
            <div className="hover:bg-muted cursor-pointer rounded px-2 py-2 text-sm">統計</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Collapsible - 実際の使用パターン</h1>

      <div className="max-w-md space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">サイドバーセクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            SidebarSection.tsxで使用されているパターン
          </p>
          <div className="border-border rounded-lg border">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <div className="hover:bg-muted flex cursor-pointer items-center justify-between px-4 py-4">
                  <span className="text-sm font-bold">セクション</span>
                  <ChevronDown className="size-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 px-4 pb-4">
                  <div className="hover:bg-muted rounded px-2 py-2 text-sm">アイテム1</div>
                  <div className="hover:bg-muted rounded px-2 py-2 text-sm">アイテム2</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">使用Props</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>
              <code>defaultOpen</code> - 初期状態（true/false）
            </li>
            <li>
              <code>asChild</code> - カスタムトリガー要素を使用
            </li>
          </ul>
        </section>

        <section className="bg-muted rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
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
