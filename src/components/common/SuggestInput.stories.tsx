import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * SuggestInput は tRPC (suggestions.recentTitles) に依存するため、
 * Storybook ではビジュアルモックで UI パターンを再現する。
 */

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Components/SuggestInput',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

interface MockSuggestion {
  title: string;
  tagIds: string[];
}

interface MockTag {
  id: string;
  name: string;
  color: string;
}

const mockTags: MockTag[] = [
  { id: 'tag-1', name: '仕事', color: '#3B82F6' },
  { id: 'tag-2', name: '重要', color: '#EF4444' },
  { id: 'tag-3', name: '個人', color: '#10B981' },
  { id: 'tag-4', name: '定例', color: '#8B5CF6' },
  { id: 'tag-5', name: '勉強', color: '#F59E0B' },
];

const mockSuggestions: MockSuggestion[] = [
  { title: 'チームミーティング', tagIds: ['tag-1', 'tag-4'] },
  { title: '日報作成', tagIds: ['tag-1'] },
  { title: '読書', tagIds: ['tag-3'] },
  { title: '英語学習', tagIds: ['tag-3', 'tag-5'] },
  { title: 'コードレビュー', tagIds: ['tag-1', 'tag-2'] },
  { title: 'ランチ', tagIds: [] },
  { title: '1on1ミーティング', tagIds: ['tag-1', 'tag-4', 'tag-2', 'tag-5'] },
];

// ---------------------------------------------------------------------------
// ビジュアルモックコンポーネント
// ---------------------------------------------------------------------------

function MockSuggestInput({
  suggestions,
  initialValue = '',
  initialOpen = false,
  onSelect,
}: {
  suggestions: MockSuggestion[];
  initialValue?: string;
  initialOpen?: boolean;
  onSelect?: (entry: MockSuggestion) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedEntry, setSelectedEntry] = useState<MockSuggestion | null>(null);

  const tagMap = useMemo(() => new Map(mockTags.map((t) => [t.id, t])), []);

  const filtered = useMemo(() => {
    if (!value) return suggestions;
    const query = value.toLowerCase();
    return suggestions.filter((s) => s.title.toLowerCase().includes(query));
  }, [suggestions, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsOpen(true);
    setSelectedEntry(null);
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions]);

  const handleSelect = useCallback(
    (title: string) => {
      const entry = suggestions.find((s) => s.title === title);
      if (entry) {
        setValue(entry.title);
        setSelectedEntry(entry);
        onSelect?.(entry);
      }
      setIsOpen(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [suggestions, onSelect],
  );

  const hasSuggestions = filtered.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen && hasSuggestions} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder="タイトルを追加"
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && isOpen) {
                e.stopPropagation();
                setIsOpen(false);
              }
            }}
            maxLength={200}
            className="placeholder:text-muted-foreground block w-full border-0 bg-transparent text-xl font-bold outline-none"
            autoComplete="off"
          />
        </PopoverAnchor>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[240px]">
              <CommandEmpty>候補なし</CommandEmpty>
              <CommandGroup heading="最近の履歴">
                {filtered.map((entry) => (
                  <CommandItem
                    key={entry.title}
                    value={entry.title}
                    onSelect={handleSelect}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium">{entry.title}</span>
                    {entry.tagIds.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1">
                        {entry.tagIds.slice(0, 3).map((tagId) => {
                          const tag = tagMap.get(tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className="text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]"
                              style={{ borderColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        {entry.tagIds.length > 3 && (
                          <span className="text-muted-foreground text-[10px]">
                            +{entry.tagIds.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 選択結果のフィードバック（Story用） */}
      {selectedEntry && (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>選択済み:</span>
          <span className="text-foreground font-medium">{selectedEntry.title}</span>
          {selectedEntry.tagIds.length > 0 && <span>+ タグ {selectedEntry.tagIds.length}件</span>}
        </div>
      )}
    </div>
  );
}

/** Inspector風コンテナ */
function InspectorFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-muted-foreground text-xs">{label}</p>}
      <div className={cn('bg-card border-border w-[400px] rounded-xl border p-4 shadow-lg')}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** フォーカス時にサジェスト一覧が表示される基本パターン。 */
export const Default: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput suggestions={mockSuggestions} />
    </InspectorFrame>
  ),
};

/** ドロップダウンが開いた状態。最近の履歴ヘッダー付き。 */
export const WithDropdownOpen: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput suggestions={mockSuggestions} initialOpen />
    </InspectorFrame>
  ),
};

/** 入力テキストでフィルタリングされた状態。 */
export const Filtered: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput suggestions={mockSuggestions} initialValue="ミーティング" initialOpen />
    </InspectorFrame>
  ),
};

/** タグなしのエントリのみ。タイトルだけが表示される。 */
export const WithoutTags: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput
        suggestions={[
          { title: 'ランチ', tagIds: [] },
          { title: '散歩', tagIds: [] },
          { title: '休憩', tagIds: [] },
        ]}
        initialOpen
      />
    </InspectorFrame>
  ),
};

/** タグが4つ以上のエントリ。+N 表記で省略される。 */
export const ManyTags: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput
        suggestions={[{ title: '1on1ミーティング', tagIds: ['tag-1', 'tag-4', 'tag-2', 'tag-5'] }]}
        initialOpen
      />
    </InspectorFrame>
  ),
};

/** 候補が0件の場合。ドロップダウンは表示されない。 */
export const Empty: Story = {
  render: () => (
    <InspectorFrame>
      <MockSuggestInput suggestions={[]} />
    </InspectorFrame>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <InspectorFrame label="デフォルト（フォーカスでドロップダウン表示）">
        <MockSuggestInput suggestions={mockSuggestions} />
      </InspectorFrame>

      <InspectorFrame label="ドロップダウン表示中">
        <MockSuggestInput suggestions={mockSuggestions} initialOpen />
      </InspectorFrame>

      <InspectorFrame label="フィルタリング（「ミーティング」で検索）">
        <MockSuggestInput suggestions={mockSuggestions} initialValue="ミーティング" initialOpen />
      </InspectorFrame>

      <InspectorFrame label="タグなしエントリ">
        <MockSuggestInput
          suggestions={[
            { title: 'ランチ', tagIds: [] },
            { title: '散歩', tagIds: [] },
          ]}
          initialOpen
        />
      </InspectorFrame>

      <InspectorFrame label="タグ4つ以上（+N 省略表示）">
        <MockSuggestInput
          suggestions={[
            { title: '1on1ミーティング', tagIds: ['tag-1', 'tag-4', 'tag-2', 'tag-5'] },
          ]}
          initialOpen
        />
      </InspectorFrame>

      <InspectorFrame label="候補なし（ドロップダウン非表示）">
        <MockSuggestInput suggestions={[]} />
      </InspectorFrame>
    </div>
  ),
};
