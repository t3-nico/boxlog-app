import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger, UnderlineTabsTrigger } from './tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList>
        <TabsTrigger value="account">アカウント</TabsTrigger>
        <TabsTrigger value="password">パスワード</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="p-4">
        <p>アカウント設定がここに表示されます。</p>
      </TabsContent>
      <TabsContent value="password" className="p-4">
        <p>パスワード設定がここに表示されます。</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="overview">概要</TabsTrigger>
        <TabsTrigger value="analytics">分析</TabsTrigger>
        <TabsTrigger value="reports">レポート</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <p>概要コンテンツ</p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <p>分析コンテンツ</p>
      </TabsContent>
      <TabsContent value="reports" className="p-4">
        <p>レポートコンテンツ</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-96">
      <TabsList>
        <TabsTrigger value="active">有効</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          無効
        </TabsTrigger>
        <TabsTrigger value="another">別のタブ</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="p-4">
        <p>有効なタブのコンテンツ</p>
      </TabsContent>
    </Tabs>
  ),
};

export const UnderlineStyle: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList className="bg-transparent border-0 rounded-none gap-4 h-auto p-0 border-b border-border">
        <UnderlineTabsTrigger value="tab1">タブ1</UnderlineTabsTrigger>
        <UnderlineTabsTrigger value="tab2">タブ2</UnderlineTabsTrigger>
        <UnderlineTabsTrigger value="tab3">タブ3</UnderlineTabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4">
        <p>アンダーラインスタイルのタブ1</p>
      </TabsContent>
      <TabsContent value="tab2" className="p-4">
        <p>アンダーラインスタイルのタブ2</p>
      </TabsContent>
      <TabsContent value="tab3" className="p-4">
        <p>アンダーラインスタイルのタブ3</p>
      </TabsContent>
    </Tabs>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Tabs - 全バリエーション</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-semibold mb-4">ピル型（デフォルト）</h2>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="tab1">タブ1</TabsTrigger>
              <TabsTrigger value="tab2">タブ2</TabsTrigger>
              <TabsTrigger value="tab3">タブ3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4 border border-border rounded-lg mt-2">
              タブ1のコンテンツ
            </TabsContent>
            <TabsContent value="tab2" className="p-4 border border-border rounded-lg mt-2">
              タブ2のコンテンツ
            </TabsContent>
            <TabsContent value="tab3" className="p-4 border border-border rounded-lg mt-2">
              タブ3のコンテンツ
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">アンダーライン型（Slack/Linear風）</h2>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList className="bg-transparent border-0 rounded-none gap-6 h-auto p-0 pb-px border-b border-border w-full justify-start">
              <UnderlineTabsTrigger value="tab1">概要</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="tab2">アクティビティ</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="tab3">設定</UnderlineTabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4">
              概要のコンテンツ
            </TabsContent>
            <TabsContent value="tab2" className="p-4">
              アクティビティのコンテンツ
            </TabsContent>
            <TabsContent value="tab3" className="p-4">
              設定のコンテンツ
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">無効なタブ</h2>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="tab1">有効</TabsTrigger>
              <TabsTrigger value="tab2" disabled>無効</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使い分け</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><strong>ピル型</strong>: コンパクトなエリア、設定画面</li>
            <li><strong>アンダーライン型</strong>: ページ全体のナビゲーション、詳細ビュー</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
