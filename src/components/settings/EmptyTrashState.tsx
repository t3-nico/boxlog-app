'use client'

import { Trash2 as TrashIcon } from 'lucide-react'

export const EmptyTrashState = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <TrashIcon className="w-6 h-6 text-gray-400" data-slot="icon" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Trash is empty
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Deleted items will appear here and be kept for 30 days before being permanently removed.
      </p>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        When you delete tasks, events, tags, or folders, they&apos;ll be moved here first for safety.
      </div>
    </div>
  )
}