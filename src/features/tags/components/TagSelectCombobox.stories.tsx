import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tags } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Tag } from '../types';

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
    user_id: 'user-1',
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'child-1',
    name: 'ミーティング',
    color: '#60a5fa',
    user_id: 'user-1',
    is_active: true,
    sort_order: 0,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'child-2',
    name: 'コーディング',
    color: '#2563eb',
    user_id: 'user-1',
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-private',
    name: 'プライベート',
    color: '#22c55e',
    user_id: 'user-1',
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-study',
    name: '勉強',
    color: '#a855f7',
    user_id: 'user-1',
    is_active: true,
    sort_order: 2,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-exercise',
    name: '運動',
    color: '#f97316',
    user_id: 'user-1',
    is_active: true,
    sort_order: 3,
    created_at: null,
    updated_at: null,
  },
];

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function TagSelectStory({
  initialSelectedId = null as string | null,
}: {
  initialSelectedId?: string | null;
}) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(initialSelectedId);

  return (
    <div className="space-y-2">
      <TagSelectCombobox
        selectedTagId={selectedTagId}
        onTagChange={setSelectedTagId}
        availableTags={mockTags}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Tags className="size-4" />
          タグを選択 {selectedTagId ? '(1)' : '(0)'}
        </Button>
      </TagSelectCombobox>
      <p className="text-muted-foreground text-xs">選択中: {selectedTagId ?? 'なし'}</p>
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
export const WithSelectedTag: Story = {
  render: () => <TagSelectStory initialSelectedId="parent-1" />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <TagSelectStory />
      <TagSelectStory initialSelectedId="parent-1" />
      <TagSelectStory initialSelectedId="tag-study" />
    </div>
  ),
};
