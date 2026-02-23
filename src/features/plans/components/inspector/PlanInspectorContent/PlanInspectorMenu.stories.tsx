import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { PlanInspectorMenu } from './PlanInspectorMenu';

/**
 * PlanInspectorMenu — プランのアクションメニュー
 *
 * ## Props
 * - `onDuplicate` — 複製アクション
 * - `onCopyId` — ID コピー
 * - `onDelete` — 削除（destructive）
 *
 * ## 使用箇所
 * - PlanInspectorContent のヘッダーメニュー
 */
interface MenuArgs {
  onDuplicate: () => void;
  onCopyId: () => void;
  onDelete: () => void;
}

const meta = {
  title: 'Features/Plans/PlanInspectorMenu',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onDuplicate: fn(),
    onCopyId: fn(),
    onDelete: fn(),
  },
} satisfies Meta<MenuArgs>;

export default meta;
type Story = StoryObj<MenuArgs>;

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function MenuWrapper(props: {
  onDuplicate: () => void;
  onCopyId: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          メニューを開く
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <PlanInspectorMenu {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** メニュー項目が正しく表示される */
export const Default: Story = {
  render: (args) => <MenuWrapper {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // メニューを開く
    const trigger = canvas.getByRole('button', { name: /メニューを開く/i });
    await userEvent.click(trigger);

    // ポータル経由のコンテンツを検証
    const body = within(document.body);
    await expect(body.getByText('複製する')).toBeInTheDocument();
    await expect(body.getByText('IDをコピー')).toBeInTheDocument();
    await expect(body.getByText('削除')).toBeInTheDocument();
  },
};

/** 複製をクリックするとonDuplicateが発火 */
export const ClickDuplicate: Story = {
  render: (args) => <MenuWrapper {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /メニューを開く/i }));

    const body = within(document.body);
    await userEvent.click(body.getByText('複製する'));

    await expect(args.onDuplicate).toHaveBeenCalledTimes(1);
  },
};

/** IDコピーをクリックするとonCopyIdが発火 */
export const ClickCopyId: Story = {
  render: (args) => <MenuWrapper {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /メニューを開く/i }));

    const body = within(document.body);
    await userEvent.click(body.getByText('IDをコピー'));

    await expect(args.onCopyId).toHaveBeenCalledTimes(1);
  },
};

/** 削除をクリックするとonDeleteが発火 */
export const ClickDelete: Story = {
  render: (args) => <MenuWrapper {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /メニューを開く/i }));

    const body = within(document.body);
    await userEvent.click(body.getByText('削除'));

    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Default</p>
        <MenuWrapper {...args} />
      </div>
    </div>
  ),
};
