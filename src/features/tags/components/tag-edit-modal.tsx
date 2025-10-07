// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
'use client'

import { useCallback, useEffect, useState } from 'react'

import { Dialog, DialogPanel, DialogTitle, Field, Input, Label, Textarea } from '@headlessui/react'
import {
  AlertTriangle as ExclamationTriangleIcon,
  Pencil as PencilIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon,
  X as XMarkIcon,
} from 'lucide-react'

import { useI18n } from '@/lib/i18n/hooks'
import type { TagWithChildren, UpdateTagInput } from '@/types/tags'

interface TagEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateTagInput) => Promise<void>
  onDelete?: () => Promise<void>
  onMove?: (newParentId: string | null) => Promise<void>
  tag: TagWithChildren | null
  allTags?: TagWithChildren[]
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
]

const ColorPicker = ({ value, onChange, t }: { value: string; onChange: (color: string) => void; t: ReturnType<typeof useI18n>['t'] }) => {
  const [customColor, setCustomColor] = useState(value)

  useEffect(() => {
    setCustomColor(value)
  }, [value])

  // jsx-no-bind optimization handler using data attributes
  const handleColorClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const color = event.currentTarget.dataset.color
      if (color) {
        onChange(color)
      }
    },
    [onChange]
  )

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomColor(e.target.value)
      onChange(e.target.value)
    },
    [onChange, setCustomColor]
  )

  return (
    <div className="space-y-3">
      {/* プリセットカラー */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_COLORS.map((color) => (
          <button
            type="button"
            key={color}
            onClick={handleColorClick}
            data-color={color}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              value === color
                ? 'scale-110 border-gray-900 dark:border-white'
                : 'border-gray-300 hover:scale-105 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* カスタムカラー */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('tags.form.customColor')}: {customColor}</span>
      </div>
    </div>
  )
}

const ParentTagSelector = ({
  value,
  onChange,
  allTags,
  currentTag,
  maxLevel = 2,
  t,
}: {
  value: string | null
  onChange: (parentId: string | null) => void
  allTags: TagWithChildren[]
  currentTag: TagWithChildren
  maxLevel?: number
  t: ReturnType<typeof useI18n>['t']
}) => {
  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value || null)
    },
    [onChange]
  )

  // 現在のタグとその子孫を除外するヘルパー
  const getDescendantIds = (tag: TagWithChildren): Set<string> => {
    const ids = new Set([tag.id])
    if (tag.children) {
      tag.children.forEach((child) => {
        getDescendantIds(child).forEach((id) => ids.add(id))
      })
    }
    return ids
  }

  const excludedIds = getDescendantIds(currentTag)

  const renderTagOption = (tag: TagWithChildren, level = 0): JSX.Element[] => {
    const options: JSX.Element[] = []
    const indent = '　'.repeat(level) // 全角スペースでインデント

    // 自分自身と子孫を除外
    if (excludedIds.has(tag.id)) {
      return options
    }

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
      onChange={handleSelectChange}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    >
      <option value="">-- {t('tags.form.rootLevel')} --</option>
      {allTags.flatMap((tag) => renderTagOption(tag))}
    </select>
  )
}

const DeleteConfirmation = ({
  tag,
  onConfirm,
  onCancel,
  t,
}: {
  tag: TagWithChildren
  onConfirm: () => void
  onCancel: () => void
  t: ReturnType<typeof useI18n>['t']
}) => {
  const hasChildren = tag.children && tag.children.length > 0
  const childCount = tag.children?.length || 0

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="mt-1 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <h4 className="mb-2 text-sm font-medium text-red-800 dark:text-red-300">{t('tags.delete.confirmTitle')}</h4>
          <p className="mb-3 text-sm text-red-700 dark:text-red-400">
            {t('tags.delete.confirmMessage', { name: tag.name })}
          </p>

          {hasChildren === true && (
            <div className="mb-3 rounded border border-red-200 bg-red-100 p-2 dark:border-red-700 dark:bg-red-900/30">
              <p className="text-sm text-red-800 dark:text-red-300">
                {t('tags.delete.childWarning', { count: childCount.toString() })}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={hasChildren}
              className="rounded border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('tags.delete.confirmButton')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-red-300 bg-transparent px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {t('tags.actions.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// フォームバリデーションロジック
const useFormValidation = (
  formData: { name: string; description?: string },
  allTags: TagWithChildren[],
  originalParentId: string | null,
  currentTagId?: string,
  t?: ReturnType<typeof useI18n>['t']
) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t?.('tags.form.nameRequired') ?? 'Tag name is required'
    } else if (formData.name.length > 50) {
      newErrors.name = t?.('tags.form.nameMaxLength') ?? 'Tag name must be 50 characters or less'
    } else if (formData.name.includes('/')) {
      newErrors.name = t?.('tags.form.noSlash') ?? 'Tag name cannot contain slash (/)'
    } else if (formData.name.startsWith('#')) {
      newErrors.name = t?.('tags.form.noHashPrefix') ?? 'Tag name cannot start with #'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = t?.('tags.form.descriptionMaxLength') ?? 'Description must be 200 characters or less'
    }

    // 同名チェック（同一親内、自分以外）
    const siblings = originalParentId ? allTags.find((t) => t.id === originalParentId)?.children || [] : allTags

    const duplicate = siblings.find(
      (sibling) => sibling.id !== currentTagId && sibling.name.toLowerCase() === formData.name.trim().toLowerCase()
    )

    if (duplicate) {
      newErrors.name = t?.('tags.form.duplicateName') ?? 'A tag with the same name already exists in this parent'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, allTags, originalParentId, currentTagId, t])

  return { errors, setErrors, validateForm }
}

