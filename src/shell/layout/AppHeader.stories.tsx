import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppHeader } from './AppHeader';

/** AppHeader - アプリ共通ヘッダーシェル */
const meta = {
  title: 'Primitives/Layout/AppHeader',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** タイトル表示（通常ページ） */
export const Default: Story = {
  render: () => (
    <div className="border-border w-full border">
      <AppHeader>
        <h1 className="truncate text-lg leading-8 font-bold">Plans</h1>
      </AppHeader>
    </div>
  ),
};

/** モバイル表示。viewport addon で md:hidden / hidden md:flex が自動切替。 */
export const Mobile: Story = {
  render: () => (
    <div className="border-border w-full border">
      <AppHeader>
        <h1 className="truncate text-lg leading-8 font-bold">Plans</h1>
      </AppHeader>
    </div>
  ),
  globals: {
    viewport: { value: 'mobile1' },
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="border-border w-full border">
        <AppHeader>
          <h1 className="truncate text-lg leading-8 font-bold">Plans</h1>
        </AppHeader>
      </div>
      <div className="border-border w-full border">
        <AppHeader>
          <h1 className="truncate text-lg leading-8 font-bold">Records</h1>
        </AppHeader>
      </div>
      <div className="border-border w-full border">
        <AppHeader>
          <h1 className="truncate text-lg leading-8 font-bold">Stats</h1>
        </AppHeader>
      </div>
    </div>
  ),
};
