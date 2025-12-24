'use client'

import { useCallback, useMemo, useState } from 'react'

import { ArrowUpDown, Search, Settings2 } from 'lucide-react'

import { IconNavigation, type IconNavigationItem } from '@/components/common'

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
  /** フィルター数（バッジ表示用） */
  filterCount?: number
  /** 設定シートの内容（カスタム） */
  settingsContent?: React.ReactNode
  /** 設定のリセットハンドラー */
  onSettingsReset?: () => void
  /** アクティブな設定があるか */
  hasActiveSettings?: boolean
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
 * 検索・ソート・設定の3つのアイコンを表示
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
 *     filterCount: 2,
 *     settingsContent: <MySettingsUI />,
 *   }}
 * />
 * ```
 */
export function TableNavigation({ config, className }: TableNavigationProps) {
  const [showSearchSheet, setShowSearchSheet] = useState(false)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [showSettingsSheet, setShowSettingsSheet] = useState(false)

  const handleOpenSearch = useCallback(() => setShowSearchSheet(true), [])
  const handleOpenSort = useCallback(() => setShowSortSheet(true), [])
  const handleOpenSettings = useCallback(() => setShowSettingsSheet(true), [])

  const navItems: IconNavigationItem[] = useMemo(
    () => [
      {
        icon: Search,
        label: '検索',
        onClick: handleOpenSearch,
        isActive: config.search !== '',
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
        badge: config.filterCount,
      },
    ],
    [handleOpenSearch, handleOpenSort, handleOpenSettings, config.search, config.sortField, config.filterCount]
  )

  return (
    <>
      <IconNavigation items={navItems} className={className} />

      {/* 検索シート */}
      <TableSearchSheet
        open={showSearchSheet}
        onOpenChange={setShowSearchSheet}
        value={config.search}
        onChange={config.onSearchChange}
      />

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
          hasActiveSettings={config.hasActiveSettings}
          onReset={config.onSettingsReset}
        >
          {config.settingsContent}
        </TableSettingsSheet>
      )}
    </>
  )
}
