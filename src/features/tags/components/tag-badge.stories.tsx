import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Tag } from '../types';

import { TagBadge } from './tag-badge';

// モックタグデータ
const workTag: Tag = {
  id: '1',
  name: '仕事',
  color: 'blue',
  user_id: 'user-1',
  is_active: true,
  sort_order: 0,
  created_at: null,
  updated_at: null,
};

const privateTag: Tag = {
  id: '2',
  name: 'プライベート',
  color: 'green',
  user_id: 'user-1',
  is_active: true,
  sort_order: 1,
  created_at: null,
  updated_at: null,
};

const studyTag: Tag = {
  id: '3',
  name: '勉強',
  color: 'violet',
  user_id: 'user-1',
  is_active: true,
  sort_order: 2,
  created_at: null,
  updated_at: null,
};

const exerciseTag: Tag = {
  id: '4',
  name: '運動',
  color: 'orange',
  user_id: 'user-1',
  is_active: true,
  sort_order: 3,
  created_at: null,
  updated_at: null,
};

const mockTags = [workTag, privateTag, studyTag, exerciseTag];

/**
 * TagBadge - タグ表示バッジ
 *
 * ## デザイン
 *
 * - **スタイル**: アウトライン（ボーダーのみ）
 * - **ボーダー色**: タグのカラー
 * - **高さ**: 28px（h-7）
 *
 * ## 使用箇所
 *
 * - InlineTagList（Inspector内）
 * - TagsCell（テーブル内）
 * - TagSelectCombobox（選択UI）
 *
 * ## 注意
 *
 * アイコン表示やサイズバリエーションは廃止。
 * シンプルなアウトラインバッジに統一。
 */
const meta = {
  title: 'Features/Tags/TagBadge',
  component: TagBadge,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof TagBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tag: workTag,
  },
};

export const AllPatterns: Story = {
  args: {
    tag: workTag,
  },
  render: () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">TagBadge - 実使用パターン</h1>

      {/* 基本表示 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">基本表示</h2>
        <p className="text-muted-foreground mb-4 text-sm">タグのカラーをボーダーに使用</p>
        <div className="flex flex-wrap items-center gap-2">
          {mockTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </section>

      {/* クリック可能（ホバー状態） */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">クリック可能</h2>
        <p className="text-muted-foreground mb-4 text-sm">onClickを渡すとホバーで背景色が変わる</p>
        <div className="flex flex-wrap items-center gap-2">
          {mockTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onClick={() => alert(`クリック: ${tag.name}`)} />
          ))}
        </div>
      </section>

      {/* Tooltip */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Tooltip</h2>
        <p className="text-muted-foreground mb-4 text-sm">descriptionがあればホバーでtooltip表示</p>
        <div className="flex flex-wrap items-center gap-2">
          <TagBadge tag={workTag} />
          <TagBadge tag={privateTag} />
          <TagBadge tag={studyTag} />
        </div>
      </section>

      {/* 削除ボタン付き */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">削除ボタン付き</h2>
        <p className="text-muted-foreground mb-4 text-sm">onRemoveを渡すと×ボタンが表示される</p>
        <div className="flex flex-wrap items-center gap-2">
          {mockTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onRemove={() => alert(`削除: ${tag.name}`)} />
          ))}
        </div>
      </section>

      {/* カラーバリエーション */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">カラーバリエーション</h2>
        <p className="text-muted-foreground mb-4 text-sm">tag.colorで動的に色が変わる</p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { ...workTag, color: 'red', name: '赤' },
            { ...workTag, color: 'orange', name: 'オレンジ' },
            { ...workTag, color: 'amber', name: '黄' },
            { ...workTag, color: 'green', name: '緑' },
            { ...workTag, color: 'blue', name: '青' },
            { ...workTag, color: 'violet', name: '紫' },
            { ...workTag, color: 'pink', name: 'ピンク' },
          ].map((tag, i) => (
            <TagBadge key={i} tag={tag} />
          ))}
        </div>
      </section>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
