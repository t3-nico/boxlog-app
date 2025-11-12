'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TagSelector } from '@/features/tags/components/tag-selector'

interface TicketTagSelectDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
}

export function TicketTagSelectDialog({ isOpen, onClose, selectedTagIds, onTagsChange }: TicketTagSelectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>タグを選択</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TagSelector
            selectedTagIds={selectedTagIds}
            onTagsChange={onTagsChange}
            placeholder="Select tags..."
            enableCreate={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
