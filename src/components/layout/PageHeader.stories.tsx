import type { Meta, StoryObj } from '@storybook/react-vite';

import { usePageTitleStore } from '@/features/navigation';

import { PageHeader } from './PageHeader';

/** PageHeader - 統合ページヘッダー */
const meta = {
  title: 'Components/Layout/PageHeader',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function PageHeaderWithTitle({ title }: { title: string }) {
  usePageTitleStore.setState({ title });
  return (
    <div className="border-border w-full border">
      <PageHeader />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** タイトル表示 */
export const Default: Story = {
  render: () => <PageHeaderWithTitle title="Plans" />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PageHeaderWithTitle title="Plans" />
      <PageHeaderWithTitle title="Records" />
      <PageHeaderWithTitle title="Stats" />
    </div>
  ),
};
