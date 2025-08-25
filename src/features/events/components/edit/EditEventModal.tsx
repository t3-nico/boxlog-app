'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn-ui/dialog'
import { CreateEventForm } from '../create/CreateEventForm'
import { useCreateModalStore } from '../../stores/useCreateModalStore'
import type { Event } from '../../types/events'

interface EditEventModalProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEventModal({
  event,
  open,
  onOpenChange
}: EditEventModalProps) {
  const { closeModal } = useCreateModalStore()

  const handleSubmit = async (data: any) => {
    // TODO: イベント更新処理を実装
    console.log('Updating event:', event.id, data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        
        <CreateEventForm
          initialData={{
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            type: event.type,
            status: event.status,
            priority: event.priority,
            tags: event.tags?.map(tag => tag.id) || []
          }}
          context={{
            source: 'edit',
            mode: 'edit',
            eventId: event.id
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}