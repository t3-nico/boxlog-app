import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';

import { useRecurringEditConfirmStore } from '../stores/useRecurringEditConfirmStore';

import { RecurringEditConfirmDialog } from './RecurringEditConfirmDialog';

/** RecurringEditConfirmDialog - 繰り返しプランのスコープ選択ダイアログ */
const meta = {
  title: 'Features/Plans/RecurringEditConfirmDialog',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function ConfirmDialogStory({ mode }: { mode: 'edit' | 'delete' }) {
  const openDialog = useRecurringEditConfirmStore((s) => s.openDialog);

  const handleOpen = () => {
    openDialog('テストプラン', mode, async (scope) => {
      window.alert(`選択: ${scope}`);
    });
  };

  // Story表示時に自動で開く
  useEffect(() => {
    handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Button onClick={handleOpen}>ダイアログを開く</Button>
      <RecurringEditConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 編集モード（このイベントのみ / 以降すべて / すべて） */
export const EditMode: Story = {
  render: () => <ConfirmDialogStory mode="edit" />,
};

/** 削除モード（破壊的操作） */
export const DeleteMode: Story = {
  render: () => <ConfirmDialogStory mode="delete" />,
};
