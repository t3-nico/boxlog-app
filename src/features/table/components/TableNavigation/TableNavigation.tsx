'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter, Search, Settings2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export interface TableNavigationConfig {
  /** 検索の現在値 */
  search: string;
  /** 検索値の更新 */
  onSearchChange: (value: string) => void;
  /** 検索UIの展開状態（外部制御、再マウント耐性用） */
  isSearchOpen?: boolean;
  /** 検索UIの展開状態変更（外部制御、再マウント耐性用） */
  onSearchOpenChange?: (isOpen: boolean) => void;
  /** ソートフィールド（null = ソートなし） */
  sortField: string | null;
  /** ソート方向 */
  sortDirection: 'asc' | 'desc' | null;
  /** ソート変更 */
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  /** ソートクリア */
  onSortClear: () => void;
  /** ソートフィールドオプション */
  sortFieldOptions: Array<{ value: string; label: string }>;
  /** フィルターシートの内容（カスタム） */
  filterContent?: React.ReactNode;
  /** フィルター数（バッジ表示用） */
  filterCount?: number;
  /** アクティブなフィルターがあるか */
  hasActiveFilters?: boolean;
  /** フィルターリセットハンドラー */
  onFilterReset?: () => void;
  /** 設定シートの内容（カスタム） */
  settingsContent?: React.ReactNode;
  /** 設定のリセットハンドラー */
  onSettingsReset?: () => void;
  /** アクティブな設定があるか */
  hasActiveSettings?: boolean;
}

export interface TableNavigationProps {
  /** 設定 */
  config: TableNavigationConfig;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * インライントグル付きソートオプション行
 */
function SortOptionRow({
  field,
  label,
  isSelected,
  direction,
  onSelect,
  onDirectionChange,
}: {
  field: string;
  label: string;
  isSelected: boolean;
  direction: 'asc' | 'desc' | null;
  onSelect: () => void;
  onDirectionChange: (dir: 'asc' | 'desc') => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2 transition-colors',
        isSelected ? 'bg-state-selected' : 'hover:bg-state-hover cursor-pointer',
      )}
      onClick={() => !isSelected && onSelect()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isSelected) onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex size-4 items-center justify-center rounded-full border',
            isSelected ? 'border-primary bg-primary' : 'border-input',
          )}
        >
          {isSelected && <div className="size-2 rounded-full bg-white" />}
        </div>
        <span className={cn('text-sm', isSelected && 'font-medium')}>{label}</span>
      </div>

      {/* 昇順/降順トグル */}
      {isSelected && field !== 'none' && (
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant={direction === 'asc' ? 'default' : 'ghost'}
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              onDirectionChange('asc');
            }}
            aria-label="昇順"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={direction === 'desc' ? 'default' : 'ghost'}
            size="icon"
            className="size-7"
            onClick={(e) => {
              e.stopPropagation();
              onDirectionChange('desc');
            }}
            aria-label="降順"
          >
            <ArrowDown className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * テーブル用Notion風ナビゲーション
 *
 * 検索・フィルター・ソート・設定の4つのアイコンを表示
 * - PC: Popoverで表示
 * - モバイル: Drawer (Vaul) で表示
 */
