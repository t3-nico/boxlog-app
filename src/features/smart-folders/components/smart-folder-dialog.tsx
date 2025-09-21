'use client'

import { useCallback, useEffect, useState } from 'react'

import { Dialog, DialogPanel, DialogTitle, Field, Input, Label, Textarea } from '@headlessui/react'
import { Eye as EyeIcon, Folder as FolderIcon, Plus as PlusIcon, X as XMarkIcon } from 'lucide-react'

import { z } from 'zod'

import { createSmartFolderSchema, updateSmartFolderSchema } from '@/features/smart-folders/validations/smart-folders'
import { CreateSmartFolderInput, SmartFolder, SmartFolderRule, UpdateSmartFolderInput } from '@/types/smart-folders'

import { RuleEditor } from './rule-editor'
import { RulePreview } from './rule-preview'

interface SmartFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSmartFolderInput | UpdateSmartFolderInput) => Promise<void>
  folder?: SmartFolder
  previewItems?: unknown[]
}

export const SmartFolderDialog = ({ isOpen, onClose, onSave, folder, previewItems = [] }: SmartFolderDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [] as SmartFolderRule[],
    icon: '📁',
    color: '#3B82F6',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // フォームデータの初期化
  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name,
        description: folder.description || '',
        rules: folder.rules,
        icon: folder.icon || '📁',
        color: folder.color,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        rules: [],
        icon: '📁',
        color: '#3B82F6',
      })
    }
    setErrors({})
  }, [folder, isOpen])

  // バリデーション
  const validateForm = useCallback(() => {
    try {
      const schema = folder ? updateSmartFolderSchema : createSmartFolderSchema
      schema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [formData, folder])

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      setErrors({ submit: 'Failed to save smart folder' })
    } finally {
      setIsLoading(false)
    }
  }

  // ルールの更新
  const handleRulesChange = useCallback((newRules: SmartFolderRule[]) => {
    setFormData((prev) => ({ ...prev, rules: newRules }))
  }, [])

  // フィールドの更新
  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* ダイアログコンテナ */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <FolderIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {folder ? 'Edit Smart Folder' : 'Create Smart Folder'}
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {folder ? 'Modify your existing smart folder' : 'Create a new smart folder with custom rules'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <EyeIcon className="h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-hidden">
            <div className={`flex h-full ${showPreview ? 'divide-x divide-gray-200 dark:divide-gray-700' : ''}`}>
              {/* フォームエリア */}
              <div className={`${showPreview ? 'w-2/3' : 'w-full'} overflow-y-auto`}>
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                  {/* 基本情報 */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Basic Information</h3>

                    <Field>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Enter folder name..."
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                    </Field>

                    <Field>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Optional description..."
                        rows={2}
                        className="mt-1 block w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </Field>

                    {/* アイコンと色の選択 */}
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</Label>
                        <Input
                          value={formData.icon}
                          onChange={(e) => updateField('icon', e.target.value)}
                          placeholder="📁"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </Field>

                      <Field>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => updateField('color', e.target.value)}
                            className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
                          />
                          <Input
                            value={formData.color}
                            onChange={(e) => updateField('color', e.target.value)}
                            placeholder="#3B82F6"
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </Field>
                    </div>
                  </div>

                  {/* ルールエディター */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">Filter Rules</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.rules.length} rule{formData.rules.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <RuleEditor rules={formData.rules} onChange={handleRulesChange} />
                  </div>

                  {/* エラー表示 */}
                  {errors.submit != null && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* プレビューエリア */}
              {showPreview != null && (
                <div className="w-1/3 bg-gray-50 dark:bg-gray-800/50">
                  <RulePreview rules={formData.rules} items={previewItems} />
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim()}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  {folder ? 'Update Folder' : 'Create Folder'}
                </>
              )}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
