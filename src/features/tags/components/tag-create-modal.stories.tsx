import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@/components/ui/button';

import { TagCreateModal } from './tag-create-modal';

/** TagCreateModal - タグ作成モーダル */
const meta = {
  title: 'Features/Tags/TagCreateModal',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function TagCreateModalStory() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>タグを作成</Button>
      <TagCreateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={async (data) => {
          fn()(data);
          // 擬似的な保存遅延
          await new Promise((resolve) => setTimeout(resolve, 500));
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** ボタンクリックでモーダルを開く */
export const Default: Story = {
  render: () => <TagCreateModalStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ボタンをクリックしてモーダルを開く
    const openButton = canvas.getByRole('button', { name: /タグを作成/i });
    await userEvent.click(openButton);

    // モーダルが開いたことを確認（ポータル経由）
    const body = within(document.body);
    await expect(body.getByText(/タグ名/i)).toBeInTheDocument();
  },
};

/** 初期表示（モーダルが開いた状態） */
export const OpenState: Story = {
  render: () => (
    <TagCreateModal
      isOpen
      onClose={fn()}
      onSave={async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }}
    />
  ),
  play: async () => {
    // モーダルはポータル経由でレンダリング
    const body = within(document.body);

    // モーダルが表示されていてフィールドが確認できる
    await expect(body.getByText(/タグ名/i)).toBeInTheDocument();
  },
};
