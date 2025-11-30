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
  folder?: SmartFolder | undefined
  previewItems?: unknown[] | undefined
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
        <DialogPanel className="bg-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg shadow-xl">
          {/* ヘッダー */}
          <div className="border-border flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <FolderIcon className="text-primary h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-foreground text-lg font-semibold">
                  {folder ? 'Edit Smart Folder' : 'Create Smart Folder'}
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  {folder ? 'Modify your existing smart folder' : 'Create a new smart folder with custom rules'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="border-border bg-card text-foreground hover:bg-foreground/8 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground hover:bg-foreground/8 rounded-md p-2 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-hidden">
            <div className={`flex h-full ${showPreview ? 'divide-border divide-x' : ''}`}>
              {/* フォームエリア */}
              <div className={`${showPreview ? 'w-2/3' : 'w-full'} overflow-y-auto`}>
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                  {/* 基本情報 */}
                  <div className="space-y-4">
                    <h3 className="text-md text-foreground font-medium">Basic Information</h3>

                    <Field>
                      <Label htmlFor="folder-name" className="text-muted-foreground text-sm font-medium">
                        Folder Name *
                      </Label>
                      <Input
                        id="folder-name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Enter folder name..."
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                      />
                      {errors.name ? <p className="text-destructive mt-1 text-sm">{errors.name}</p> : null}
                    </Field>

                    <Field>
                      <Label htmlFor="folder-description" className="text-muted-foreground text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="folder-description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Optional description..."
                        rows={2}
                        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                      />
                    </Field>

                    {/* アイコンと色の選択 */}
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Label htmlFor="folder-icon" className="text-muted-foreground text-sm font-medium">
                          Icon
                        </Label>
                        <Input
                          id="folder-icon"
                          value={formData.icon}
                          onChange={(e) => updateField('icon', e.target.value)}
                          placeholder="📁"
                          className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                        />
                      </Field>

                      <Field>
                        <Label htmlFor="folder-color" className="text-muted-foreground text-sm font-medium">
                          Color
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            id="folder-color"
                            type="color"
                            value={formData.color}
                            onChange={(e) => updateField('color', e.target.value)}
                            className="border-border h-8 w-8 rounded border"
                          />
                          <Input
                            value={formData.color}
                            onChange={(e) => updateField('color', e.target.value)}
                            placeholder="#3B82F6"
                            className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                          />
                        </div>
                      </Field>
                    </div>
                  </div>

                  {/* ルールエディター */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md text-foreground font-medium">Filter Rules</h3>
                      <span className="text-muted-foreground text-xs">
                        {formData.rules.length} rule{formData.rules.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <RuleEditor rules={formData.rules} onChange={handleRulesChange} />
                  </div>

                  {/* エラー表示 */}
                  {errors.submit != null && (
                    <div className="bg-destructive/10 border-destructive/30 rounded-md border p-3">
                      <p className="text-destructive text-sm">{errors.submit}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* プレビューエリア */}
              {showPreview != null && (
                <div className="bg-muted/50 w-1/3">
                  <RulePreview rules={formData.rules} items={previewItems} />
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="border-border bg-muted/50 flex items-center justify-end gap-3 border-t p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="border-border bg-card text-foreground hover:bg-foreground/8 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/92 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="border-border h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
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
