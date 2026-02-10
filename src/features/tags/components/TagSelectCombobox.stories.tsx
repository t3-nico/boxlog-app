'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Tags } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Tag } from '@/features/tags/types';

import { TagSelectCombobox } from './TagSelectCombobox';

/** TagSelectCombobox - タグ選択コンボボックス */
const meta = {
  title: 'Features/Tags/TagSelectCombobox',
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
    id: 'parent-1',
    name: '仕事',
    color: '#3b82f6',
    icon: '💼',
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: null,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'child-1',
    name: 'ミーティング',
    color: '#60a5fa',
    icon: null,
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: 'parent-1',
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'child-2',
    name: 'コーディング',
    color: '#2563eb',
    icon: null,
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: 'parent-1',
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-private',
    name: 'プライベート',
    color: '#22c55e',
    icon: '🏠',
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: null,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-study',
    name: '勉強',
    color: '#a855f7',
    icon: '📚',
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: null,
    sort_order: 2,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-exercise',
    name: '運動',
    color: '#f97316',
    icon: '🏃',
    user_id: 'user-1',
    description: null,
    is_active: true,
    parent_id: null,
    sort_order: 3,
    created_at: null,
    updated_at: null,
  },
];

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function TagSelectStory({ initialSelectedIds = [] }: { initialSelectedIds?: string[] }) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedIds);

  return (
    <div className="space-y-2">
      <TagSelectCombobox
        selectedTagIds={selectedTagIds}
        onTagsChange={setSelectedTagIds}
        availableTags={mockTags}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Tags className="size-4" />
          タグを選択 ({selectedTagIds.length})
        </Button>
      </TagSelectCombobox>
      <p className="text-muted-foreground text-xs">
        選択中: {selectedTagIds.length > 0 ? selectedTagIds.join(', ') : 'なし'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 未選択状態 */
export const Default: Story = {
  render: () => <TagSelectStory />,
};

/** 選択済み状態 */
export const WithSelectedTags: Story = {
  render: () => <TagSelectStory initialSelectedIds={['parent-1', 'tag-study']} />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <TagSelectStory />
      <TagSelectStory initialSelectedIds={['parent-1', 'tag-study']} />
      <TagSelectStory initialSelectedIds={['child-1', 'child-2']} />
    </div>
  ),
};
