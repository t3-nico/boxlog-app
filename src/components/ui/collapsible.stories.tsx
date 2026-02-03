import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => (
    <div className="bg-background text-foreground min-h-screen p-8">
      <h1 className="mb-2 text-2xl font-bold">Collapsible</h1>
      <p className="text-muted-foreground mb-8">折りたたみ可能なセクション</p>

      <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
        <div>
          <h2 className="mb-2 text-lg font-bold">サイドバーセクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            SidebarSection.tsx で使用。ChevronRight が90度回転。
          </p>
          <div className="border-border rounded-lg border">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <div className="hover:bg-state-hover flex h-8 w-full cursor-pointer items-center rounded transition-colors">
                  <div className="text-muted-foreground flex h-8 min-w-0 items-center px-2 text-left text-xs font-bold">
                    <span className="truncate">セクションタイトル</span>
                    <ChevronRight className="ml-1 size-4 shrink-0 transition-transform [[data-state=open]_&]:rotate-90" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 px-2 pb-2">
                  <div className="hover:bg-state-hover rounded px-2 py-2 text-sm">アイテム1</div>
                  <div className="hover:bg-state-hover rounded px-2 py-2 text-sm">アイテム2</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">Inspectorセクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            ActivitySection.tsx, RecordsSection.tsx で使用。水平線で区切られたトリガー。
          </p>
          <div className="border-border rounded-lg border">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <div className="flex h-10 w-full cursor-pointer items-center gap-2 px-4 transition-colors">
                  <div className="border-border/50 h-px flex-1 border-t" />
                  <div className="hover:bg-state-hover flex items-center gap-1 rounded px-2 py-1 transition-colors">
                    <Clock className="text-muted-foreground size-3" />
                    <span className="text-muted-foreground text-xs">Records (3)</span>
                    <ChevronDown className="text-muted-foreground size-3 transition-transform [[data-state=open]_&]:rotate-180" />
                  </div>
                  <div className="border-border/50 h-px flex-1 border-t" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <div className="bg-surface-container mb-2 flex items-center justify-between rounded-lg p-2">
                    <span className="text-muted-foreground text-xs">合計時間</span>
                    <span className="text-sm font-bold">2時間30分</span>
                  </div>
                  <div className="space-y-2">
                    <div className="hover:bg-state-hover flex items-center gap-2 rounded-lg p-2">
                      <span className="text-muted-foreground w-20 text-xs">2024-01-15</span>
                      <span className="text-sm">1時間</span>
                    </div>
                    <div className="hover:bg-state-hover flex items-center gap-2 rounded-lg p-2">
                      <span className="text-muted-foreground w-20 text-xs">2024-01-14</span>
                      <span className="text-sm">1時間30分</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>SidebarSection.tsx - サイドバーの折りたたみセクション</li>
            <li>ActivitySection.tsx - Plan Inspectorのアクティビティ</li>
            <li>RecordsSection.tsx - Plan Inspectorのレコード一覧</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Props</h2>
          <div className="bg-surface-container rounded-lg p-4">
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>defaultOpen - 初期状態で開くか（boolean）</li>
              <li>asChild - CollapsibleTriggerでカスタム要素を使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};
