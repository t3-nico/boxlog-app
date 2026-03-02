import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { Tag } from '../../types';

import { TagSortableTree } from './TagSortableTree';

/** TagSortableTree - ドラッグ&ドロップ対応タグツリー */
const meta = {
  title: 'Features/Tags/TagSortableTree',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Work',
    user_id: 'u1',
    color: '#3B82F6',
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-2',
    name: 'Meeting',
    user_id: 'u1',
    color: '#10B981',
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-3',
    name: 'Focus Time',
    user_id: 'u1',
    color: '#F59E0B',
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-4',
    name: 'Personal',
    user_id: 'u1',
    color: '#EF4444',
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-5',
    name: 'Exercise',
    user_id: 'u1',
    color: '#8B5CF6',
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-6',
    name: 'Reading',
    user_id: 'u1',
    color: '#EC4899',
    is_active: true,
    sort_order: 2,
    created_at: null,
    updated_at: null,
  },
];

/** フラットタグ（親タグのみ: tag-1, tag-4, tag-6） */
const flatMockTags = mockTags.filter((t) => ['tag-1', 'tag-4', 'tag-6'].includes(t.id));

const allVisibleTagIds = new Set(mockTags.map((t) => t.id));

const mockTagCounts: Record<string, number> = {
  'tag-1': 5,
  'tag-2': 3,
  'tag-3': 2,
  'tag-4': 4,
  'tag-5': 4,
  'tag-6': 1,
};

const mockParentTagCounts: Record<string, number> = {
  'tag-1': 10,
  'tag-4': 8,
};

const defaultCallbacks = {
  onToggleTag: fn(),
  onUpdateTag: fn(),
  onDeleteTag: fn(),
  onAddChildTag: fn(),
  onShowOnlyTag: fn(),
  onOpenMergeModal: fn(),
  onReorder: fn(),
};

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function TreeFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-[260px]">{children}</div>;
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 親子タグ構造（デフォルト） */
export const Default: Story = {
  render: () => (
    <TreeFrame>
      <TagSortableTree
        tags={mockTags}
        visibleTagIds={allVisibleTagIds}
        tagCounts={mockTagCounts}
        parentTagCounts={mockParentTagCounts}
        {...defaultCallbacks}
      />
    </TreeFrame>
  ),
};

/** 一部タグのみ表示 */
export const PartiallyVisible: Story = {
  render: () => (
    <TreeFrame>
      <TagSortableTree
        tags={mockTags}
        visibleTagIds={new Set(['tag-1', 'tag-2'])}
        tagCounts={mockTagCounts}
        parentTagCounts={mockParentTagCounts}
        {...defaultCallbacks}
      />
    </TreeFrame>
  ),
};

/** フラットタグのみ（子タグなし） */
export const FlatTags: Story = {
  render: () => (
    <TreeFrame>
      <TagSortableTree
        tags={flatMockTags}
        visibleTagIds={new Set(flatMockTags.map((t) => t.id))}
        tagCounts={mockTagCounts}
        parentTagCounts={{}}
        {...defaultCallbacks}
      />
    </TreeFrame>
  ),
};

/** 空（タグなし） */
export const Empty: Story = {
  render: () => (
    <TreeFrame>
      <TagSortableTree
        tags={[]}
        visibleTagIds={new Set()}
        tagCounts={{}}
        parentTagCounts={{}}
        {...defaultCallbacks}
      />
    </TreeFrame>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <TreeFrame>
        <TagSortableTree
          tags={mockTags}
          visibleTagIds={allVisibleTagIds}
          tagCounts={mockTagCounts}
          parentTagCounts={mockParentTagCounts}
          {...defaultCallbacks}
        />
      </TreeFrame>

      <TreeFrame>
        <TagSortableTree
          tags={flatMockTags}
          visibleTagIds={allVisibleTagIds}
          tagCounts={mockTagCounts}
          parentTagCounts={{}}
          {...defaultCallbacks}
        />
      </TreeFrame>

      <TreeFrame>
        <TagSortableTree
          tags={[]}
          visibleTagIds={new Set()}
          tagCounts={{}}
          parentTagCounts={{}}
          {...defaultCallbacks}
        />
      </TreeFrame>
    </div>
  ),
};