export function TableNavigation({ config, className }: TableNavigationProps) {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // config から必要な関数を分割代入（ESLint依存配列対応）
  const { onSearchChange, isSearchOpen, onSearchOpenChange } = config;

  // 検索UIの展開状態: 外部制御がある場合はそれを使用、なければローカルステート
  const [localShowSearch, setLocalShowSearch] = useState(false);
  const showSearch = isSearchOpen ?? localShowSearch;
  const setShowSearch = onSearchOpenChange ?? setLocalShowSearch;

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // === ローカルステート方式：即時フィードバック + 親への通知 ===
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ローカル検索値（即時UI更新用）
  const [localSearch, setLocalSearch] = useState(config.search);

  // 親に同期済みの値を追跡（デバウンス用）
  const syncedSearchRef = useRef(config.search);

  // 親の値が外部から変更された場合のみ同期（リセットボタン等）
  const prevConfigSearch = useRef(config.search);
  if (config.search !== prevConfigSearch.current) {
    // 親の値が変わった場合、ローカル値と同期状態を更新
    if (config.search !== localSearch) {
      setLocalSearch(config.search);
    }
    syncedSearchRef.current = config.search;
    prevConfigSearch.current = config.search;
  }

  // 入力ハンドラー：ローカル更新のみ（親への通知はデバウンス）
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);

  // デバウンス: 300ms後に親へ通知（タイピング中はAPI呼び出しを抑制）
  useEffect(() => {
    // ローカル値が同期済みの値と同じなら何もしない
    if (localSearch === syncedSearchRef.current) return;

    const timer = setTimeout(() => {
      syncedSearchRef.current = localSearch;
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // キーボードハンドリング
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        if (localSearch) {
          // 検索中ならクリア（即時反映）
          setLocalSearch('');
          syncedSearchRef.current = '';
          onSearchChange('');
        } else {
          // 何もなければ閉じる
          setShowSearch(false);
        }
      }
    },
    [localSearch, onSearchChange, setShowSearch],
  );

  // クリアボタン（即時反映）
  const handleSearchClear = useCallback(() => {
    setLocalSearch('');
    syncedSearchRef.current = '';
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  // 検索を開く
  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
  }, [setShowSearch]);

  // 外部クリックで閉じる（検索が空の時のみ）
  useEffect(() => {
    if (!showSearch || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        !localSearch
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, isMobile, localSearch, setShowSearch]);

  // ソートフィールド変更
  const handleSortFieldChange = useCallback(
    (value: string) => {
      if (value === 'none') {
        config.onSortClear();
      } else {
        config.onSortChange(value, config.sortDirection || 'asc');
      }
    },
    [config],
  );

  // ソート方向変更
  const handleSortDirectionChange = useCallback(
    (value: 'asc' | 'desc') => {
      if (config.sortField) {
        config.onSortChange(config.sortField, value);
      }
    },
    [config],
  );

  // ソートフィールドオプション（noneを追加）
  const allSortFieldOptions = useMemo(
    () => [{ value: 'none', label: 'なし' }, ...config.sortFieldOptions],
    [config.sortFieldOptions],
  );

  // 共通のアイコンボタンスタイル
  const iconButtonClass = 'text-muted-foreground hover:text-foreground relative size-8';
  const activeClass = 'text-foreground bg-state-selected';

  // 検索コンテンツ（モバイル用 - ローカルステート使用）
  const mobileSearchContent = (
    <div className="relative">
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="検索..."
        value={localSearch}
        onChange={handleSearchInputChange}
        onKeyDown={handleSearchKeyDown}
        autoFocus
        className="pr-10"
      />
      {localSearch && (
        <HoverTooltip content="クリア" side="top">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSearchClear}
            className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
            aria-label="検索をクリア"
          >
            <X className="size-4" />
          </Button>
        </HoverTooltip>
      )}
    </div>
  );

  // ソートコンテンツ（PC/モバイル共通 - インライントグル形式）
  const sortContent = (
    <div className="space-y-1">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 px-3 text-xs font-medium">
        <ArrowUpDown className="size-3.5" />
        Sort by
      </div>
      {allSortFieldOptions.map((option) => (
        <SortOptionRow
          key={option.value}
          field={option.value}
          label={option.label}
          isSelected={
            option.value === 'none' ? config.sortField === null : config.sortField === option.value
          }
          direction={config.sortDirection}
          onSelect={() => handleSortFieldChange(option.value)}
          onDirectionChange={handleSortDirectionChange}
        />
      ))}
    </div>
  );

  // モバイル用レンダリング（Drawer）
  if (isMobile) {
    return (
      <>
        <div className={cn('flex items-center gap-1', className)}>
          {/* 検索 */}
          <HoverTooltip content="検索" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSearch}
              aria-label="検索"
              className={cn(iconButtonClass, localSearch !== '' && activeClass)}
            >
              <Search className="size-5" />
            </Button>
          </HoverTooltip>

          {/* フィルター */}
          {config.filterContent && (
            <HoverTooltip content="フィルター" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilter(true)}
                aria-label="フィルター"
                className={cn(iconButtonClass, config.hasActiveFilters && activeClass)}
              >
                <ListFilter className="size-5" />
                {config.filterCount != null && config.filterCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                    {config.filterCount > 9 ? '9+' : config.filterCount}
                  </span>
                )}
              </Button>
            </HoverTooltip>
          )}

          {/* ソート */}
          <HoverTooltip content="ソート" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSort(true)}
              aria-label="ソート"
              className={cn(iconButtonClass, config.sortField !== null && activeClass)}
            >
              <ArrowUpDown className="size-5" />
            </Button>
          </HoverTooltip>

          {/* 設定 */}
          {config.settingsContent && (
            <HoverTooltip content="設定" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                aria-label="設定"
                className={cn(iconButtonClass, config.hasActiveSettings && activeClass)}
              >
                <Settings2 className="size-5" />
              </Button>
            </HoverTooltip>
          )}
        </div>

        {/* 検索Drawer */}
        <Drawer
          open={showSearch}
          onOpenChange={(open) => {
            if (open) {
              handleOpenSearch();
            } else {
              setShowSearch(false);
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>検索</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="閉じる">
                  <X />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-8">{mobileSearchContent}</div>
          </DrawerContent>
        </Drawer>

        {/* フィルターDrawer */}
        <Drawer open={showFilter} onOpenChange={setShowFilter}>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>フィルター</DrawerTitle>
              <div className="flex items-center gap-1">
                {config.hasActiveFilters && config.onFilterReset && (
                  <Button variant="ghost" size="sm" onClick={config.onFilterReset}>
                    リセット
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="閉じる">
                    <X />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">{config.filterContent}</div>
          </DrawerContent>
        </Drawer>

        {/* ソートDrawer */}
        <Drawer open={showSort} onOpenChange={setShowSort}>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>ソート</DrawerTitle>
              <div className="flex items-center gap-1">
                {config.sortField && (
                  <Button variant="ghost" size="sm" onClick={config.onSortClear}>
                    リセット
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="閉じる">
                    <X />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">{sortContent}</div>
          </DrawerContent>
        </Drawer>

        {/* 設定Drawer */}
        <Drawer open={showSettings} onOpenChange={setShowSettings}>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>設定</DrawerTitle>
              <div className="flex items-center gap-1">
                {config.hasActiveSettings && config.onSettingsReset && (
                  <Button variant="ghost" size="sm" onClick={config.onSettingsReset}>
                    リセット
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="閉じる">
                    <X />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">{config.settingsContent}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // PC用レンダリング（インライン検索 + Popover）
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 検索 - インライン展開（ローカルステート使用） */}
      {showSearch ? (
        <div ref={searchContainerRef} className="flex items-center gap-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="検索..."
            value={localSearch}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            className="h-8 w-48"
          />
          {localSearch && (
            <HoverTooltip content="クリア" side="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClear}
                className="size-8"
                aria-label="クリア"
              >
                <X className="size-4" />
              </Button>
            </HoverTooltip>
          )}
        </div>
      ) : (
        <HoverTooltip content="検索" side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSearch}
            aria-label="検索"
            className={cn(iconButtonClass, localSearch !== '' && activeClass)}
          >
            <Search className="size-5" />
          </Button>
        </HoverTooltip>
      )}

      {/* フィルター */}
      {config.filterContent && (
        <DropdownMenu open={showFilter} onOpenChange={setShowFilter}>
          <HoverTooltip content="フィルター" side="top">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="フィルター"
                className={cn(iconButtonClass, config.hasActiveFilters && activeClass)}
              >
                <ListFilter className="size-5" />
                {config.filterCount != null && config.filterCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                    {config.filterCount > 9 ? '9+' : config.filterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent align="end" className="border-input min-w-56 rounded-xl">
            {config.filterContent}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* ソート */}
      <Popover open={showSort} onOpenChange={setShowSort}>
        <HoverTooltip content="ソート" side="top">
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="ソート"
              className={cn(iconButtonClass, config.sortField !== null && activeClass)}
            >
              <ArrowUpDown className="size-5" />
            </Button>
          </PopoverTrigger>
        </HoverTooltip>
        <PopoverContent align="end" className="w-80">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">ソート</h3>
            {config.sortField && (
              <Button
                variant="ghost"
                size="sm"
                onClick={config.onSortClear}
                className="h-auto p-0 text-xs"
              >
                リセット
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">{sortContent}</div>
        </PopoverContent>
      </Popover>

      {/* 設定 */}
      {config.settingsContent && (
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <HoverTooltip content="設定" side="top">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="設定"
                className={cn(iconButtonClass, config.hasActiveSettings && activeClass)}
              >
                <Settings2 className="size-5" />
              </Button>
            </PopoverTrigger>
          </HoverTooltip>
          <PopoverContent align="end" className="w-80">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">設定</h3>
              {config.hasActiveSettings && config.onSettingsReset && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={config.onSettingsReset}
                  className="h-auto p-0 text-xs"
                >
                  リセット
                </Button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">{config.settingsContent}</div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
