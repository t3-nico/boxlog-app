'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Dialog, 
  DialogPanel, 
  DialogTitle,
  Field,
  Input,
  Label,
  Textarea
} from '@headlessui/react'
import { 
  X as XMarkIcon, 
  Tag as TagIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  AlertTriangle as ExclamationTriangleIcon
} from 'lucide-react'
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

function ColorPicker({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (color: string) => void 
}) {
  const [customColor, setCustomColor] = useState(value)
  
  useEffect(() => {
    setCustomColor(value)
  }, [value])
  
  return (
    <div className="space-y-3">
      {/* プリセットカラー */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              value === color 
                ? 'border-gray-900 dark:border-white scale-110' 
                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
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
          onChange={(e) => {
            setCustomColor(e.target.value)
            onChange(e.target.value)
          }}
          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          カスタムカラー: {customColor}
        </span>
      </div>
    </div>
  )
}

function ParentTagSelector({
  value,
  onChange,
  allTags,
  currentTag,
  maxLevel = 2
}: {
  value: string | null
  onChange: (parentId: string | null) => void
  allTags: TagWithChildren[]
  currentTag: TagWithChildren
  maxLevel?: number
}) {
  // 現在のタグとその子孫を除外するヘルパー
  const getDescendantIds = (tag: TagWithChildren): Set<string> => {
    const ids = new Set([tag.id])
    if (tag.children) {
      tag.children.forEach(child => {
        getDescendantIds(child).forEach(id => ids.add(id))
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
          {indent}{tag.name} ({tag.path})
        </option>
      )
    }
    
    // 子タグも再帰的に追加
    if (tag.children) {
      tag.children.forEach(child => {
        options.push(...renderTagOption(child, level + 1))
      })
    }
    
    return options
  }
  
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">-- ルートレベル（親なし）--</option>
      {allTags.flatMap(tag => renderTagOption(tag))}
    </select>
  )
}

function DeleteConfirmation({
  tag,
  onConfirm,
  onCancel
}: {
  tag: TagWithChildren
  onConfirm: () => void
  onCancel: () => void
}) {
  const hasChildren = tag.children && tag.children.length > 0
  const childCount = tag.children?.length || 0
  
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
            タグを削除しますか？
          </h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">
            「{tag.name}」を削除します。この操作は取り消せません。
          </p>
          
          {hasChildren && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
              <p className="text-sm text-red-800 dark:text-red-300">
                ⚠️ このタグには {childCount} 個の子タグがあります。
                削除するには先に子タグを削除または移動してください。
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirm}
              disabled={hasChildren}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              削除する
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-transparent border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TagEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onMove,
  tag,
  allTags = []
}: TagEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
    is_active: true
  })
  
  const [originalParentId, setOriginalParentId] = useState<string | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'move' | 'delete'>('edit')
  
  // 初期化
  useEffect(() => {
    if (isOpen && tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
        description: tag.description || '',
        is_active: tag.is_active
      })
      setOriginalParentId(tag.parent_id)
      setNewParentId(tag.parent_id)
      setErrors({})
      setShowDeleteConfirm(false)
      setActiveTab('edit')
    }
  }, [isOpen, tag])
  
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
    
    // 同名チェック（同一親内、自分以外）
    const siblings = originalParentId 
      ? allTags.find(t => t.id === originalParentId)?.children || []
      : allTags
    
    const duplicate = siblings.find(sibling => 
      sibling.id !== tag?.id &&
      sibling.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (duplicate) {
      newErrors.name = '同じ親階層に同名のタグが既に存在します'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, allTags, originalParentId, tag])
  
  // フォーム送信（編集）
  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const updateData: UpdateTagInput = {
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active
      }
      
      await onSave(updateData)
      
      // 親が変更された場合は移動も実行
      if (onMove && newParentId !== originalParentId) {
        await onMove(newParentId)
      }
      
      onClose()
    } catch (error) {
      console.error('Tag update failed:', error)
      setErrors({ submit: 'タグの更新に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }
  
  // 削除
  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsLoading(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Tag deletion failed:', error)
      setErrors({ submit: 'タグの削除に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!tag) return null
  
  const hasParentChanged = newParentId !== originalParentId
  const selectedParentTag = newParentId 
    ? allTags.find(t => t.id === newParentId) || 
      allTags.flatMap(t => t.children || []).find(t => t.id === newParentId)
    : null
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <TagIcon className="w-6 h-6" style={{ color: tag.color }} />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  タグを編集
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tag.path}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <PencilIcon className="w-4 h-4 inline mr-2" />
              基本設定
            </button>
            {onMove && (
              <button
                onClick={() => setActiveTab('move')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'move'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                移動
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setActiveTab('delete')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'delete'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <TrashIcon className="w-4 h-4 inline mr-2" />
                削除
              </button>
            )}
          </div>
          
          {/* コンテンツ */}
          <div className="p-6">
            {activeTab === 'edit' && (
              <div className="space-y-6">
                {/* タグ名 */}
                <Field>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    タグ名 *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </Field>
                
                {/* カラー選択 */}
                <Field>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カラー
                  </Label>
                  <ColorPicker
                    value={formData.color}
                    onChange={(color) => setFormData({ ...formData, color })}
                  />
                </Field>
                
                {/* 説明 */}
                <Field>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明（任意）
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description}
                    </p>
                  )}
                </Field>
                
                {/* アクティブ状態 */}
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                      アクティブ
                    </Label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    非アクティブにするとタグの使用が制限されます
                  </p>
                </Field>
              </div>
            )}
            
            {activeTab === 'move' && onMove && (
              <div className="space-y-6">
                <Field>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    新しい親タグ
                  </Label>
                  <ParentTagSelector
                    value={newParentId}
                    onChange={setNewParentId}
                    allTags={allTags}
                    currentTag={tag}
                    maxLevel={2}
                  />
                  {hasParentChanged && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        移動先: {selectedParentTag ? selectedParentTag.name : 'ルートレベル'}
                      </p>
                    </div>
                  )}
                </Field>
              </div>
            )}
            
            {activeTab === 'delete' && onDelete && (
              <DeleteConfirmation
                tag={tag}
                onConfirm={handleDelete}
                onCancel={() => setActiveTab('edit')}
              />
            )}
            
            {/* エラー表示 */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
          
          {/* フッター */}
          {activeTab !== 'delete' && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !formData.name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    保存
                  </>
                )}
              </button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}