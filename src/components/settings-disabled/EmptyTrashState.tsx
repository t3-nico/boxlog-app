'use client'

import { Trash2 as TrashIcon } from 'lucide-react'

export const EmptyTrashState = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
        <TrashIcon className="w-6 h-6 text-muted-foreground" data-slot="icon" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Trash is empty
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Deleted items will appear here and be kept for 30 days before being permanently removed.
      </p>
      <div className="text-xs text-muted-foreground">
        When you delete tasks, events, tags, or folders, they&apos;ll be moved here first for safety.
      </div>
    </div>
  )
}