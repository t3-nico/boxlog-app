'use client';

/**
 * サジェスト入力コンポーネント
 *
 * 最近のPlan/Recordエントリからタイトル+タグをサジェストするドロップダウン付き入力欄。
 * Plan/Record共通。ドラフトモード（新規作成）時のみ使用。
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { zIndex } from '@/config/ui/z-index';
import { useTags } from '@/features/tags/hooks/useTagsQuery';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

const TITLE_MAX_LENGTH = 200;

interface SuggestionEntry {
  title: string;
  tagIds: string[];
}

interface SuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (entry: SuggestionEntry) => void;
  /** サジェストソースの絞り込み（'plan' or 'record'） */
  type?: 'plan' | 'record';
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
  autoFocus?: boolean;
}

export const SuggestInput = forwardRef<HTMLInputElement, SuggestInputProps>(function SuggestInput(
  {
    value,
    onChange,
    onSuggestionSelect,
    type,
    placeholder = '',
    className,
    'aria-label': ariaLabel,
    autoFocus = false,
  },
  ref,
) {
  const t = useTranslations('common.suggest');
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  // 外部refとinputRefを統合
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // 外部のvalueが変わったらローカル状態を同期
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // サジェストデータ取得
  const {
    data: suggestions,
    isLoading,
    isError,
  } = trpc.suggestions.recentTitles.useQuery(type ? { type } : undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // タグマスタ（色・名前の表示用）
  const { data: tags } = useTags();

  // タグIDから表示データを取得するMap
  const tagMap = useMemo(() => {
    if (!tags) return new Map<string, { name: string; color: string | null }>();
    return new Map(tags.map((t) => [t.id, { name: t.name, color: t.color }]));
  }, [tags]);

  // 入力値でフィルタリング
  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return [];
    if (!localValue) return suggestions;

    const query = localValue.toLowerCase();
    return suggestions.filter((s) => s.title.toLowerCase().includes(query));
  }, [suggestions, localValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
      // 入力中はドロップダウンを開く
      if (!isOpen) {
        setIsOpen(true);
      }
    },
    [onChange, isOpen],
  );

  // 選択直後のフォーカスで再度開かないようにするフラグ
  const justSelectedRef = useRef(false);

  const handleFocus = useCallback(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (suggestions && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions]);

  const handleSelect = useCallback(
    (title: string) => {
      const entry = suggestions?.find((s) => s.title === title);
      if (entry) {
        setLocalValue(entry.title);
        onSuggestionSelect({ title: entry.title, tagIds: entry.tagIds });
      }
      setIsOpen(false);
      justSelectedRef.current = true;
      // 選択後にinputにフォーカスを戻す
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [suggestions, onSuggestionSelect],
  );

  const listRef = useRef<HTMLDivElement>(null);
  const hasSuggestions = filteredSuggestions.length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
      }
      // ArrowDown でリスト内の最初のアイテムにフォーカス移動
      if (e.key === 'ArrowDown' && isOpen && hasSuggestions) {
        e.preventDefault();
        const firstItem = listRef.current?.querySelector<HTMLElement>('[cmdk-item]');
        firstItem?.focus();
      }
    },
    [isOpen, hasSuggestions],
  );

  // 自動フォーカス
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  // ローディング中またはサジェストありの場合にドロップダウンを表示
  const showDropdown = isOpen && (isLoading || hasSuggestions);

  return (
    <Popover open={showDropdown} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          maxLength={TITLE_MAX_LENGTH}
          className={cn(
            'placeholder:text-muted-foreground block w-full border-0 bg-transparent text-xl font-bold outline-none',
            className,
          )}
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-label={ariaLabel}
          autoComplete="off"
        />
      </PopoverAnchor>

      <PopoverContent
        ref={listRef}
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        style={{ zIndex: zIndex.overlayDropdown }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-[240px]">
            {isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">{t('loading')}</div>
            ) : isError ? (
              <div className="text-muted-foreground py-6 text-center text-sm">{t('loadError')}</div>
            ) : (
              <CommandEmpty>{t('noResults')}</CommandEmpty>
            )}
            <CommandGroup heading={t('recentHistory')}>
              {filteredSuggestions.map((entry) => (
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
                            style={{ borderColor: tag.color || undefined }}
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
  );
});
