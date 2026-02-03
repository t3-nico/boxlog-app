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
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
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

export const CustomTexts: Story = {
  render: function CustomTextsDialog() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          ログアウト
        </Button>
        <AlertDialogConfirm
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
          title="ログアウトしますか？"
          description="保存されていない変更がある場合は失われます。"
          confirmText="ログアウト"
          cancelText="キャンセル"
        />
      </>
    );
  },
};

export const Loading: Story = {
  render: function LoadingDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
      setIsLoading(true);
      // 擬似的な処理
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setOpen(false);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>処理を実行</Button>
        <AlertDialogConfirm
          open={open}
          onOpenChange={setOpen}
          onConfirm={handleConfirm}
          title="処理の確認"
          description="この処理を実行しますか？"
          confirmText="実行"
          cancelText="キャンセル"
          isLoading={isLoading}
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
        <h1 className="text-2xl font-bold mb-8">AlertDialogConfirm - 全バリエーション</h1>

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
            <h2 className="text-lg font-semibold mb-4">破壊的アクション</h2>
            <Button variant="destructive" onClick={() => setDestructiveOpen(true)}>
              削除
            </Button>
            <AlertDialogConfirm
              open={destructiveOpen}
              onOpenChange={setDestructiveOpen}
              onConfirm={() => setDestructiveOpen(false)}
              title="削除の確認"
              description="完全に削除されます。この操作は取り消せません。"
              confirmText="削除する"
              cancelText="やめる"
              variant="destructive"
            />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">使用場面</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>データの削除確認</li>
              <li>ログアウト確認</li>
              <li>重要な設定変更</li>
              <li>取り消せない操作の警告</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Props</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li><code>open</code> / <code>onOpenChange</code> - 開閉制御</li>
              <li><code>onConfirm</code> - 確認時のコールバック</li>
              <li><code>title</code> / <code>description</code> - タイトルと説明</li>
              <li><code>confirmText</code> / <code>cancelText</code> - ボタンテキスト</li>
              <li><code>variant</code> - default | destructive</li>
              <li><code>isLoading</code> - ローディング状態</li>
            </ul>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
