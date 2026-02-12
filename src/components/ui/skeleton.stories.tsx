import type { Meta, StoryObj } from '@storybook/react-vite';

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

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
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
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="border-border rounded-lg border">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-border flex h-12 items-center border-b last:border-b-0">
            <div className="flex w-12 shrink-0 justify-end pr-2">
              <Skeleton className="h-3 w-6" />
            </div>
            <div className="flex-1 px-2">{i === 1 && <Skeleton className="h-8" />}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
