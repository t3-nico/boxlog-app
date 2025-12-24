'use client'

import {
  MobileSettingsButtonGroup,
  MobileSettingsChip,
  MobileSettingsRadioGroup,
  MobileSettingsSection,
  MobileSettingsSheet,
} from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Columns3, Filter, Group, Settings2, Table2 } from 'lucide-react'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../../stores/useInboxGroupStore'
import { useInboxViewStore } from '../../stores/useInboxViewStore'
import type { GroupByField } from '../../types/group'

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
]

/**
 * 期限フィルター選択肢
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日期限' },
  { value: 'tomorrow', label: '明日期限' },
  { value: 'this_week', label: '今週中' },
  { value: 'next_week', label: '来週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'no_due_date', label: '期限なし' },
]

/**
 * グループ化オプション
 */
const GROUP_BY_OPTIONS: Array<{ value: GroupByField; label: string }> = [
  { value: null, label: 'なし' },
  { value: 'status', label: 'ステータス' },
  { value: 'due_date', label: '期限' },
  { value: 'tags', label: 'タグ' },
]

/**
 * モバイル用テーブル設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - 表示モード切替（Board/Table）
 * - グループ化設定
 * - フィルター（期限・ステータス）
 * - 列設定
 *
 * @example
 * ```tsx
 * <MobileTableSettingsSheet />
 * ```
 */
export function MobileTableSettingsSheet() {
  // 表示モード
  const { displayMode, setDisplayMode } = useInboxViewStore()

  // グループ化
  const { groupBy, setGroupBy } = useInboxGroupStore()

  // フィルター
  const { status, dueDate, setStatus, setDueDate, reset: resetFilters } = useInboxFilterStore()

  // 列設定
  const { columns, toggleColumnVisibility, resetColumns } = useInboxColumnStore()
  const configurableColumns = columns.filter((col) => col.id !== 'selection')

  // フィルター数をカウント
  const filterCount = status.length + (dueDate !== 'all' ? 1 : 0)

  // ステータストグル
  const toggleStatus = (value: PlanStatus) => {
    const newStatus = status.includes(value) ? status.filter((s) => s !== value) : [...status, value]
    setStatus(newStatus as PlanStatus[])
  }

  // 全てリセット
  const handleResetAll = () => {
    resetFilters()
    setGroupBy(null)
    resetColumns()
  }

  // アクティブな設定があるかどうか
  const hasActiveSettings = filterCount > 0 || groupBy !== null

  return (
    <MobileSettingsSheet
      title="表示設定"
      hasActiveSettings={hasActiveSettings}
      resetLabel="すべてリセット"
      onReset={handleResetAll}
    >
      {/* 表示モード */}
      <MobileSettingsSection icon={<Table2 />} title="表示モード">
        <MobileSettingsButtonGroup
          options={[
            { value: 'board', label: 'Board', icon: <Columns3 /> },
            { value: 'table', label: 'Table', icon: <Table2 /> },
          ]}
          value={displayMode}
          onValueChange={setDisplayMode}
          fullWidth
        />
      </MobileSettingsSection>

      {/* グループ化 */}
      <MobileSettingsSection icon={<Group />} title="グループ化">
        <MobileSettingsButtonGroup
          options={GROUP_BY_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          value={groupBy}
          onValueChange={setGroupBy}
        />
      </MobileSettingsSection>

      {/* フィルター */}
      <MobileSettingsSection
        icon={<Filter />}
        title={
          <div className="flex items-center gap-2">
            <span>フィルター</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="px-1.5 text-xs">
                {filterCount}
              </Badge>
            )}
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatus([])
                  setDueDate('all')
                }}
                className="ml-auto h-auto p-0 text-xs"
              >
                クリア
              </Button>
            )}
          </div>
        }
      >
        {/* 期限フィルター */}
        <div className="mb-4">
          <Label className="text-muted-foreground mb-2 block text-xs">期限</Label>
          <MobileSettingsRadioGroup
            options={DUE_DATE_OPTIONS}
            value={dueDate}
            onValueChange={setDueDate}
            idPrefix="mobile-due-date"
          />
        </div>

        {/* ステータスフィルター */}
        <div>
          <Label className="text-muted-foreground mb-2 block text-xs">ステータス</Label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <MobileSettingsChip
                key={option.value}
                id={`mobile-status-${option.value}`}
                label={option.label}
                checked={status.includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              />
            ))}
          </div>
        </div>
      </MobileSettingsSection>

      {/* 列設定 */}
      <MobileSettingsSection
        icon={<Settings2 />}
        title={
          <div className="flex items-center justify-between">
            <span>列の表示</span>
            <Button variant="ghost" size="sm" onClick={resetColumns} className="h-auto p-0 text-xs">
              リセット
            </Button>
          </div>
        }
        showSeparator={false}
      >
        <div className="flex flex-wrap gap-2">
          {configurableColumns.map((column) => (
            <MobileSettingsChip
              key={column.id}
              id={`mobile-column-${column.id}`}
              label={column.label}
              checked={column.visible}
              onCheckedChange={() => toggleColumnVisibility(column.id)}
            />
          ))}
        </div>
      </MobileSettingsSection>
    </MobileSettingsSheet>
  )
}
