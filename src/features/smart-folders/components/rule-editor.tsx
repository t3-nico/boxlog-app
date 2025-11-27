'use client'

import { useCallback } from 'react'

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Input } from '@headlessui/react'
import { Menu as Bars3Icon, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react'

import { SmartFolderRule, SmartFolderRuleField, SmartFolderRuleOperator } from '@/types/smart-folders'

import { SortableItem } from './sortable-rule-item'

interface RuleEditorProps {
  rules: SmartFolderRule[]
  onChange: (rules: SmartFolderRule[]) => void
}

// フィールドの定義
const FIELD_OPTIONS: Array<{ value: SmartFolderRuleField; label: string; description: string }> = [
  { value: 'tag', label: 'Tags', description: 'Filter by tags' },
  { value: 'title', label: 'Title', description: 'Filter by task title' },
  { value: 'description', label: 'Description', description: 'Filter by task description' },
  { value: 'status', label: 'Status', description: 'Filter by task status' },
  { value: 'priority', label: 'Priority', description: 'Filter by priority level' },
  { value: 'is_favorite', label: 'Favorite', description: 'Filter by favorite status' },
  { value: 'created_date', label: 'Created Date', description: 'Filter by creation date' },
  { value: 'updated_date', label: 'Updated Date', description: 'Filter by last update' },
  { value: 'due_date', label: 'Due Date', description: 'Filter by due date' },
]

// 演算子の定義
const OPERATOR_OPTIONS: Record<SmartFolderRuleField, Array<{ value: SmartFolderRuleOperator; label: string }>> = {
  tag: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  title: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  description: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  status: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
  ],
  priority: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'greater_than', label: 'is higher than' },
    { value: 'less_than', label: 'is lower than' },
    { value: 'greater_equal', label: 'is at least' },
    { value: 'less_equal', label: 'is at most' },
  ],
  is_favorite: [{ value: 'equals', label: 'is' }],
  created_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' },
  ],
  updated_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' },
  ],
  due_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' },
    { value: 'is_empty', label: 'is not set' },
    { value: 'is_not_empty', label: 'is set' },
  ],
}

// 値の入力タイプ
const getValueInputType = (
  field: SmartFolderRuleField,
  operator: SmartFolderRuleOperator
): 'text' | 'select' | 'date' | 'none' => {
  if (operator === 'is_empty' || operator === 'is_not_empty') return 'none'

  switch (field) {
    case 'status':
      return 'select'
    case 'priority':
      return 'select'
    case 'is_favorite':
      return 'select'
    case 'created_date':
    case 'updated_date':
    case 'due_date':
      return 'date'
    default:
      return 'text'
  }
}

// 選択肢の定義
const SELECT_OPTIONS: Record<string, Array<{ value: string | boolean; label: string }>> = {
  status: [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  priority: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ],
  is_favorite: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ],
}

export const RuleEditor = ({ rules, onChange }: RuleEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 新しいルールを追加
  const addRule = useCallback(() => {
    const newRule: SmartFolderRule = {
      field: 'title',
      operator: 'contains',
      value: '',
      logic: 'AND',
    }
    onChange([...rules, newRule])
  }, [rules, onChange])

  // ルールを削除
  const removeRule = useCallback(
    (index: number) => {
      const newRules = rules.filter((_, i) => i !== index)
      onChange(newRules)
    },
    [rules, onChange]
  )

  // ルールを更新
  const updateRule = useCallback(
    (index: number, updatedRule: SmartFolderRule) => {
      const newRules = [...rules]
      newRules[index] = updatedRule
      onChange(newRules)
    },
    [rules, onChange]
  )

  // ドラッグ&ドロップ処理
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = String(active.id)
      const overId = String(over.id)

      if (activeId !== overId) {
        const oldIndex = rules.findIndex((_, i) => i.toString() === activeId)
        const newIndex = rules.findIndex((_, i) => i.toString() === overId)

        onChange(arrayMove(rules, oldIndex, newIndex))
      }
    },
    [rules, onChange]
  )

  // 値入力コンポーネント
  const renderValueInput = (rule: SmartFolderRule, index: number) => {
    const inputType = getValueInputType(rule.field, rule.operator)

    if (inputType === 'none') {
      return null
    }

    if (inputType === 'select') {
      const options = SELECT_OPTIONS[rule.field] || []

      return (
        <select
          value={String(rule.value)}
          onChange={(e) => {
            const value = options.find((opt) => String(opt.value) === e.target.value)?.value ?? null
            updateRule(index, { ...rule, value })
          }}
          className="border-border w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (inputType === 'date') {
      return (
        <Input
          type="text"
          value={String(rule.value)}
          onChange={(e) => updateRule(index, { ...rule, value: e.target.value })}
          placeholder="e.g., 2024-01-15 or 7days"
          className="border-border w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
        />
      )
    }

    return (
      <Input
        type="text"
        value={String(rule.value)}
        onChange={(e) => updateRule(index, { ...rule, value: e.target.value })}
        placeholder="Enter value..."
        className="border-border w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* ルール一覧 */}
      {rules.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rules.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <SortableItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  id={index.toString()}
                >
                  <div className="border-border flex items-center gap-3 rounded-xl border bg-gray-50 p-4 dark:bg-gray-800">
                    {/* ドラッグハンドル */}
                    <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Bars3Icon className="h-4 w-4" data-slot="icon" />
                    </div>

                    {/* ロジック演算子（最初のルール以外） */}
                    {index > 0 && (
                      <select
                        value={rule.logic}
                        onChange={(e) => updateRule(index, { ...rule, logic: e.target.value as 'AND' | 'OR' })}
                        className="border-border rounded-md border bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    )}

                    {/* フィールド選択 */}
                    <div className="grid flex-1 grid-cols-12 items-center gap-3">
                      <div className="col-span-3">
                        <select
                          value={rule.field}
                          onChange={(e) => {
                            const newRule = {
                              ...rule,
                              field: e.target.value as SmartFolderRuleField,
                              operator: OPERATOR_OPTIONS[e.target.value as SmartFolderRuleField][0].value,
                              value: '',
                            }
                            updateRule(index, newRule)
                          }}
                          className="border-border w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                        >
                          {FIELD_OPTIONS.map((field) => (
                            <option key={field.value} value={field.value} title={field.description}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 演算子選択 */}
                      <div className="col-span-3">
                        <select
                          value={rule.operator}
                          onChange={(e) => {
                            const newRule = { ...rule, operator: e.target.value as SmartFolderRuleOperator, value: '' }
                            updateRule(index, newRule)
                          }}
                          className="border-border w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                        >
                          {OPERATOR_OPTIONS[rule.field].map((operator) => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 値入力 */}
                      <div className="col-span-5">{renderValueInput(rule, index)}</div>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" data-slot="icon" />
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 空の状態 */}
      {rules.length === 0 && (
        <div className="border-border rounded-xl border-2 border-dashed px-4 py-8 text-center">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            No filter rules yet. Add your first rule to get started.
          </p>
        </div>
      )}

      {/* ルール追加ボタン */}
      <button
        type="button"
        onClick={addRule}
        className="border-border flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed py-3 text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
      >
        <PlusIcon className="h-4 w-4" data-slot="icon" />
        Add Filter Rule
      </button>
    </div>
  )
}
