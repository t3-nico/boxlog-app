import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => {
    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">HoverCard</h1>
        <p className="text-muted-foreground mb-8">
          ホバーでリッチな情報を表示。ユーザープロフィール、リンクプレビュー等。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">ユーザープロフィール</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              ユーザー名ホバーでプロフィール詳細を表示。
            </p>
            <p className="text-foreground">
              作成者:{' '}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="text-primary h-auto p-0 underline">
                    @takayasutomoya
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/default.png" />
                      <AvatarFallback>
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">Tomoya Takayasu</h4>
                      <p className="text-muted-foreground text-sm">
                        Full-stack developer. Building time management tools.
                      </p>
                      <div className="text-muted-foreground flex items-center pt-2 text-xs">
                        <Calendar className="mr-1 size-3" />
                        Joined January 2024
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">リンクプレビュー</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              リンクホバーで遷移先の情報をプレビュー。
            </p>
            <HoverCard>
              <HoverCardTrigger asChild>
                <a
                  href="#"
                  className="text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  プロジェクト設定ドキュメント
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold">プロジェクト設定ガイド</h4>
                  <p className="text-muted-foreground text-sm">
                    プロジェクトの初期設定、環境変数の設定、デプロイ方法について説明します。
                  </p>
                  <div className="text-muted-foreground text-xs">最終更新: 2024年1月15日</div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">HoverCard vs Tooltip</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>Tooltip</strong>: 短いテキスト情報（1行程度）、アイコンボタンの説明
                </li>
                <li>
                  <strong>HoverCard</strong>:
                  リッチな情報（複数行、画像、リンク等）、プロフィール、プレビュー
                </li>
                <li>
                  <strong>使い分け</strong>: シンプルな説明=Tooltip、詳細情報=HoverCard
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>HoverCard - ルートコンテナ（Radix使用）</li>
                <li>HoverCardTrigger - ホバー対象（asChild対応）</li>
                <li>HoverCardContent - コンテンツ（w-64デフォルト、カスタマイズ可）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>ユーザーメンション - プロフィールプレビュー</li>
              <li>リンクテキスト - 遷移先プレビュー</li>
              <li>タグ名 - タグ詳細情報</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
