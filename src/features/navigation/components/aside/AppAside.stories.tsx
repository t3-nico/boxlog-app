import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { AppAside } from '@/components/layout/AppAside';

/** AppAside - アプリケーション共通アサイド */
const meta = {
  title: 'Features/Aside/Overview',
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

function AsideFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[500px] w-[320px] border">{children}</div>;
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Chatパネル */
export const ChatPanel: Story = {
  render: () => (
    <AsideFrame>
      <AppAside asideType="chat" onAsideChange={fn()} />
    </AsideFrame>
  ),
};
