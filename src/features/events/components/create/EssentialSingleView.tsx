'use client'

import React from 'react'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialSingleViewProps {
  isOpen: boolean
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

export const EssentialSingleView = ({
  isOpen,
  onClose,
  onSave,
  _onDelete,
  isEditMode = false,
  _initialData
}: EssentialSingleViewProps) => {

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      await onSave({
        title: 'Default Title',
        tags: [],
        status: 'backlog'
      })
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {isEditMode ? 'Edit Event' : 'Create Event'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              placeholder="Event title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}