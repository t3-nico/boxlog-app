'use client'

import { useCallback, useState } from 'react'

import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()

  // jsx-no-bind optimization: Event handlers
  const handleTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value)
  }, [])

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
        aria-label={t('aria.closeModal')}
      />

      {/* Modal */}
      <div className="bg-popover fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-lg shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-semibold">Create New Tag</h2>
          <button type="button" onClick={handleClose} className="hover:bg-state-hover rounded-lg p-1 transition-colors">
            <X className="text-muted-foreground h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          <div>
            <label htmlFor="tag-name-input" className="text-muted-foreground mb-2 block text-sm font-medium">
              Tag Name
            </label>
            <input
              id="tag-name-input"
              type="text"
              value={tagName}
              onChange={handleTagNameChange}
              placeholder="Enter tag name..."
              className="border-border text-foreground focus:ring-primary w-full rounded-lg border bg-transparent px-3 py-2 focus:border-transparent focus:ring-2"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <div className="text-muted-foreground mb-2 block text-sm font-medium" id="color-selection-label">
              Color
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="color-selection-label">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={createColorHandler(color)}
                  className={`h-10 w-10 rounded-lg transition-all hover:scale-105 ${
                    selectedColor === color ? 'ring-primary ring-2 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-muted-foreground mb-2 text-xs font-medium">Preview:</div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="text-foreground text-sm">{tagName || 'Tag name'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex justify-end gap-2 border-t p-4">
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:bg-state-hover rounded-lg px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!tagName.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-surface-container disabled:text-muted-foreground flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Tag
          </button>
        </div>
      </div>
    </>
  )
}
