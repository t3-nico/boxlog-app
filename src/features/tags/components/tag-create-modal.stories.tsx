import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

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
};
