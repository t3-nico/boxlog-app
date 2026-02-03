import type { Meta, StoryObj } from '@storybook/react';
import { Flame, MoreHorizontal, Trophy } from 'lucide-react';

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
import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => (
    <div className="bg-background text-foreground min-h-screen p-8">
      <h1 className="mb-2 text-2xl font-bold">Card</h1>
      <p className="text-muted-foreground mb-8">
        コンテンツをグループ化するコンテナ。Stats、フォーム、チャート等で使用。
      </p>

      <div className="grid gap-8" style={{ maxWidth: '64rem' }}>
        <div>
          <h2 className="mb-2 text-lg font-bold">Stats Card（主要用途）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            統計情報の表示。CardTitleにアイコン、CardDescriptionに補足情報。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="text-warning size-5" />
                  連続日数
                </CardTitle>
                <CardDescription>継続は力なり</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-3xl font-bold">7</div>
                    <div className="text-muted-foreground text-xs">日連続</div>
                  </div>
                  <div className="bg-border h-12 w-px" />
                  <div className="flex items-center gap-2 text-center">
                    <Trophy className="text-warning size-4" />
                    <div>
                      <div className="text-lg font-bold">14</div>
                      <div className="text-muted-foreground text-xs">最長記録</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">合計時間</CardTitle>
                <CardDescription>今週の記録</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24:35</div>
                <p className="text-muted-foreground mt-1 text-xs">先週比 +2:15</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">ローディング状態</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            CardTitle/Descriptionは実テキスト、データ部分のみSkeleton（GAFA準拠）
          </p>
          <Card className="max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="text-warning size-5" />
                連続日数
              </CardTitle>
              <CardDescription>継続は力なり</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">CardAction（右上アクション）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            CardHeader内にCardActionを配置。メニューボタン等。
          </p>
          <Card className="max-w-md">
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
              <p className="text-muted-foreground text-sm">プロジェクトの詳細説明。</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">フォーム用Card</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            認証フォーム等。CardContentのみ使用することも多い。
          </p>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>ログイン</CardTitle>
              <CardDescription>アカウントにログインします。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">キャンセル</Button>
              <Button>ログイン</Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">シンプルCard</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            CardContentのみ使用。pt-6でヘッダーなしの余白を確保。
          </p>
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p>シンプルなカード。ヘッダーとフッターなし。</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
          <div className="bg-surface-container rounded-lg p-4">
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Card - ルートコンテナ（bg-card, border, rounded-2xl）</li>
              <li>CardHeader - タイトル・説明エリア（px-6）</li>
              <li>CardTitle - タイトル（font-bold）</li>
              <li>CardDescription - 補足説明（text-muted-foreground）</li>
              <li>CardAction - 右上アクションスロット</li>
              <li>CardContent - メインコンテンツ（px-6）</li>
              <li>CardFooter - フッター（flex, px-6）</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>StreakCard, TotalTimeCard, SleepStatsCard - Stats表示</li>
            <li>LoginForm, SignupForm, PasswordResetForm - 認証フォーム</li>
            <li>各種チャートコンポーネント - データ可視化</li>
            <li>TagEditPage, TagMergePage - 設定画面</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};
