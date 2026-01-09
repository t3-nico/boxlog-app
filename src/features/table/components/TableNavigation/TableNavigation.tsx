'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  ListFilter,
  RotateCcw,
  Search,
  Settings2,
  X,
} from 'lucide-react';

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
  sortFieldOptions: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
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
  /** 設定数（バッジ表示用） */
  settingsCount?: number;
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

  // 共通のアイコンボタンスタイル
  const iconButtonClass = 'text-muted-foreground hover:text-foreground relative';
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
            size="icon-sm"
            onClick={handleSearchClear}
            className="absolute top-1/2 right-1 -translate-y-1/2"
            aria-label="検索をクリア"
          >
            <X className="size-4" />
          </Button>
        </HoverTooltip>
      )}
    </div>
  );

  // ソート方向変更ハンドラー
  const handleSortDirectionChange = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      config.onSortChange(field, direction);
      setShowSort(false);
    },
    [config, setShowSort],
  );

  // ソートコンテンツ（2列サブメニュー構造）
  const sortContent = (
    <>
      <DropdownMenuGroup>
        {config.sortFieldOptions.map((option) => {
          const isSelected = config.sortField === option.value;
          const Icon = option.icon || ArrowUpDown;

          return (
            <DropdownMenuSub key={option.value}>
              <DropdownMenuSubTrigger>
                <Icon className="size-4" />
                <span className="flex-1">{option.label}</span>
                {isSelected && (
                  <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                    {config.sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="border-input">
                <DropdownMenuRadioGroup
                  value={isSelected ? config.sortDirection || '' : ''}
                  onValueChange={(v) =>
                    handleSortDirectionChange(option.value, v as 'asc' | 'desc')
                  }
                >
                  <DropdownMenuRadioItem value="asc">
                    <span className="flex items-center gap-2">
                      <ArrowUpAZ className="size-4" />
                      昇順
                    </span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">
                    <span className="flex items-center gap-2">
                      <ArrowDownAZ className="size-4" />
                      降順
                    </span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuGroup>

      {/* リセットボタン（ソートがアクティブな場合のみ表示） */}
      {config.sortField && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={config.onSortClear}>
            <RotateCcw className="size-4" />
            ソートをリセット
          </DropdownMenuItem>
        </>
      )}
    </>
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
                className={iconButtonClass}
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
              className={iconButtonClass}
            >
              <ArrowUpDown className="size-5" />
              {config.sortField !== null && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                  1
                </span>
              )}
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
                className={iconButtonClass}
              >
                <Settings2 className="size-5" />
                {config.settingsCount != null && config.settingsCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                    {config.settingsCount > 9 ? '9+' : config.settingsCount}
                  </span>
                )}
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
                size="icon-sm"
                onClick={handleSearchClear}
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
                className={iconButtonClass}
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

      {/* ソート - Notion風シンプルメニュー */}
      <DropdownMenu open={showSort} onOpenChange={setShowSort}>
        <HoverTooltip content="ソート" side="top">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="ソート" className={iconButtonClass}>
              <ArrowUpDown className="size-5" />
              {config.sortField !== null && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </HoverTooltip>
        <DropdownMenuContent align="end" className="min-w-48">
          {sortContent}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 設定 */}
      {config.settingsContent && (
        <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
          <HoverTooltip content="設定" side="top">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="設定" className={iconButtonClass}>
                <Settings2 className="size-5" />
                {config.settingsCount != null && config.settingsCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                    {config.settingsCount > 9 ? '9+' : config.settingsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent align="end" className="border-input min-w-56 rounded-xl">
            {config.settingsContent}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
