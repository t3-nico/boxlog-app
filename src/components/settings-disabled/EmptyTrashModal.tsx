'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle as ExclamationTriangleIcon } from 'lucide-react'

interface EmptyTrashModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemCount: number
}

export const EmptyTrashModal = ({ open, onClose, onConfirm, itemCount }: EmptyTrashModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Empty Trash</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="mt-2">
          Are you sure you want to permanently delete all {itemCount} item{itemCount === 1 ? '' : 's'} in trash? 
          This action cannot be undone.
        </DialogDescription>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
          >
            Empty Trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}