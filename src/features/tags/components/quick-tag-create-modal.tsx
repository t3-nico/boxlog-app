'use client'

import { useCallback, useState } from 'react'

import { Plus, X } from 'lucide-react'

// Tag interface
interface Tag {
  id: string
  name: string
  color: string
}

interface QuickTagCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTag: (tag: Omit<Tag, 'id'>) => void
}

export const QuickTagCreateModal = ({ isOpen, onClose, onCreateTag }: QuickTagCreateModalProps) => {
  const [tagName, setTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')

  // jsx-no-bind optimization: Event handlers
  const handleTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateTag()
      } else if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleCreateTag, handleClose]
  )

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  const createColorHandler = useCallback((color: string) => {
    return () => setSelectedColor(color)
  }, [])

  const presetColors = [
    '#ef4444', // red
    '#f59e0b', // yellow
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#f97316', // orange
  ]

  const handleCreateTag = useCallback(() => {
    if (tagName.trim()) {
      onCreateTag({
        name: tagName.trim(),
        color: selectedColor,
      })
      setTagName('')
      setSelectedColor('#3b82f6')
      onClose()
    }
  }, [tagName, selectedColor, onCreateTag, onClose])

  const handleClose = useCallback(() => {
    setTagName('')
    setSelectedColor('#3b82f6')
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        className="bg-opacity-50 fixed inset-0 z-50 bg-black"
        onClick={handleClose}
        onKeyDown={handleOverlayKeyDown}
        aria-label="モーダルを閉じる"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Tag</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          <div>
            <label htmlFor="tag-name-input" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tag Name
            </label>
            <input
              id="tag-name-input"
              type="text"
              value={tagName}
              onChange={handleTagNameChange}
              placeholder="Enter tag name..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <div className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" id="color-selection-label">
              Color
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="color-selection-label">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={createColorHandler(color)}
                  className={`h-10 w-10 rounded-lg transition-all hover:scale-105 ${
                    selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">Preview:</div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="text-sm text-gray-900 dark:text-white">{tagName || 'Tag name'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!tagName.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            <Plus className="h-4 w-4" />
            Create Tag
          </button>
        </div>
      </div>
    </>
  )
}
