'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowUpDown, ListFilter, Search, Settings2, X } from 'lucide-react';

import { MobileSettingsRadioGroup, MobileSettingsSection } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
 * ソート順選択肢
 */
const SORT_DIRECTION_OPTIONS: Array<{ value: 'asc' | 'desc'; label: string }> = [
  { value: 'asc', label: '昇順 (A → Z)' },
  { value: 'desc', label: '降順 (Z → A)' },
];

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
  const { onSearchChange } = config;

  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // === shadcn公式方式（同期的、親の状態を直接使用） ===
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // デバッグ: config.searchの変化を追跡
  console.log('[TableNavigation] config.search:', config.search, 'showSearch:', showSearch);

  // デバッグ: マウント/アンマウントを追跡
  useEffect(() => {
    console.log('[TableNavigation] MOUNTED');
    return () => console.log('[TableNavigation] UNMOUNTED');
  }, []);

  // キーボードハンドリング
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        if (config.search) {
          // 検索中ならクリア
          onSearchChange('');
        } else {
          // 何もなければ閉じる
          setShowSearch(false);
        }
      }
    },
    [onSearchChange, config.search],
  );

  // クリアボタン
  const handleSearchClear = useCallback(() => {
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  // 検索を開く
  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
  }, []);

  // 外部クリックで閉じる（検索が空の時のみ）
  useEffect(() => {
    if (!showSearch || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      console.log('[TableNavigation] Click outside check:', {
        contains: searchContainerRef.current?.contains(e.target as Node),
        configSearch: config.search,
      });
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        !config.search
      ) {
        console.log('[TableNavigation] Closing due to outside click');
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, isMobile, config.search]);

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

  // 検索コンテンツ（モバイル用 - shadcn方式）
  const mobileSearchContent = (
    <div className="relative">
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="検索..."
        value={config.search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        autoFocus
        className="pr-10"
      />
      {config.search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSearchClear}
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );

  // ソートコンテンツ（PC/モバイル共通）
  const sortContent = (
    <div className="space-y-6">
      <MobileSettingsSection icon={<ArrowUpDown />} title="並び替えの基準">
        <MobileSettingsRadioGroup
          options={allSortFieldOptions}
          value={config.sortField || 'none'}
          onValueChange={handleSortFieldChange}
          idPrefix="table-sort-field"
        />
      </MobileSettingsSection>

      {config.sortField && (
        <MobileSettingsSection icon={<ArrowUpDown />} title="並び順" showSeparator={false}>
          <MobileSettingsRadioGroup
            options={SORT_DIRECTION_OPTIONS}
            value={config.sortDirection || 'asc'}
            onValueChange={handleSortDirectionChange}
            idPrefix="table-sort-direction"
          />
        </MobileSettingsSection>
      )}
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
              className={cn(iconButtonClass, config.search !== '' && activeClass)}
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
      {/* 検索 - インライン展開（shadcn方式: 同期的更新） */}
      {showSearch ? (
        <div ref={searchContainerRef} className="flex items-center gap-1">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="検索..."
            value={config.search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            className="h-8 w-48"
          />
          {config.search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchClear}
              className="size-8"
              aria-label="クリア"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        <HoverTooltip content="検索" side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSearch}
            aria-label="検索"
            className={cn(iconButtonClass, config.search !== '' && activeClass)}
          >
            <Search className="size-5" />
          </Button>
        </HoverTooltip>
      )}

      {/* フィルター */}
      {config.filterContent && (
        <Popover open={showFilter} onOpenChange={setShowFilter}>
          <HoverTooltip content="フィルター" side="top">
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
          </HoverTooltip>
          <PopoverContent align="end" className="w-80">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">フィルター</h3>
              {config.hasActiveFilters && config.onFilterReset && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={config.onFilterReset}
                  className="h-auto p-0 text-xs"
                >
                  リセット
                </Button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">{config.filterContent}</div>
          </PopoverContent>
        </Popover>
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
