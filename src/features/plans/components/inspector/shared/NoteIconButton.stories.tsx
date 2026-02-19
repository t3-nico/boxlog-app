import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { NoteIconButton } from './NoteIconButton';

/**
 * NoteIconButton — リッチテキスト編集アイコンボタン
 *
 * ## Props
 * - `id: string` — エディタのキー用ID
 * - `note: string` — HTML形式の内容
 * - `onNoteChange: (html: string) => void` — 変更コールバック
 * - `disabled?: boolean` — 無効化
 * - `labels?: { editTooltip, addTooltip, placeholder }` — カスタムラベル
 *
 * ## 内部エディタ
 * `SimpleDescriptionEditor` (Tiptap ベース)
 * - フォーマット: Bold, Italic, Underline, Link, List, OrderedList, TaskList
 * - 出力: HTML文字列
 *
 * ## 使用箇所
 * - **Plan Inspector** → `description` 編集（`plan.inspector.*` のlabelsを渡す）
 * - **Record Inspector** → `note` 編集（デフォルトの `common.note.*` を使用）
 *
 * ## 動作
 * - クリックで Popover 展開、リッチテキストエディタを表示
 * - 内容がある場合はアイコン右上に赤ドットインジケータ
 * - ツールチップで状態表示（内容あり: "編集", なし: "追加"）
 *
 * ## 保存方式
 * - Plan: 500ms デバウンスで即時保存（IMMEDIATE_SAVE_FIELDS）
 * - Record: 500ms デバウンスで即時保存
 */
const meta = {
  title: 'Features/Plans/NoteIconButton',
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

function NoteIconButtonStory({
  initialNote = '',
  disabled = false,
  labels,
}: {
  initialNote?: string;
  disabled?: boolean;
  labels?: {
    editTooltip?: string;
    addTooltip?: string;
    placeholder?: string;
  };
}) {
  const [note, setNote] = useState(initialNote);
  return (
    <NoteIconButton
      id="story"
      note={note}
      onNoteChange={setNote}
      disabled={disabled}
      {...(labels && { labels })}
    />
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

const SAMPLE_HTML =
  '<p>これは<strong>太字</strong>と<em>斜体</em>のテスト</p><ul><li>リスト項目1</li><li>リスト項目2</li></ul>';

/** メモなし — デフォルトラベル（common.note.*） */
export const Empty: Story = {
  render: () => <NoteIconButtonStory />,
};

/** メモあり — 赤ドットインジケータ表示 */
export const WithContent: Story = {
  render: () => <NoteIconButtonStory initialNote={SAMPLE_HTML} />,
};

/** Plan Inspector 用ラベル — description 編集として使用 */
export const PlanLabels: Story = {
  render: () => (
    <NoteIconButtonStory
      labels={{
        editTooltip: '説明を編集',
        addTooltip: '説明を追加',
        placeholder: '説明を追加...',
      }}
    />
  ),
};

/** Plan Inspector + 内容あり */
export const PlanWithContent: Story = {
  render: () => (
    <NoteIconButtonStory
      initialNote={SAMPLE_HTML}
      labels={{
        editTooltip: '説明を編集',
        addTooltip: '説明を追加',
        placeholder: '説明を追加...',
      }}
    />
  ),
};

/** 無効化状態 */
export const Disabled: Story = {
  render: () => <NoteIconButtonStory initialNote={SAMPLE_HTML} disabled />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8">
      {/* Record（デフォルトラベル） */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Record — デフォルトラベル</p>
        <div className="flex items-center gap-4">
          <NoteIconButtonStory />
          <NoteIconButtonStory initialNote={SAMPLE_HTML} />
          <NoteIconButtonStory initialNote={SAMPLE_HTML} disabled />
        </div>
      </div>

      {/* Plan（カスタムラベル） */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Plan — カスタムラベル</p>
        <div className="flex items-center gap-4">
          <NoteIconButtonStory
            labels={{
              editTooltip: '説明を編集',
              addTooltip: '説明を追加',
              placeholder: '説明を追加...',
            }}
          />
          <NoteIconButtonStory
            initialNote={SAMPLE_HTML}
            labels={{
              editTooltip: '説明を編集',
              addTooltip: '説明を追加',
              placeholder: '説明を追加...',
            }}
          />
        </div>
      </div>
    </div>
  ),
};
