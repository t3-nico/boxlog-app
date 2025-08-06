'use client'

import React, { useState } from 'react'
import { X, Edit2, Trash2, Check, Plus } from 'lucide-react'

// Tag interface
interface Tag {
  id: string
  name: string
  color: string
}

interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
  onCreateTag: (tag: Omit<Tag, 'id'>) => void
  onUpdateTag: (id: string, updates: Partial<Tag>) => void
  onDeleteTag: (id: string) => void
}

export function TagManagementModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag
}: TagManagementModalProps) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

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
    if (newTagName.trim() && !tags.some(t => t.name === newTagName.trim())) {
      onCreateTag({
        name: newTagName.trim(),
        color: newTagColor
      })
      setNewTagName('')
      setNewTagColor('#3b82f6')
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleSaveEdit = () => {
    if (editingTag && editName.trim()) {
      onUpdateTag(editingTag, {
        name: editName.trim(),
        color: editColor
      })
      setEditingTag(null)
      setEditName('')
      setEditColor('')
    }
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
    setEditName('')
    setEditColor('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tag Management
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Create New Tag */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Create New Tag
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTag()
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                        newTagColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create Tag
              </button>
            </div>
          </div>

          {/* Existing Tags */}
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Existing Tags ({tags.length})
            </h3>
            
            {tags.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-sm">No tags created yet</div>
                <div className="text-xs mt-1">Create your first tag above</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  >
                    {editingTag === tag.id ? (
                      <>
                        {/* Edit Mode */}
                        <div className="flex gap-2">
                          {presetColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className={`w-6 h-6 rounded transition-all ${
                                editColor === color ? 'ring-2 ring-blue-500' : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit()
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Display Mode */}
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                          {tag.name}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Edit tag"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete tag "${tag.name}"? This will remove it from all events.`)) {
                                onDeleteTag(tag.id)
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                            title="Delete tag"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}