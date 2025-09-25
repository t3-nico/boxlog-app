'use client'

import { useCallback, useState } from 'react'

import { Check, Edit2, Plus, Trash2, X } from 'lucide-react'

// Tag interface
interface Tag {
  id: string
  name: string
  color: string
  parentId?: string | null
  isExpanded?: boolean
}

interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
  onCreateTag: (tag: { name: string; color: string; parentId?: string | null }) => void
  onUpdateTag: (id: string, updates: { name?: string; color?: string; parentId?: string | null }) => void
  onDeleteTag: (id: string) => void
}

export const TagManagementModal = ({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagementModalProps) => {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [newTagParentId, setNewTagParentId] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editParentId, setEditParentId] = useState<string | null>(null)

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
    if (newTagName.trim() && !tags.some((t) => t.name === newTagName.trim())) {
      onCreateTag({
        name: newTagName.trim(),
        color: newTagColor,
        parentId: newTagParentId,
      })
      setNewTagName('')
      setNewTagColor('#3b82f6')
      setNewTagParentId(null)
    }
  }, [newTagName, newTagColor, newTagParentId, tags, onCreateTag])

  const handleEditTag = useCallback((tag: Tag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setEditParentId(tag.parentId || null)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editingTag && editName.trim()) {
      onUpdateTag(editingTag, {
        name: editName.trim(),
        color: editColor,
        parentId: editParentId,
      })
      setEditingTag(null)
      setEditName('')
      setEditColor('')
      setEditParentId(null)
    }
  }, [editingTag, editName, editColor, editParentId, onUpdateTag])

  const handleCancelEdit = useCallback(() => {
    setEditingTag(null)
    setEditName('')
    setEditColor('')
    setEditParentId(null)
  }, [])

  // useCallback handlers for jsx-no-bind optimization
  const handleNewTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value)
  }, [])

  const handleNewTagNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateTag()
      }
    },
    [handleCreateTag]
  )

  const handleNewTagParentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTagParentId(e.target.value || null)
  }, [])

  const handleEditNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value)
  }, [])

  const handleEditNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSaveEdit()
      } else if (e.key === 'Escape') {
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  const handleEditParentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditParentId(e.target.value || null)
  }, [])

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  const handleNewTagColorSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const color = event.currentTarget.dataset.color
    if (color) {
      setNewTagColor(color)
    }
  }, [])

  const handleEditColorSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const color = event.currentTarget.dataset.color
    if (color) {
      setEditColor(color)
    }
  }, [])

  const handleEditClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const tagId = event.currentTarget.dataset.tagId
      const tag = tags.find((t) => t.id === tagId)
      if (tag) {
        handleEditTag(tag)
      }
    },
    [tags, handleEditTag]
  )

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const tagId = event.currentTarget.dataset.tagId
      const tagName = event.currentTarget.dataset.tagName
      if (tagId && tagName && confirm(`Delete tag "${tagName}"? This will remove it from all events.`)) {
        onDeleteTag(tagId)
      }
    },
    [onDeleteTag]
  )

  // 親タグとして選択可能なタグを取得（循環参照を防ぐ）
  const getAvailableParentTags = (excludeId?: string) => {
    if (!excludeId) return tags

    // 自分自身と自分の子孫は親として選択できない
    const descendants = new Set<string>()
    const findDescendants = (parentId: string) => {
      tags.forEach((tag) => {
        if (tag.parentId === parentId) {
          descendants.add(tag.id)
          findDescendants(tag.id)
        }
      })
    }
    findDescendants(excludeId)

    return tags.filter((tag) => tag.id !== excludeId && !descendants.has(tag.id))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
        aria-label="モーダルを閉じる"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-96 -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tag Management</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Create New Tag */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Create New Tag</h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="new-tag-name"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Name
                </label>
                <input
                  id="new-tag-name"
                  type="text"
                  value={newTagName}
                  onChange={handleNewTagNameChange}
                  placeholder="Enter tag name..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  onKeyDown={handleNewTagNameKeyDown}
                />
              </div>

              <div>
                <label
                  htmlFor="new-tag-parent"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Parent Tag (Optional)
                </label>
                <select
                  id="new-tag-parent"
                  value={newTagParentId || ''}
                  onChange={handleNewTagParentChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">None (Root Level)</option>
                  {getAvailableParentTags().map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div
                  className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  id="new-tag-color-label"
                >
                  Color
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="new-tag-color-label">
                  {presetColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={handleNewTagColorSelect}
                      data-color={color}
                      className={`h-8 w-8 rounded-lg transition-all hover:scale-110 ${
                        newTagColor === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                <Plus className="h-4 w-4" />
                Create Tag
              </button>
            </div>
          </div>

          {/* Existing Tags */}
          <div className="p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Existing Tags ({tags.length})</h3>

            {tags.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-sm">No tags created yet</div>
                <div className="mt-1 text-xs">Create your first tag above</div>
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                  >
                    {editingTag === tag.id ? (
                      <>
                        {/* Edit Mode */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={handleEditNameChange}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            onKeyDown={handleEditNameKeyDown}
                          />

                          <select
                            value={editParentId || ''}
                            onChange={handleEditParentChange}
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">None (Root Level)</option>
                            {getAvailableParentTags(editingTag!).map((parentTag) => (
                              <option key={parentTag.id} value={parentTag.id}>
                                {parentTag.name}
                              </option>
                            ))}
                          </select>

                          <div className="flex gap-2">
                            {presetColors.map((color) => (
                              <button
                                type="button"
                                key={color}
                                onClick={handleEditColorSelect}
                                data-color={color}
                                className={`h-6 w-6 rounded transition-all ${
                                  editColor === color ? 'ring-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="rounded p-1 text-green-600 transition-colors hover:bg-green-100 dark:hover:bg-green-900"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Display Mode */}
                        <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                        <div className="flex-1">
                          <span className="text-sm text-gray-900 dark:text-white">{tag.name}</span>
                          {tag.parentId != null && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Parent: {tags.find((t) => t.id === tag.parentId)?.name || 'Unknown'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={handleEditClick}
                            data-tag-id={tag.id}
                            className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900"
                            title="Edit tag"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteClick}
                            data-tag-id={tag.id}
                            data-tag-name={tag.name}
                            className="rounded p-1 text-red-600 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
                            title="Delete tag"
                          >
                            <Trash2 className="h-3 w-3" />
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
        <div className="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
