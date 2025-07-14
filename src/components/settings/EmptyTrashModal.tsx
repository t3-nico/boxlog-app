'use client'

import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Button } from '@/components/button'
import { AlertTriangle as ExclamationTriangleIcon } from 'lucide-react'

interface EmptyTrashModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemCount: number
}

export const EmptyTrashModal = ({ open, onClose, onConfirm, itemCount }: EmptyTrashModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogBody>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <DialogTitle>Empty Trash</DialogTitle>
            <DialogDescription className="mt-2">
              Are you sure you want to permanently delete all {itemCount} item{itemCount === 1 ? '' : 's'} in trash? 
              This action cannot be undone.
            </DialogDescription>
          </div>
        </div>
      </DialogBody>
      
      <DialogActions>
        <Button 
          outline 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          color="red"
          onClick={onConfirm}
        >
          Empty Trash
        </Button>
      </DialogActions>
    </Dialog>
  )
}