import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Skeleton</h1>
      <p className="text-muted-foreground mb-8">
        ローディング中のプレースホルダー（pulseアニメーション）
      </p>

      <div className="grid max-w-2xl gap-8">
        <div>
          <h2 className="mb-2 text-lg font-bold">ページレイアウト</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            loading.tsx で使用。ページ構造を維持してCLSを防止。
          </p>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-[80px]" />
              <Skeleton className="h-[80px]" />
              <Skeleton className="h-[80px]" />
            </div>
            <Skeleton className="h-[120px] w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">Card内スケルトン</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            StreakCard.tsx 等で使用。isPending時のフォールバック。
          </p>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">テキスト行</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            テキストコンテンツのプレースホルダー。最終行は短く。
          </p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">時間グリッド</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            CalendarViewSkeleton.tsx で使用。カレンダーの時間枠。
          </p>
          <div className="border-border rounded-lg border">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border flex h-12 items-center border-b last:border-b-0"
              >
                <div className="flex w-12 shrink-0 justify-end pr-2">
                  <Skeleton className="h-3 w-6" />
                </div>
                <div className="flex-1 px-2">{i === 1 && <Skeleton className="h-8" />}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>loading.tsx - ページ遷移時のフォールバック</li>
            <li>StreakCard.tsx, TotalTimeCard.tsx 等 - データ取得中</li>
            <li>CalendarViewSkeleton.tsx - カレンダービュー</li>
            <li>LoadingStates.tsx - SkeletonText, SkeletonCard等の合成</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Props</h2>
          <div className="bg-surface-container rounded-lg p-4">
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>className - h-*（高さ）とw-*（幅）を指定</li>
              <li>rounded-full - 円形にする場合</li>
              <li>animation - pulse（デフォルト）/ shimmer（未使用）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};
