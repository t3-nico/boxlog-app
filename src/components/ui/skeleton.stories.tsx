import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    animation: {
      control: 'select',
      options: ['pulse', 'shimmer'],
      description: 'アニメーションタイプ',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const Pulse: Story = {
  render: () => <Skeleton animation="pulse" className="h-4 w-48" />,
};

export const Shimmer: Story = {
  render: () => <Skeleton animation="shimmer" className="h-4 w-48" />,
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-lg w-80">
      <Skeleton className="h-32 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const TableSkeleton: Story = {
  render: () => (
    <div className="w-96">
      <div className="flex gap-4 mb-4 pb-4 border-b border-border">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-6 w-64">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-4 mt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Skeleton - 全バリエーション</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-semibold mb-4">アニメーションタイプ</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">pulse（デフォルト）</p>
              <Skeleton animation="pulse" className="h-8 w-48" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">shimmer</p>
              <Skeleton animation="shimmer" className="h-8 w-48" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">カードスケルトン</h2>
          <div className="flex flex-col gap-4 p-4 border border-border rounded-lg max-w-xs">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">リストスケルトン</h2>
          <div className="space-y-3 max-w-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用ガイドライン</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>実際のコンテンツと同じレイアウト・サイズにする</li>
            <li>shimmerは高級感があり、pulseより速く感じられる</li>
            <li>motion-reduceの場合はアニメーションなし</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
