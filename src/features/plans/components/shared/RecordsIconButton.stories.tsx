import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, ListChecks, Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * RecordsIconButton — Record紐付けアイコンボタン
 *
 * ## 概要
 * Plan Inspector の Row 3 で使用。TagsIconButton と同じ Badge + X パターン。
 *
 * ## UIパターン
 * - **Badge表示**: 紐付き Record をインライン Badge で表示（X で解除）
 * - **Popover**: 全 Record を統一リストで表示（左チェックボックスでトグル）
 *   - 紐付き済み Record が上にソート
 *   - 検索フィルタ対応（タイトル・日付）
 *   - 「作業ログを追加」で新規 Record 作成（plan_id プリセット）
 *
 * ## チェックボックス配置の設計判断
 * - **左チェック** = マルチセレクト・トグル（TagSelectCombobox 準拠）
 * - **右チェック** = シングルセレクト（Select.tsx, ReminderSelect 準拠）
 * - Record紐付けはマルチセレクトのため左チェックを採用
 *
 * ## 実コンポーネントについて
 * 実際の `RecordsIconButton` は tRPC + Zustand に依存。
 * この Story は UI パターンを静的に再現したもの。
 */
const meta = {
  title: 'Features/Plans/RecordsIconButton',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// モックデータ
// ─────────────────────────────────────────────────────────

interface MockRecord {
  id: string;
  title: string | null;
  worked_at: string;
  tagIds: string[];
}

interface MockTag {
  id: string;
  name: string;
  color: string;
}

const mockTags: MockTag[] = [
  { id: 'tag-1', name: '開発', color: '#3B82F6' },
  { id: 'tag-2', name: 'MTG', color: '#EF4444' },
  { id: 'tag-3', name: 'レビュー', color: '#10B981' },
];

const mockRecords: MockRecord[] = [
  { id: 'rec-1', title: 'API設計レビュー', worked_at: '2024-01-15', tagIds: ['tag-1', 'tag-3'] },
  { id: 'rec-2', title: 'スプリント計画', worked_at: '2024-01-15', tagIds: ['tag-2'] },
  { id: 'rec-3', title: 'バグ修正 #123', worked_at: '2024-01-14', tagIds: ['tag-1'] },
  { id: 'rec-4', title: null, worked_at: '2024-01-14', tagIds: [] },
  {
    id: 'rec-5',
    title: 'デプロイ作業',
    worked_at: '2024-01-13',
    tagIds: ['tag-1', 'tag-2', 'tag-3'],
  },
];

// ─────────────────────────────────────────────────────────
// ヘルパーコンポーネント
// ─────────────────────────────────────────────────────────

/** Badge 表示（紐付き Record） */
function RecordBadges({
  records,
  onUnlink,
  disabled = false,
}: {
  records: MockRecord[];
  onUnlink: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <>
      {records.map((record) => (
        <Badge
          key={record.id}
          variant="outline"
          className="h-7 gap-1 bg-transparent text-xs font-normal"
        >
          <span className="max-w-20 truncate">{record.title || '(タイトルなし)'}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnlink(record.id);
              }}
              className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
              aria-label="Record紐付けを解除"
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}
    </>
  );
}

/** Popover 内のチェックボックスリスト */
function RecordCheckboxList({
  records,
  linkedIds,
  onToggle,
}: {
  records: MockRecord[];
  linkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (r.title?.toLowerCase() ?? '').includes(q) || r.worked_at.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const aLinked = linkedIds.has(a.id);
    const bLinked = linkedIds.has(b.id);
    if (aLinked && !bLinked) return -1;
    if (!aLinked && bLinked) return 1;
    return 0;
  });

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Recordを検索..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList className="max-h-[280px]">
        <CommandEmpty>一致するRecordがありません</CommandEmpty>
        <CommandGroup>
          {sorted.map((record) => {
            const isLinked = linkedIds.has(record.id);
            const recordTags = record.tagIds
              .map((id) => mockTags.find((t) => t.id === id))
              .filter(Boolean);
            return (
              <CommandItem
                key={record.id}
                value={record.id}
                onSelect={() => onToggle(record.id)}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border',
                    isLinked ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                  )}
                >
                  {isLinked && <Check className="size-3 text-white" />}
                </div>
                <span className="shrink truncate">
                  {record.title || <span className="text-muted-foreground">(タイトルなし)</span>}
                </span>
                {recordTags.length > 0 && (
                  <div className="flex shrink-0 gap-1 pl-2">
                    {recordTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag!.id}
                        className="rounded px-1 py-1 text-xs"
                        style={{
                          backgroundColor: `${tag!.color}20`,
                          color: tag!.color,
                        }}
                      >
                        {tag!.name}
                      </span>
                    ))}
                    {recordTags.length > 2 && (
                      <span className="text-muted-foreground text-xs">
                        +{recordTags.length - 2}
                      </span>
                    )}
                  </div>
                )}
                <span className="text-muted-foreground ml-auto shrink-0 pl-2 text-xs">
                  {record.worked_at}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      <div className="border-border border-t p-2">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
        >
          <Plus className="size-4" />
          <span>作業ログを追加</span>
        </button>
      </div>
    </Command>
  );
}

