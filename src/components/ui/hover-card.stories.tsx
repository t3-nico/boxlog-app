import type { Meta, StoryObj } from '@storybook/react';
import { CalendarDays } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="text-sm underline cursor-pointer">山田太郎</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>山田</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">山田太郎</h4>
            <p className="text-sm text-muted-foreground">
              taro@example.com
            </p>
            <p className="text-sm">
              エンジニア @ 株式会社サンプル
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="text-sm font-medium underline cursor-pointer">
          商品詳細を見る
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-2">
          <div className="h-24 bg-container rounded-md flex items-center justify-center">
            <span className="text-muted-foreground">商品画像</span>
          </div>
          <h4 className="text-sm font-semibold">サンプル商品</h4>
          <p className="text-sm text-muted-foreground">
            これはサンプル商品の説明文です。
          </p>
          <p className="text-lg font-bold">¥1,980</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-8">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm">上</Button>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-48">
          <p className="text-sm">上に表示されます</p>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm">下</Button>
        </HoverCardTrigger>
        <HoverCardContent side="bottom" className="w-48">
          <p className="text-sm">下に表示されます</p>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm">左</Button>
        </HoverCardTrigger>
        <HoverCardContent side="left" className="w-48">
          <p className="text-sm">左に表示されます</p>
        </HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm">右</Button>
        </HoverCardTrigger>
        <HoverCardContent side="right" className="w-48">
          <p className="text-sm">右に表示されます</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">HoverCard - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">ユーザープロフィール</h2>
          <p className="text-sm">
            この記事は
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="underline cursor-pointer mx-1">@yamada</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>山</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">山田太郎</p>
                    <p className="text-sm text-muted-foreground">
                      フロントエンドエンジニア
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            によって書かれました。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">リンクプレビュー</h2>
          <HoverCard>
            <HoverCardTrigger asChild>
              <a href="#" className="text-primary underline">
                Next.js ドキュメント
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold">Next.js Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Learn how to build full-stack web applications with Next.js.
                </p>
                <p className="text-xs text-muted-foreground">
                  nextjs.org
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Tooltipとの違い</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><strong>Tooltip</strong>: 短いテキストのみ。即座に表示。</li>
            <li><strong>HoverCard</strong>: リッチコンテンツ。遅延表示。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>ユーザー名ホバーでプロフィール表示</li>
            <li>リンクホバーでプレビュー表示</li>
            <li>商品名ホバーで詳細表示</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
