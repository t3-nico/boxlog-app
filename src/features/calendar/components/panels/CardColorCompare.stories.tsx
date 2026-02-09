import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

/** Plan / Record カードの色比較（bg-container 上での見え方確認用） */
const meta = {
  title: 'Calendar/CardColorCompare',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function MockPlanCard({ title, time }: { title: string; time?: string }) {
  return (
    <Card
      className={cn(
        'group relative flex flex-row items-start gap-2 px-3 py-2',
        'bg-plan-box',
        'rounded-xl border-0 shadow-none',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors',
        'hover:after:bg-state-hover',
        'cursor-pointer',
      )}
    >
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <Circle className="text-muted-foreground h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground line-clamp-2 text-sm leading-tight font-normal">{title}</p>
        {time && <p className="text-muted-foreground mt-1 text-xs tabular-nums">{time}</p>}
      </div>
    </Card>
  );
}

function MockRecordCard({ title, time }: { title: string; time?: string }) {
  return (
    <Card
      className={cn(
        'group relative flex flex-row items-start gap-2 px-3 py-2',
        'bg-record-box',
        'rounded-xl border-0 shadow-none',
        'border-record-border rounded-l-none border-l-[3px]',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors',
        'hover:after:bg-state-hover',
        'cursor-pointer',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-foreground line-clamp-2 text-sm leading-tight font-normal">{title}</p>
        {time && <p className="text-muted-foreground mt-1 text-xs tabular-nums">{time}</p>}
      </div>
    </Card>
  );
}

/** bg-container 上に Plan / Record カードを並べて色比較 */
export const OnContainer: Story = {
  render: () => (
    <div className="bg-container min-h-screen p-4">
      <div className="mx-auto flex w-80 flex-col gap-2">
        <MockPlanCard title="朝のミーティング準備" time="9:00 - 9:30" />
        <MockPlanCard title="レポート作成" time="10:00 - 12:00" />
        <MockRecordCard title="チーム定例" time="13:00 - 14:00" />
        <MockPlanCard title="コードレビュー" />
        <MockRecordCard title="1on1" time="15:00 - 15:30" />
        <MockPlanCard title="完了済みタスク" time="16:00 - 17:00" />
      </div>
    </div>
  ),
};

/** bg-background 上（カレンダーグリッド相当）での見え方 */
export const OnBackground: Story = {
  render: () => (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto flex w-80 flex-col gap-2">
        <MockPlanCard title="朝のミーティング準備" time="9:00 - 9:30" />
        <MockPlanCard title="レポート作成" time="10:00 - 12:00" />
        <MockRecordCard title="チーム定例" time="13:00 - 14:00" />
        <MockPlanCard title="コードレビュー" />
        <MockRecordCard title="1on1" time="15:00 - 15:30" />
      </div>
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="bg-container w-80 rounded-lg p-4">
        <p className="text-muted-foreground mb-2 text-xs">on bg-container (side panel)</p>
        <div className="flex flex-col gap-2">
          <MockPlanCard title="Plan カード" time="9:00 - 10:00" />
          <MockRecordCard title="Record カード" time="10:00 - 11:00" />
        </div>
      </div>
      <div className="bg-background w-80 rounded-lg p-4">
        <p className="text-muted-foreground mb-2 text-xs">on bg-background (calendar grid)</p>
        <div className="flex flex-col gap-2">
          <MockPlanCard title="Plan カード" time="9:00 - 10:00" />
          <MockRecordCard title="Record カード" time="10:00 - 11:00" />
        </div>
      </div>
    </div>
  ),
};
