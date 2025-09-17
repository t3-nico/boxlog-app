'use client'

import React from 'react'

import { Loader2, X } from 'lucide-react'

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
  initialData
}: EssentialInspectorViewProps) => {
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
        status: 'backlog'
      })
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h1>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || isSubmitting}
          className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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