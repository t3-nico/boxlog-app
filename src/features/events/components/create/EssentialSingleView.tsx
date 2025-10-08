// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

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
  _initialData,
}: EssentialSingleViewProps) => {
  if (!isOpen) return null

  const handleSave = async () => {
    try {
      await onSave({
        title: 'Default Title',
        tags: [],
        status: 'backlog',
      })
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClose()
          }
        }}
      />

      <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="event-title" className="mb-2 block text-sm font-medium">
              Title
            </label>
            <input
              id="event-title"
              type="text"
              placeholder="Event title"
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
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
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
