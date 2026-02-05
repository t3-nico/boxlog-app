import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from './button';
import { FormDialog } from './form-dialog';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Components/FormDialog',
  component: FormDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'ダイアログのタイトル',
    },
    description: {
      control: 'text',
      description: '説明文',
    },
    submitDisabled: {
      control: 'boolean',
      description: '送信ボタンを無効化',
    },
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'ダイアログの最大幅',
    },
  },
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj;

/**
 * 基本形（title + description + submitDisabled）。
 * 実使用: display-name-dialog
 */
export const Default: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [name, setName] = useState('');

      return (
        <>
          <Button variant="outline" onClick={() => setOpen(true)}>
            表示名を変更
          </Button>
          <FormDialog
            open={open}
            onOpenChange={setOpen}
            onSubmit={() => setOpen(false)}
            title="表示名の変更"
            description="新しい表示名を入力してください。"
            submitDisabled={!name.trim()}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">表示名</Label>
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="名前を入力"
                />
              </div>
            </div>
          </FormDialog>
        </>
      );
    }
    return <Demo />;
  },
};

/**
 * 非同期送信でローディング表示。
 */
export const AsyncSubmit: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);

      const handleSubmit = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setOpen(false);
      };

      return (
        <>
          <Button variant="outline" onClick={() => setOpen(true)}>
            非同期送信
          </Button>
          <FormDialog
            open={open}
            onOpenChange={setOpen}
            onSubmit={handleSubmit}
            title="データを保存"
            description="確認ボタンを押すと2秒間ローディング状態になります。"
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="data">データ</Label>
                <Input id="data" placeholder="入力してください" />
              </div>
            </div>
          </FormDialog>
        </>
      );
    }
    return <Demo />;
  },
};
