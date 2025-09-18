'use client'

import { useCallback, useEffect, useState } from 'react'

import { Dialog, DialogPanel, DialogTitle, Field, Input, Label, Textarea } from '@headlessui/react'
import { Plus as PlusIcon, Tag as TagIcon, X as XMarkIcon } from 'lucide-react'

import { TAG_PRESET_COLORS } from '@/config/ui/theme'
import type { CreateTagInput, TagLevel, TagWithChildren } from '@/types/tags'

interface TagCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTagInput) => Promise<void>
  parentTag?: TagWithChildren | null
  allTags?: TagWithChildren[]
}

// CSS変数からHEX値への変換マップ（UI表示用）
const CSS_VAR_TO_HEX = {
  'var(--color-tag-blue)': '#3B82F6',
  'var(--color-tag-emerald)': '#10B981',
  'var(--color-tag-amber)': '#F59E0B',
  'var(--color-tag-red)': '#EF4444',
  'var(--color-tag-violet)': '#8B5CF6',
  'var(--color-tag-cyan)': '#06B6D4',
  'var(--color-tag-lime)': '#84CC16',
  'var(--color-tag-orange)': '#F97316',
  'var(--color-tag-pink)': '#EC4899',
  'var(--color-tag-gray)': '#6B7280',
} as const

const DEFAULT_COLORS = TAG_PRESET_COLORS.map(
  (cssVar) => CSS_VAR_TO_HEX[cssVar as keyof typeof CSS_VAR_TO_HEX] || cssVar
)

const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => {
  const [customColor, setCustomColor] = useState(value)

  useEffect(() => {
    setCustomColor(value)
  }, [value])

  return (
    <div className="space-y-3">
      {/* プリセットカラー */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_COLORS.map((color, index) => (
          <button
            type="button"
            key={color}
            onClick={() => onChange(TAG_PRESET_COLORS[index])}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              value === TAG_PRESET_COLORS[index]
                ? 'scale-110 border-gray-900 dark:border-white'
                : 'border-gray-300 hover:scale-105 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={TAG_PRESET_COLORS[index]}
          />
        ))}
      </div>

      {/* カスタムカラー */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value)
            onChange(e.target.value)
          }}
          className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">カスタムカラー: {customColor}</span>
      </div>
    </div>
  )
}

const ParentTagSelector = ({
  value,
  onChange,
  allTags,
  maxLevel = 2,
}: {
  value: string | null
  onChange: (parentId: string | null) => void
  allTags: TagWithChildren[]
  maxLevel?: number
}) => {
  const renderTagOption = (tag: TagWithChildren, level = 0): JSX.Element[] => {
    const options: JSX.Element[] = []
    const indent = '　'.repeat(level) // 全角スペースでインデント

    // 親になれるのは最大レベル未満のタグのみ
    if (level < maxLevel) {
      options.push(
        <option key={tag.id} value={tag.id}>
          {indent}
          {tag.name} ({tag.path})
        </option>
      )
    }

    // 子タグも再帰的に追加
    if (tag.children) {
      tag.children.forEach((child) => {
        options.push(...renderTagOption(child, level + 1))
      })
    }

    return options
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    >
      <option value="">-- ルートレベル（親なし）--</option>
      {allTags.flatMap((tag) => renderTagOption(tag))}
    </select>
  )
}

const TagPreview = ({
  name,
  color,
  parentTag,
}: {
  name: string
  color: string
  parentTag?: TagWithChildren | null
}) => {
  const path = parentTag ? `${parentTag.path}/${name}` : `#${name}`

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 text-sm font-medium text-gray-900 dark:text-white">プレビュー</div>
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5" style={{ color }} />
        <span className="text-sm font-medium text-gray-900 dark:text-white">{name || '（タグ名）'}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{path}</span>
      </div>
      {parentTag && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">親タグ: {parentTag.name}</div>}
    </div>
  )
}

export const TagCreateModal = ({ isOpen, onClose, onSave, parentTag, allTags = [] }: TagCreateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: parentTag?.id || null,
    color: TAG_PRESET_COLORS[0] as string,
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 初期化
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        parent_id: parentTag?.id || null,
        color: TAG_PRESET_COLORS[0] as string,
        description: '',
      })
      setErrors({})
    }
  }, [isOpen, parentTag])

  // バリデーション
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'タグ名は必須です'
    } else if (formData.name.length > 50) {
      newErrors.name = 'タグ名は50文字以内で入力してください'
    } else if (formData.name.includes('/')) {
      newErrors.name = 'タグ名にスラッシュ（/）は使用できません'
    } else if (formData.name.startsWith('#')) {
      newErrors.name = 'タグ名は#で始めることはできません'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = '説明は200文字以内で入力してください'
    }

    // 同名チェック（同一親内）
    const siblings = formData.parent_id ? allTags.find((t) => t.id === formData.parent_id)?.children || [] : allTags

    const duplicate = siblings.find((tag) => tag.name.toLowerCase() === formData.name.trim().toLowerCase())

    if (duplicate) {
      newErrors.name = '同じ親階層に同名のタグが既に存在します'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, allTags])

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const selectedParentTag = allTags.find((tag) => tag.id === formData.parent_id)
      const level: TagLevel = selectedParentTag ? ((selectedParentTag.level + 1) as TagLevel) : 0

      await onSave({
        name: formData.name.trim(),
        parent_id: formData.parent_id,
        color: formData.color,
        description: formData.description.trim() || null,
        level,
      })
      onClose()
    } catch (error) {
      console.error('Tag creation failed:', error)
      setErrors({ submit: 'タグの作成に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedParentTag = formData.parent_id
    ? allTags.find((t) => t.id === formData.parent_id) ||
      allTags.flatMap((t) => t.children || []).find((t) => t.id === formData.parent_id)
    : null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  新しいタグを作成
                </DialogTitle>
                {parentTag && <p className="text-sm text-gray-500 dark:text-gray-400">親タグ: {parentTag.name}</p>}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* タグ名 */}
            <Field>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">タグ名 *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 仕事、プロジェクトA"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </Field>

            {/* 親タグ選択 */}
            <Field>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">親タグ</Label>
              <ParentTagSelector
                value={formData.parent_id}
                onChange={(parentId) => setFormData({ ...formData, parent_id: parentId })}
                allTags={allTags}
                maxLevel={2}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">最大3階層まで作成できます</p>
            </Field>

            {/* カラー選択 */}
            <Field>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">カラー</Label>
              <ColorPicker value={formData.color} onChange={(color) => setFormData({ ...formData, color })} />
            </Field>

            {/* 説明 */}
            <Field>
              <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">説明（任意）</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="このタグの用途や説明を入力..."
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </Field>

            {/* プレビュー */}
            <TagPreview name={formData.name} color={formData.color} parentTag={selectedParentTag} />

            {/* エラー表示 */}
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* ボタン */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    作成中...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    作成
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
