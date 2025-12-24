'use client'

import { useCallback, useMemo, useState } from 'react'

import { ArrowUpDown, Filter, Search, Settings2 } from 'lucide-react'

import { IconNavigation, type IconNavigationItem } from '@/components/common'

import { TableFilterSheet } from './TableFilterSheet'
import { TableSearchSheet } from './TableSearchSheet'
import { TableSettingsSheet } from './TableSettingsSheet'
import { TableSortSheet } from './TableSortSheet'

export interface TableNavigationConfig {
  /** 検索の現在値 */
  search: string
  /** 検索値の更新 */
  onSearchChange: (value: string) => void
  /** ソートフィールド（null = ソートなし） */
  sortField: string | null
  /** ソート方向 */
  sortDirection: 'asc' | 'desc' | null
  /** ソート変更 */
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  /** ソートクリア */
  onSortClear: () => void
  /** ソートフィールドオプション */
  sortFieldOptions: Array<{ value: string; label: string }>
  /** フィルターシートの内容（カスタム） */
  filterContent?: React.ReactNode | undefined
  /** フィルター数（バッジ表示用） */
  filterCount?: number | undefined
  /** アクティブなフィルターがあるか */
  hasActiveFilters?: boolean | undefined
  /** フィルターリセットハンドラー */
  onFilterReset?: (() => void) | undefined
  /** 設定シートの内容（カスタム） */
  settingsContent?: React.ReactNode | undefined
  /** 設定のリセットハンドラー */
  onSettingsReset?: (() => void) | undefined
  /** アクティブな設定があるか */
  hasActiveSettings?: boolean | undefined
}

export interface TableNavigationProps {
  /** 設定 */
  config: TableNavigationConfig
  /** 追加のクラス名 */
  className?: string
}

/**
 * テーブル用Notion風ナビゲーション
 *
 * 検索・フィルター・ソート・設定の4つのアイコンを表示
 * モバイル・PC両対応
 *
 * @example
 * ```tsx
 * <TableNavigation
 *   config={{
 *     search: filterSearch,
 *     onSearchChange: setSearch,
 *     sortField,
 *     sortDirection,
 *     onSortChange: setSort,
 *     onSortClear: clearSort,
 *     sortFieldOptions: [
 *       { value: 'title', label: 'タイトル' },
 *       { value: 'created_at', label: '作成日' },
 *     ],
 *     filterContent: <MyFilterContent />,
 *     filterCount: 2,
 *     hasActiveFilters: true,
 *     onFilterReset: resetFilters,
 *     settingsContent: <MySettingsUI />,
 *   }}
 * />
 * ```
 */
export function TableNavigation({ config, className }: TableNavigationProps) {
  const [showSearchSheet, setShowSearchSheet] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [showSettingsSheet, setShowSettingsSheet] = useState(false)

  const handleOpenSearch = useCallback(() => setShowSearchSheet(true), [])
  const handleOpenFilter = useCallback(() => setShowFilterSheet(true), [])
  const handleOpenSort = useCallback(() => setShowSortSheet(true), [])
  const handleOpenSettings = useCallback(() => setShowSettingsSheet(true), [])

  const navItems = useMemo<IconNavigationItem[]>(
    () => [
      {
        icon: Search,
        label: '検索',
        onClick: handleOpenSearch,
        isActive: config.search !== '',
      },
      {
        icon: Filter,
        label: 'フィルター',
        onClick: handleOpenFilter,
        isActive: config.hasActiveFilters,
        ...(config.filterCount !== undefined && config.filterCount > 0 && { badge: config.filterCount }),
      },
      {
        icon: ArrowUpDown,
        label: 'ソート',
        onClick: handleOpenSort,
        isActive: config.sortField !== null,
      },
      {
        icon: Settings2,
        label: '設定',
        onClick: handleOpenSettings,
      },
    ],
    [
      handleOpenSearch,
      handleOpenFilter,
      handleOpenSort,
      handleOpenSettings,
      config.search,
      config.hasActiveFilters,
      config.filterCount,
      config.sortField,
    ]
  )

  return (
    <>
      <IconNavigation items={navItems} {...(className !== undefined && { className })} />

      {/* 検索シート */}
      <TableSearchSheet
        open={showSearchSheet}
        onOpenChange={setShowSearchSheet}
        value={config.search}
        onChange={config.onSearchChange}
      />

      {/* フィルターシート */}
      {config.filterContent && (
        <TableFilterSheet
          open={showFilterSheet}
          onOpenChange={setShowFilterSheet}
          hasActiveFilters={config.hasActiveFilters}
          onReset={config.onFilterReset}
        >
          {config.filterContent}
        </TableFilterSheet>
      )}

      {/* ソートシート */}
      <TableSortSheet
        open={showSortSheet}
        onOpenChange={setShowSortSheet}
        sortField={config.sortField}
        sortDirection={config.sortDirection}
        onSortChange={config.onSortChange}
        onSortClear={config.onSortClear}
        fieldOptions={config.sortFieldOptions}
      />

      {/* 設定シート */}
      {config.settingsContent && (
        <TableSettingsSheet
          open={showSettingsSheet}
          onOpenChange={setShowSettingsSheet}
          hasActiveSettings={config.hasActiveSettings ?? false}
          {...(config.onSettingsReset !== undefined && { onReset: config.onSettingsReset })}
        >
          {config.settingsContent}
        </TableSettingsSheet>
      )}
    </>
  )
}
