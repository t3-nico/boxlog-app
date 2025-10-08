// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import React from 'react'

import { Loader2, X } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialInspectorViewProps {
  onClose: () => void
  onSave: (data: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
    status?: 'backlog' | 'scheduled'
  }) => Promise<void>
  onDelete?: () => Promise<void>
  isEditMode?: boolean
  initialData?: {
    title?: string
    date?: Date
    endDate?: Date
    tags?: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
  }
}

export const EssentialInspectorView = ({
  onClose,
  onSave,
  _onDelete,
  isEditMode = false,
  initialData,
}: EssentialInspectorViewProps) => {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [title, setTitle] = React.useState(initialData?.title || '')

  const isValid = title.trim().length > 0

  const handleSave = async () => {
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSave({
        title: title,
        tags: [],
        status: 'backlog',
      })
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h1>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <label
            htmlFor="event-title-input"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            id="event-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('calendar.event.enterEventTitle')}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <span>{isEditMode ? 'Update' : 'Create'}</span>
          )}
        </button>
      </div>
    </div>
  )
}