// 編集タブコンテンツ
const EditTabContent = ({
  formData,
  setFormData,
  errors,
  t,
}: {
  formData: { name: string; color: string; description: string; is_active: boolean }
  setFormData: (data: { name: string; color: string; description: string; is_active: boolean }) => void
  errors: Record<string, string>
  t: ReturnType<typeof useI18n>['t']
}) => {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, name: e.target.value })
    },
    [formData, setFormData]
  )

  const handleColorChange = useCallback(
    (color: string) => {
      setFormData({ ...formData, color })
    },
    [formData, setFormData]
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData({ ...formData, description: e.target.value })
    },
    [formData, setFormData]
  )

  const handleActiveChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, is_active: e.target.checked })
    },
    [formData, setFormData]
  )

  return (
    <div className="space-y-6">
      {/* タグ名 */}
      <Field>
        <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">タグ名 *</Label>
        <Input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        />
        {errors.name ? <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p> : null}
      </Field>

      {/* カラー選択 */}
      <Field>
        <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">カラー</Label>
        <ColorPicker value={formData.color} onChange={handleColorChange} t={t} />
      </Field>

      {/* 説明 */}
      <Field>
        <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">説明（任意）</Label>
        <Textarea
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {errors.description ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        ) : null}
      </Field>

      {/* アクティブ状態 */}
      <Field>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={handleActiveChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <Label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
            アクティブ
          </Label>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">非アクティブにするとタグの使用が制限されます</p>
      </Field>
    </div>
  )
}

// 移動タブコンテンツ
const MoveTabContent = ({
  newParentId,
  setNewParentId,
  allTags,
  tag,
  originalParentId,
  t,
}: {
  newParentId: string | null
  setNewParentId: (id: string | null) => void
  allTags: TagWithChildren[]
  tag: TagWithChildren
  originalParentId: string | null
  t: ReturnType<typeof useI18n>['t']
}) => {
  const hasParentChanged = newParentId !== originalParentId
  const selectedParentTag = newParentId
    ? allTags.find((t) => t.id === newParentId) ||
      allTags.flatMap((t) => t.children || []).find((t) => t.id === newParentId)
    : null

  return (
    <div className="space-y-6">
      <Field>
        <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">新しい親タグ</Label>
        <ParentTagSelector
          value={newParentId}
          onChange={setNewParentId}
          allTags={allTags}
          currentTag={tag}
          maxLevel={2}
          t={t}
        />
        {hasParentChanged === true && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              移動先: {selectedParentTag ? selectedParentTag.name : t('tags.form.rootLevel')}
            </p>
          </div>
        )}
      </Field>
    </div>
  )
}

// カスタムフック: TagEditModal状態管理
const useTagEditModalState = (_tag?: TagWithChildren, _isOpen?: boolean) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    is_active: true,
  })

  const [originalParentId, setOriginalParentId] = useState<string | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'move' | 'delete'>('edit')

  return {
    formData,
    setFormData,
    originalParentId,
    setOriginalParentId,
    newParentId,
    setNewParentId,
    isLoading,
    setIsLoading,
    showDeleteConfirm,
    setShowDeleteConfirm,
    activeTab,
    setActiveTab,
  }
}

// カスタムフック: TagEditModal初期化
const useTagEditModalInitialization = (
  isOpen: boolean,
  tag?: TagWithChildren,
  setFormData: Function,
  setOriginalParentId: Function,
  setNewParentId: Function,
  setErrors: Function,
  setShowDeleteConfirm: Function,
  setActiveTab: Function
) => {
  useEffect(() => {
    if (isOpen && tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
        description: tag.description || '',
        is_active: tag.is_active,
      })
      setOriginalParentId(tag.parent_id)
      setNewParentId(tag.parent_id)
      setErrors({})
      setShowDeleteConfirm(false)
      setActiveTab('edit')
    }
  }, [isOpen, tag, setFormData, setOriginalParentId, setNewParentId, setErrors, setShowDeleteConfirm, setActiveTab])
}

