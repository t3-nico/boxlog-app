import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ReflectionSummary } from '../types';

import { ReflectionListCard } from './ReflectionListCard';

const meta = {
  title: 'Draft/Reflection/ReflectionListCard',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

const MOCK_SUMMARY: ReflectionSummary = {
  id: 'ref-1',
  date: '2026-02-17',
  title: '集中力が冴えた月曜日',
};

const MOCK_SUMMARY_LONG: ReflectionSummary = {
  id: 'ref-2',
  date: '2026-02-16',
  title: 'プロジェクトの大きなマイルストーンを達成した充実の一日で振り返りを書く',
};

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function CardFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-[280px]">{children}</div>;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 標準カード */
export const Default: Story = {
  render: () => (
    <CardFrame>
      <ReflectionListCard reflection={MOCK_SUMMARY} onClick={() => {}} />
    </CardFrame>
  ),
};

/** 長いタイトルの場合（line-clamp で省略） */
export const LongTitle: Story = {
  render: () => (
    <CardFrame>
      <ReflectionListCard reflection={MOCK_SUMMARY_LONG} onClick={() => {}} />
    </CardFrame>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Default</p>
        <CardFrame>
          <ReflectionListCard reflection={MOCK_SUMMARY} onClick={() => {}} />
        </CardFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Long Title</p>
        <CardFrame>
          <ReflectionListCard reflection={MOCK_SUMMARY_LONG} onClick={() => {}} />
        </CardFrame>
      </div>
    </div>
  ),
};
