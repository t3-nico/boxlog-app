import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReminderSelect } from './ReminderSelect';

/**
 * ReminderSelect - リマインダー選択コンポーネント（Popover ベース）
 *
 * ## Props
 * - `value: number | null` — リマインダー分数（null = 未設定）
 * - `onChange: (value: number | null) => void` — 選択変更コールバック
 * - `variant: 'inspector' | 'compact' | 'button' | 'icon'` — 表示バリエーション
 * - `disabled: boolean` — 無効化状態
 *
 * ## データソース
 * `REMINDER_OPTIONS` from `src/features/plans/utils/reminder.ts`
 * - null → なし (common.reminder.none)
 * - 0 → 開始時 (common.reminder.atStart)
 * - 10, 30, 60, 1440, 10080 → N分前〜1週間前
 *
 * ## Variant 使い分け
 * - `inspector` — Inspector Panel のサイドバーヘッダー（Ghost ボタン + テキスト）
 * - `icon` — DetailsTab ツールバー（Bell アイコン + ツールチップ、設定時テキスト表示）
 * - `button` — 設定画面やカード内（ボーダー付きボタン + ドロップダウン矢印）
 * - `compact` — リストビュー（Bell アイコンのみ、最小スペース）
 *
 * ## 動作
 * - クリックで Popover メニューを開く
 * - 選択済みオプションにチェックマーク (✓) を表示
 * - 「なし」と「開始時」の間に区切り線
 * - icon variant ではホバーでツールチップ表示
 */
const meta = {
  title: 'Features/Plans/ReminderSelect',
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

function ReminderSelectStory({
  initialValue = null,
  variant = 'inspector',
  disabled = false,
}: {
  initialValue?: number | null;
  variant?: 'inspector' | 'compact' | 'button' | 'icon';
  disabled?: boolean;
}) {
  const [value, setValue] = useState<number | null>(initialValue);
  return <ReminderSelect value={value} onChange={setValue} variant={variant} disabled={disabled} />;
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Inspector variant — リマインダー未設定 */
export const Default: Story = {
  render: () => <ReminderSelectStory />,
};

/** Inspector variant — 10分前を設定済み */
export const WithReminder: Story = {
  render: () => <ReminderSelectStory initialValue={10} />,
};

/** Compact variant — Bell アイコンのみ */
export const CompactVariant: Story = {
  render: () => <ReminderSelectStory variant="compact" />,
};

/** Compact variant — 設定済み */
export const CompactWithReminder: Story = {
  render: () => <ReminderSelectStory initialValue={30} variant="compact" />,
};

/** Button variant — ボーダー付き + ドロップダウン矢印 */
export const ButtonVariant: Story = {
  render: () => <ReminderSelectStory initialValue={30} variant="button" />,
};

/** Icon variant — アイコンのみ（ツールチップあり） */
export const IconVariant: Story = {
  render: () => <ReminderSelectStory variant="icon" />,
};

/** Icon variant — リマインダー設定済み（アイコン + テキスト） */
export const IconWithReminder: Story = {
  render: () => <ReminderSelectStory initialValue={60} variant="icon" />,
};

/** 無効化状態 */
export const Disabled: Story = {
  render: () => <ReminderSelectStory initialValue={10} disabled />,
};

/** 全 variant 一覧 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8">
      {/* Inspector */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Inspector variant</p>
        <div className="flex items-center gap-4">
          <ReminderSelectStory />
          <ReminderSelectStory initialValue={10} />
          <ReminderSelectStory initialValue={10} disabled />
        </div>
      </div>

      {/* Compact */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Compact variant</p>
        <div className="flex items-center gap-4">
          <ReminderSelectStory variant="compact" />
          <ReminderSelectStory initialValue={30} variant="compact" />
        </div>
      </div>

      {/* Button */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Button variant</p>
        <div className="flex items-center gap-4">
          <ReminderSelectStory variant="button" />
          <ReminderSelectStory initialValue={30} variant="button" />
        </div>
      </div>

      {/* Icon */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Icon variant</p>
        <div className="flex items-center gap-4">
          <ReminderSelectStory variant="icon" />
          <ReminderSelectStory initialValue={60} variant="icon" />
          <ReminderSelectStory initialValue={1440} variant="icon" />
        </div>
      </div>
    </div>
  ),
};