// カスタムフック: TagEditModal操作
const useTagEditModalActions = (
  formData: { name: string; color: string; description: string; is_active: boolean },
  originalParentId: string | null,
  newParentId: string | null,
  validateForm: Function,
  setIsLoading: Function,
  setErrors: Function,
  onSave: Function,
  onMove?: Function,
  onDelete?: Function,
  onClose: Function,
  t?: ReturnType<typeof useI18n>['t']
) => {
  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const updateData: UpdateTagInput = {
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      }

      await onSave(updateData)

      // 親が変更された場合は移動も実行
      if (onMove && newParentId !== originalParentId) {
        await onMove(newParentId)
      }

      onClose()
    } catch (error) {
      console.error('Tag update failed:', error)
      setErrors({ submit: t?.('tags.errors.updateFailed') ?? '' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsLoading(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Tag deletion failed:', error)
      setErrors({ submit: t?.('tags.errors.deleteFailed') ?? '' })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleSave, handleDelete }
}

// サブコンポーネント: ヘッダー部分
const TagEditModalHeader = ({ tag, onClose }: { tag: TagWithChildren; onClose: Function }) => {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <TagIcon className="h-6 w-6" style={{ color: tag.color }} />
        </div>
        <div>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">タグを編集</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tag.path}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

// サブコンポーネント: タブナビゲーション
const TagEditModalTabs = ({
  activeTab,
  setActiveTab,
  onMove,
  onDelete,
}: {
  activeTab: 'edit' | 'move' | 'delete'
  setActiveTab: (tab: 'edit' | 'move' | 'delete') => void
  onMove?: ((newParentId: string | null) => Promise<void>) | undefined
  onDelete?: (() => Promise<void>) | undefined
}) => {
  const handleEditTab = useCallback(() => setActiveTab('edit'), [setActiveTab])
  const handleMoveTab = useCallback(() => setActiveTab('move'), [setActiveTab])
  const handleDeleteTab = useCallback(() => setActiveTab('delete'), [setActiveTab])

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={handleEditTab}
        className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'edit'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
      >
        <PencilIcon className="mr-2 inline h-4 w-4" />
        基本設定
      </button>
      {onMove != null && (
        <button
          type="button"
          onClick={handleMoveTab}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'move'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          移動
        </button>
      )}
      {onDelete != null && (
        <button
          type="button"
          onClick={handleDeleteTab}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'delete'
              ? 'border-red-500 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <TrashIcon className="mr-2 inline h-4 w-4" />
          削除
        </button>
      )}
    </div>
  )
}

// サブコンポーネント: フッター部分
const TagEditModalFooter = ({
  activeTab,
  isLoading,
  onClose,
  handleSave,
  formData,
}: {
  activeTab: 'edit' | 'move' | 'delete'
  isLoading: boolean
  onClose: () => void
  handleSave: () => Promise<void>
  formData: { name: string; color: string; description: string; is_active: boolean }
}) =>
  activeTab !== 'delete' && (
    <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        キャンセル
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading || !formData.name.trim()}
        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            保存中...
          </>
        ) : (
          <>
            <PencilIcon className="h-4 w-4" />
            保存
          </>
        )}
      </button>
    </div>
  )

export const TagEditModal = ({ isOpen, onClose, onSave, onDelete, onMove, tag, allTags = [] }: TagEditModalProps) => {
  const { t } = useI18n()
  const state = useTagEditModalState(tag, isOpen)

  const { errors, setErrors, validateForm } = useFormValidation(
    state.formData,
    allTags,
    state.originalParentId,
    tag?.id,
    t
  )

  useTagEditModalInitialization(
    isOpen,
    tag,
    state.setFormData,
    state.setOriginalParentId,
    state.setNewParentId,
    setErrors,
    state.setShowDeleteConfirm,
    state.setActiveTab
  )

  const { handleSave, handleDelete } = useTagEditModalActions(
    state.formData,
    state.originalParentId,
    state.newParentId,
    validateForm,
    state.setIsLoading,
    setErrors,
    onSave,
    onMove,
    onDelete,
    onClose,
    t
  )

  const handleCancelDelete = useCallback(() => {
    state.setActiveTab('edit')
  }, [state.setActiveTab])

  if (!tag) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">
          <TagEditModalHeader tag={tag} onClose={onClose} />

          <TagEditModalTabs
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            onMove={onMove}
            onDelete={onDelete}
          />

          <div className="p-6">
            {state.activeTab === 'edit' && (
              <EditTabContent formData={state.formData} setFormData={state.setFormData} errors={errors} t={t} />
            )}

            {state.activeTab === 'move' && onMove ? (
              <MoveTabContent
                newParentId={state.newParentId}
                setNewParentId={state.setNewParentId}
                allTags={allTags}
                tag={tag}
                originalParentId={state.originalParentId}
                t={t}
              />
            ) : null}

            {state.activeTab === 'delete' && onDelete ? (
              <DeleteConfirmation tag={tag} onConfirm={handleDelete} onCancel={handleCancelDelete} t={t} />
            ) : null}

            {errors.submit != null && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>

          <TagEditModalFooter
            activeTab={state.activeTab}
            isLoading={state.isLoading}
            onClose={onClose}
            handleSave={handleSave}
            formData={state.formData}
          />
        </DialogPanel>
      </div>
    </Dialog>
  )
}
