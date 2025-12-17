'use client'

import { useCallback, useState } from 'react'

import { Check, Edit2, Plus, Trash2, X } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)

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

  const handleNewTagParentChange = useCallback((value: string) => {
    setNewTagParentId(value || null)
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

  const handleEditParentChange = useCallback((value: string) => {
    setEditParentId(value || null)
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
      const tag = tags.find((t) => t.id === tagId)
      if (tag) {
        setDeletingTag(tag)
      }
    },
    [tags]
  )

  const handleConfirmDelete = useCallback(() => {
    if (deletingTag) {
      onDeleteTag(deletingTag.id)
      setDeletingTag(null)
    }
  }, [deletingTag, onDeleteTag])

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
        className="bg-opacity-50 fixed inset-0 z-50 bg-black"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
        aria-label="モーダルを閉じる"
      />

      {/* Modal */}
      <div className="bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-96 -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-semibold">Tag Management</h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Create New Tag */}
          <div className="border-border border-b p-4">
            <h3 className="text-foreground mb-3 text-sm font-medium">Create New Tag</h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="new-tag-name" className="text-muted-foreground mb-1 block text-xs font-medium">
                  Name
                </label>
                <Input
                  id="new-tag-name"
                  type="text"
                  value={newTagName}
                  onChange={handleNewTagNameChange}
                  placeholder="Enter tag name..."
                  onKeyDown={handleNewTagNameKeyDown}
                />
              </div>

              <div>
                <label htmlFor="new-tag-parent" className="text-muted-foreground mb-1 block text-xs font-medium">
                  Parent Tag (Optional)
                </label>
                <Select value={newTagParentId || ''} onValueChange={handleNewTagParentChange}>
                  <SelectTrigger id="new-tag-parent" className="w-full">
                    <SelectValue placeholder="None (Root Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Root Level)</SelectItem>
                    {getAvailableParentTags().map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-muted-foreground mb-2 block text-xs font-medium" id="new-tag-color-label">
                  Color
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="new-tag-color-label">
                  {presetColors.map((color) => (
                    <Button
                      type="button"
                      variant="ghost"
                      key={color}
                      onClick={handleNewTagColorSelect}
                      data-color={color}
                      className={cn(
                        'h-8 w-8 rounded-lg p-0 transition-all hover:scale-110 hover:bg-transparent',
                        newTagColor === color && 'ring-2 ring-gray-400 ring-offset-2'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                Create Tag
              </Button>
            </div>
          </div>

          {/* Existing Tags */}
          <div className="p-4">
            <h3 className="text-foreground mb-3 text-sm font-medium">Existing Tags ({tags.length})</h3>

            {tags.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <div className="text-sm">No tags created yet</div>
                <div className="mt-1 text-xs">Create your first tag above</div>
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="border-border bg-surface-container flex items-center gap-3 rounded-lg border p-3"
                  >
                    {editingTag === tag.id ? (
                      <>
                        {/* Edit Mode */}
                        <div className="flex-1 space-y-2">
                          <Input
                            type="text"
                            value={editName}
                            onChange={handleEditNameChange}
                            onKeyDown={handleEditNameKeyDown}
                          />

                          <Select value={editParentId || ''} onValueChange={handleEditParentChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="None (Root Level)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None (Root Level)</SelectItem>
                              {getAvailableParentTags(editingTag!).map((parentTag) => (
                                <SelectItem key={parentTag.id} value={parentTag.id}>
                                  {parentTag.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            {presetColors.map((color) => (
                              <Button
                                type="button"
                                variant="ghost"
                                key={color}
                                onClick={handleEditColorSelect}
                                data-color={color}
                                className={cn(
                                  'h-6 w-6 rounded p-0 transition-all hover:bg-transparent',
                                  editColor === color && 'ring-2 ring-blue-500'
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleSaveEdit}
                            className="text-primary"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleCancelEdit}
                            className="text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Display Mode */}
                        <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                        <div className="flex-1">
                          <span className="text-foreground text-sm">{tag.name}</span>
                          {tag.parentId != null && (
                            <div className="text-muted-foreground text-xs">
                              Parent: {tags.find((t) => t.id === tag.parentId)?.name || 'Unknown'}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleEditClick}
                            data-tag-id={tag.id}
                            className="text-primary size-6"
                            title="Edit tag"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleDeleteClick}
                            data-tag-id={tag.id}
                            data-tag-name={tag.name}
                            className="text-destructive size-6"
                            title="Delete tag"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
        <div className="border-border flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Delete tag &quot;{deletingTag?.name}&quot;? This will remove it from all events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
