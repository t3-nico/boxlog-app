import type { Meta, StoryObj } from '@storybook/react';
import { BarChart3, Calendar, CircleCheckBig, Clock, Settings, User } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger, UnderlineTabsTrigger } from './tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {},
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

export const AllPatterns: Story = {
  render: () => (
    <div style={{ maxWidth: '48rem' }}>
      <h1 className="mb-2 text-2xl font-bold">Tabs</h1>
      <p className="text-muted-foreground mb-8">
        Radix UI Tabs をベースにした切り替えコンポーネント。
      </p>

      <div className="space-y-12">
        {/* ピル型（デフォルト） */}
        <section>
          <h2 className="mb-4 text-lg font-bold">ピル型（デフォルト）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            セグメンテッドコントロールスタイル。設定画面のセクション切り替えに最適。
          </p>
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="tab1">アカウント</TabsTrigger>
              <TabsTrigger value="tab2">通知</TabsTrigger>
              <TabsTrigger value="tab3">表示</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="border-border mt-2 rounded-lg border p-4">
              アカウント設定
            </TabsContent>
            <TabsContent value="tab2" className="border-border mt-2 rounded-lg border p-4">
              通知設定
            </TabsContent>
            <TabsContent value="tab3" className="border-border mt-2 rounded-lg border p-4">
              表示設定
            </TabsContent>
          </Tabs>
        </section>

        {/* アイコンのみ */}
        <section>
          <h2 className="mb-4 text-lg font-bold">アイコンのみ</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            コンパクトなナビゲーション。title属性でツールチップを表示。
          </p>
          <Tabs defaultValue="calendar" className="w-full max-w-xs">
            <TabsList>
              <TabsTrigger
                value="calendar"
                className="px-3"
                aria-label="カレンダー"
                title="カレンダー"
              >
                <Calendar className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="plan" className="px-3" aria-label="プラン" title="プラン">
                <CircleCheckBig className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="record" className="px-3" aria-label="記録" title="記録">
                <Clock className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="stats" className="px-3" aria-label="統計" title="統計">
                <BarChart3 className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-muted-foreground mt-2 text-xs">
            ※ アイコンのみの場合は必ず <code>aria-label</code> と <code>title</code> を設定
          </p>
        </section>

        {/* アイコン + テキスト */}
        <section>
          <h2 className="mb-4 text-lg font-bold">アイコン + テキスト</h2>
          <p className="text-muted-foreground mb-4 text-sm">明確なラベルが必要な場合。</p>
          <Tabs defaultValue="profile" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="size-4" />
                プロフィール
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="size-4" />
                設定
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {/* アンダーラインスタイル */}
        <section>
          <h2 className="mb-4 text-lg font-bold">アンダーラインスタイル</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Slack/Linear風。コンテンツ重視のレイアウトに。
          </p>
          <Tabs defaultValue="overview" className="w-full max-w-md">
            <TabsList className="h-auto gap-4 rounded-none border-b border-transparent bg-transparent p-0">
              <UnderlineTabsTrigger value="overview">概要</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="activity">アクティビティ</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="settings">設定</UnderlineTabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              概要コンテンツ
            </TabsContent>
            <TabsContent value="activity" className="pt-4">
              アクティビティコンテンツ
            </TabsContent>
            <TabsContent value="settings" className="pt-4">
              設定コンテンツ
            </TabsContent>
          </Tabs>
        </section>

        {/* 使い分けガイド */}
        <section>
          <h2 className="mb-4 text-lg font-bold">使い分けガイド</h2>
          <div className="bg-container space-y-3 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="font-medium">ピル型</span>
              <span className="text-muted-foreground text-sm">
                設定画面、フォーム内のセクション切り替え
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium">アイコンのみ</span>
              <span className="text-muted-foreground text-sm">
                ヘッダーナビゲーション、ツールバー（スペースが限られる場合）
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium">アンダーライン</span>
              <span className="text-muted-foreground text-sm">
                詳細ページ、プロフィールページ（コンテンツ重視）
              </span>
            </div>
          </div>
        </section>

        {/* コンポーネント構成 */}
        <section>
          <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>
              <code>Tabs</code> - ルート（defaultValue必須）
            </li>
            <li>
              <code>TabsList</code> - タブボタンのコンテナ（ピル型背景）
            </li>
            <li>
              <code>TabsTrigger</code> - タブボタン（ピル型）
            </li>
            <li>
              <code>UnderlineTabsTrigger</code> - タブボタン（アンダーライン型）
            </li>
            <li>
              <code>TabsContent</code> - タブコンテンツ
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
