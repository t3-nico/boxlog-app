'use client'

import { useState, useCallback } from 'react'
import { 
  Plus as PlusIcon, 
  Trash2 as TrashIcon,
  Menu as Bars3Icon
} from 'lucide-react'
import { 
  Button,
  Field,
  Input,
  Label
} from '@headlessui/react'
import { SmartFolderRule, SmartFolderRuleField, SmartFolderRuleOperator } from '@/types/smart-folders'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
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
  { value: 'due_date', label: 'Due Date', description: 'Filter by due date' }
]

// 演算子の定義
const OPERATOR_OPTIONS: Record<SmartFolderRuleField, Array<{ value: SmartFolderRuleOperator; label: string }>> = {
  tag: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  title: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  description: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  status: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' }
  ],
  priority: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'greater_than', label: 'is higher than' },
    { value: 'less_than', label: 'is lower than' },
    { value: 'greater_equal', label: 'is at least' },
    { value: 'less_equal', label: 'is at most' }
  ],
  is_favorite: [
    { value: 'equals', label: 'is' }
  ],
  created_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' }
  ],
  updated_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' }
  ],
  due_date: [
    { value: 'greater_than', label: 'is after' },
    { value: 'less_than', label: 'is before' },
    { value: 'greater_equal', label: 'is on or after' },
    { value: 'less_equal', label: 'is on or before' },
    { value: 'equals', label: 'is on' },
    { value: 'is_empty', label: 'is not set' },
    { value: 'is_not_empty', label: 'is set' }
  ]
}

// 値の入力タイプ
const getValueInputType = (field: SmartFolderRuleField, operator: SmartFolderRuleOperator): 'text' | 'select' | 'date' | 'none' => {
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
const SELECT_OPTIONS: Record<string, Array<{ value: any; label: string }>> = {
  status: [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ],
  priority: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ],
  is_favorite: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ]
}

export function RuleEditor({ rules, onChange }: RuleEditorProps) {
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
      logic: 'AND'
    }
    onChange([...rules, newRule])
  }, [rules, onChange])

  // ルールを削除
  const removeRule = useCallback((index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    onChange(newRules)
  }, [rules, onChange])

  // ルールを更新
  const updateRule = useCallback((index: number, updatedRule: SmartFolderRule) => {
    const newRules = [...rules]
    newRules[index] = updatedRule
    onChange(newRules)
  }, [rules, onChange])

  // ドラッグ&ドロップ処理
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = rules.findIndex((_, i) => i.toString() === active.id)
      const newIndex = rules.findIndex((_, i) => i.toString() === over.id)
      
      onChange(arrayMove(rules, oldIndex, newIndex))
    }
  }, [rules, onChange])

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
            const value = options.find(opt => String(opt.value) === e.target.value)?.value
            updateRule(index, { ...rule, value })
          }}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )
    }
    
    return (
      <Input
        type="text"
        value={String(rule.value)}
        onChange={(e) => updateRule(index, { ...rule, value: e.target.value })}
        placeholder="Enter value..."
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* ルール一覧 */}
      {rules.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rules.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <SortableItem key={index} id={index.toString()}>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* ドラッグハンドル */}
                    <div className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Bars3Icon className="w-4 h-4" />
                    </div>

                    {/* ロジック演算子（最初のルール以外） */}
                    {index > 0 && (
                      <select
                        value={rule.logic}
                        onChange={(e) => updateRule(index, { ...rule, logic: e.target.value as 'AND' | 'OR' })}
                        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    )}

                    {/* フィールド選択 */}
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-3">
                        <select
                          value={rule.field}
                          onChange={(e) => {
                            const newRule = { 
                              ...rule, 
                              field: e.target.value as SmartFolderRuleField,
                              operator: OPERATOR_OPTIONS[e.target.value as SmartFolderRuleField][0].value,
                              value: ''
                            }
                            updateRule(index, newRule)
                          }}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {OPERATOR_OPTIONS[rule.field].map((operator) => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 値入力 */}
                      <div className="col-span-5">
                        {renderValueInput(rule, index)}
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => removeRule(index)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <TrashIcon className="w-4 h-4" />
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
        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No filter rules yet. Add your first rule to get started.
          </p>
        </div>
      )}

      {/* ルール追加ボタン */}
      <button
        onClick={addRule}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add Filter Rule
      </button>
    </div>
  )
}