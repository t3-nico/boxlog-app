import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';

import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>カードの説明がここに入ります。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>カードのコンテンツがここに表示されます。</p>
      </CardContent>
      <CardFooter>
        <Button>アクション</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>プロジェクト名</CardTitle>
        <CardDescription>2024年1月開始</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" aria-label="メニュー">
            <MoreHorizontal className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>プロジェクトの詳細説明がここに入ります。</p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>アカウント作成</CardTitle>
        <CardDescription>新しいアカウントを作成します。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <Input id="name" placeholder="山田太郎" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">キャンセル</Button>
        <Button>作成</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p>シンプルなカード。ヘッダーとフッターなし。</p>
      </CardContent>
    </Card>
  ),
};

export const WithBorder: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="border-b">
        <CardTitle>ボーダー付き</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p>ヘッダーにボーダーを付けたカード。</p>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button className="w-full">アクション</Button>
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Card - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">基本構造</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>タイトル</CardTitle>
              <CardDescription>説明テキスト</CardDescription>
            </CardHeader>
            <CardContent>
              <p>コンテンツ</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">フッターアクション</Button>
            </CardFooter>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">アクション付き</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>タスク一覧</CardTitle>
              <CardDescription>本日のタスク</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon" aria-label="オプション">
                  <MoreHorizontal className="size-4" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="bg-primary size-2 rounded-full" />
                  タスク1
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-primary size-2 rounded-full" />
                  タスク2
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">カードグリッド</h2>
          <div className="grid max-w-2xl grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>カード {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">グリッドレイアウトのカード</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>
              <code>Card</code> - ルートコンテナ
            </li>
            <li>
              <code>CardHeader</code> - タイトル・説明エリア
            </li>
            <li>
              <code>CardTitle</code> - タイトル
            </li>
            <li>
              <code>CardDescription</code> - 説明
            </li>
            <li>
              <code>CardAction</code> - ヘッダー右上のアクション
            </li>
            <li>
              <code>CardContent</code> - メインコンテンツ
            </li>
            <li>
              <code>CardFooter</code> - フッター（ボタン等）
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
