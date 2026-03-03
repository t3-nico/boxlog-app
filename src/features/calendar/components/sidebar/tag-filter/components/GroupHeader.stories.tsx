import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { GroupHeader } from './GroupHeader';

/**
 * コロン記法グループのヘッダー行。
 *
 * チェックボックス + グループ名 + シェブロン + メニュー + 件数で構成。
 * メニューには「タグ追加」「リネーム」「色変更」「グループ解除」「このグループだけ表示」「グループ削除」。
 */
const meta = {
  title: 'Features/Sidebar/TagFilter/GroupHeader',
  component: GroupHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    label: '開発',
    checked: true,
    indeterminate: false,
    count: 12,
    collapsed: false,
    displayColor: '#4CAF50',
    onCheckedChange: fn(),
    onToggleCollapse: fn(),
    onShowOnlyGroup: fn(),
    onColorChange: fn(),
    onAddTagToGroup: fn(),
    onRenameGroup: fn(),
    onUngroupTags: fn(),
    onDeleteGroup: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GroupHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 全タグが選択状態のグループヘッダー。 */
export const AllChecked: Story = {};

/** 一部タグのみ選択（indeterminate）。 */
export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
  },
};

/** 未選択状態。 */
export const Unchecked: Story = {
  args: {
    checked: false,
    indeterminate: false,
  },
};

/** 折りたたみ状態。シェブロンが右向き。 */
export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
};

/** 件数0のグループ。 */
export const ZeroCount: Story = {
  args: {
    count: 0,
  },
};

/** 長いグループ名。truncate が効く。 */
export const LongLabel: Story = {
  args: {
    label: 'とても長いグループ名が入った場合の表示確認用テスト',
  },
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-1">
      <GroupHeader
        label="開発"
        checked={true}
        indeterminate={false}
        count={12}
        collapsed={false}
        displayColor="#4CAF50"
        onCheckedChange={fn()}
        onToggleCollapse={fn()}
        onShowOnlyGroup={fn()}
        onColorChange={fn()}
        onAddTagToGroup={fn()}
        onRenameGroup={fn()}
        onUngroupTags={fn()}
        onDeleteGroup={fn()}
      />
      <GroupHeader
        label="デザイン"
        checked={false}
        indeterminate={true}
        count={5}
        collapsed={false}
        displayColor="#FF9800"
        onCheckedChange={fn()}
        onToggleCollapse={fn()}
        onShowOnlyGroup={fn()}
        onColorChange={fn()}
        onAddTagToGroup={fn()}
        onRenameGroup={fn()}
        onUngroupTags={fn()}
        onDeleteGroup={fn()}
      />
      <GroupHeader
        label="マーケティング"
        checked={false}
        indeterminate={false}
        count={3}
        collapsed={true}
        displayColor="#2196F3"
        onCheckedChange={fn()}
        onToggleCollapse={fn()}
        onShowOnlyGroup={fn()}
        onColorChange={fn()}
        onAddTagToGroup={fn()}
        onRenameGroup={fn()}
        onUngroupTags={fn()}
        onDeleteGroup={fn()}
      />
    </div>
  ),
};
