'use client'

import React, { useState } from 'react'

import { X, Plus } from 'lucide-react'

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

export const QuickTagCreateModal = ({
  isOpen,
  onClose,
  onCreateTag
}: QuickTagCreateModalProps) => {
  const [tagName, setTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')

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

  const handleCreateTag = () => {
    if (tagName.trim()) {
      onCreateTag({
        name: tagName.trim(),
        color: selectedColor
      })
      setTagName('')
      setSelectedColor('#3b82f6')
      onClose()
    }
  }

  const handleClose = () => {
    setTagName('')
    setSelectedColor('#3b82f6')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Tag
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="tag-name-input" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tag Name
            </label>
            <input
              id="tag-name-input"
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTag()
                } else if (e.key === 'Escape') {
                  handleClose()
                }
              }}
              autoFocus
            />
          </div>
          
          <div>
            <div className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" id="color-selection-label">
              Color
            </div>
            <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="color-selection-label">
              {presetColors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all hover:scale-105 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
              Preview:
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm text-gray-900 dark:text-white">
                {tagName || 'Tag name'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTag}
            disabled={!tagName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create Tag
          </button>
        </div>
      </div>
    </>
  )
}