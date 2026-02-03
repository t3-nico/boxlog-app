import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AlertDialogConfirm } from './alert-dialog-confirm';
import { Button } from './button';

const meta = {
  title: 'Components/AlertDialogConfirm',
  component: AlertDialogConfirm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'ボタンのバリアント',
    },
  },
} satisfies Meta<typeof AlertDialogConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultDialog() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>確認ダイアログを開く</Button>
        <AlertDialogConfirm
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
          title="確認"
          description="この操作を実行してもよろしいですか？"
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: function DestructiveDialog() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          削除
        </Button>
        <AlertDialogConfirm
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
          title="削除の確認"
          description="このアイテムを削除すると、元に戻すことはできません。本当に削除しますか？"
          confirmText="削除する"
          cancelText="キャンセル"
          variant="destructive"
        />
      </>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsDialog() {
    const [defaultOpen, setDefaultOpen] = useState(false);
    const [destructiveOpen, setDestructiveOpen] = useState(false);

    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">AlertDialogConfirm - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">標準</h2>
            <Button onClick={() => setDefaultOpen(true)}>確認</Button>
            <AlertDialogConfirm
              open={defaultOpen}
              onOpenChange={setDefaultOpen}
              onConfirm={() => setDefaultOpen(false)}
              title="確認"
              description="この操作を実行しますか？"
            />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">破壊的アクション（削除確認）</h2>
            <p className="text-sm text-muted-foreground mb-4">
              PlanViewTabs.tsxで使用されているパターン
            </p>
            <Button variant="destructive" onClick={() => setDestructiveOpen(true)}>
              ビューを削除
            </Button>
            <AlertDialogConfirm
              open={destructiveOpen}
              onOpenChange={setDestructiveOpen}
              onConfirm={() => setDestructiveOpen(false)}
              title="ビューの削除"
              description="このビューを削除しますか？この操作は取り消せません。"
              confirmText="削除"
              cancelText="キャンセル"
              variant="destructive"
            />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">使用Props</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li><code>open</code> / <code>onOpenChange</code> - 開閉制御</li>
              <li><code>onConfirm</code> - 確認時のコールバック</li>
              <li><code>title</code> / <code>description</code> - タイトルと説明</li>
              <li><code>confirmText</code> / <code>cancelText</code> - ボタンテキスト</li>
              <li><code>variant="destructive"</code> - 削除系の操作用</li>
            </ul>
          </section>

          <section className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> isLoadingは現在未使用
            </p>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
