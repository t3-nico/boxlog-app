import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
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
    <Collapsible className="w-80">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          詳細を表示
          <ChevronsUpDown className="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border border-border rounded-lg mt-2">
        <p>これは折りたたまれたコンテンツです。</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-80">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          セクション（初期表示）
          <ChevronsUpDown className="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border border-border rounded-lg mt-2">
        <p>デフォルトで開いた状態です。</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Controlled: Story = {
  render: function ControlledCollapsible() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="w-80 space-y-4">
        <p className="text-sm text-muted-foreground">
          状態: {isOpen ? '開いている' : '閉じている'}
        </p>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              制御されたCollapsible
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border border-border rounded-lg mt-2">
            <p>状態を外部から制御しています。</p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

export const FAQ: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      {[
        {
          q: 'このサービスは無料ですか？',
          a: '基本機能は無料でご利用いただけます。プレミアム機能は月額プランでご利用可能です。',
        },
        {
          q: 'データのバックアップはありますか？',
          a: 'はい、毎日自動でバックアップを取っています。',
        },
        {
          q: '解約はいつでもできますか？',
          a: 'はい、いつでも解約可能です。違約金等はかかりません。',
        },
      ].map((item, index) => (
        <Collapsible key={index} className="border border-border rounded-lg">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between font-normal px-4 py-3 h-auto"
            >
              {item.q}
              <ChevronDown className="size-4 shrink-0" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
            {item.a}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Collapsible - 全バリエーション</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                クリックで開閉
                <ChevronsUpDown className="size-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 bg-container rounded-lg">
              <p>折りたたみコンテンツ</p>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">FAQスタイル</h2>
          <div className="space-y-2">
            <Collapsible className="border border-border rounded-lg">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-4">
                  質問1
                  <ChevronDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
                回答1がここに表示されます。
              </CollapsibleContent>
            </Collapsible>
            <Collapsible className="border border-border rounded-lg">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-4">
                  質問2
                  <ChevronDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
                回答2がここに表示されます。
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>FAQ / ヘルプセクション</li>
            <li>詳細設定の表示/非表示</li>
            <li>サイドバーのセクション</li>
            <li>フォームの追加オプション</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