// ─────────────────────────────────────────────────────────
// インタラクティブラッパー
// ─────────────────────────────────────────────────────────

function RecordsIconButtonStory({
  initialLinkedIds = [],
  disabled = false,
}: {
  initialLinkedIds?: string[];
  disabled?: boolean;
}) {
  const [linkedIds, setLinkedIds] = useState(new Set(initialLinkedIds));
  const [isOpen, setIsOpen] = useState(false);

  const linkedRecords = mockRecords.filter((r) => linkedIds.has(r.id));

  const handleToggle = (id: string) => {
    setLinkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUnlink = (id: string) => {
    setLinkedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <RecordBadges records={linkedRecords} onUnlink={handleUnlink} disabled={disabled} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <HoverTooltip content="Recordを紐付け" side="top">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Recordを紐付け"
            >
              <ListChecks className="size-4" />
            </button>
          </PopoverTrigger>
        </HoverTooltip>
        <PopoverContent className="w-[400px] p-0" align="start" side="bottom" sideOffset={8}>
          <RecordCheckboxList records={mockRecords} linkedIds={linkedIds} onToggle={handleToggle} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 紐付き Record なし — アイコンボタンのみ */
export const Default: Story = {
  render: () => <RecordsIconButtonStory />,
};

/** 紐付き Record あり — Badge + X で表示 */
export const WithLinkedRecords: Story = {
  render: () => <RecordsIconButtonStory initialLinkedIds={['rec-1', 'rec-2']} />,
};

/** 3件紐付き — Badge が複数行に折り返し */
export const ManyLinkedRecords: Story = {
  render: () => <RecordsIconButtonStory initialLinkedIds={['rec-1', 'rec-2', 'rec-3']} />,
};

/** 無効化状態 — Badge の X ボタンが非表示 */
export const Disabled: Story = {
  render: () => <RecordsIconButtonStory initialLinkedIds={['rec-1']} disabled />,
};

/** Popover 展開状態 — チェックボックスリストの見た目確認 */
export const PopoverOpen: Story = {
  render: () => {
    const [linkedIds, setLinkedIds] = useState(new Set(['rec-1', 'rec-3']));
    const linkedRecords = mockRecords.filter((r) => linkedIds.has(r.id));

    const handleToggle = (id: string) => {
      setLinkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    return (
      <div className="flex gap-8">
        {/* Badge 表示 */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">Badge 表示</p>
          <div className="flex flex-wrap items-center gap-1">
            {linkedRecords.map((record) => (
              <Badge
                key={record.id}
                variant="outline"
                className="h-7 gap-1 bg-transparent text-xs font-normal"
              >
                <span className="max-w-20 truncate">{record.title || '(タイトルなし)'}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(record.id)}
                  className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Popover リスト */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">Popover リスト</p>
          <div className="border-border w-[400px] overflow-hidden rounded-lg border">
            <RecordCheckboxList
              records={mockRecords}
              linkedIds={linkedIds}
              onToggle={handleToggle}
            />
          </div>
        </div>
      </div>
    );
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">紐付きなし</p>
        <RecordsIconButtonStory />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">紐付きあり（2件）</p>
        <RecordsIconButtonStory initialLinkedIds={['rec-1', 'rec-2']} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">紐付きあり（3件）</p>
        <RecordsIconButtonStory initialLinkedIds={['rec-1', 'rec-2', 'rec-3']} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">無効化</p>
        <RecordsIconButtonStory initialLinkedIds={['rec-1']} disabled />
      </div>
    </div>
  ),
};
