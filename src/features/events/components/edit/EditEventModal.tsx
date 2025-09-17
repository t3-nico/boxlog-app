'use client'

import React from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn-ui/dialog'

import { useCreateModalStore } from '../../stores/useCreateModalStore'
import type { Event } from '../../types/events'
import { CreateEventForm } from '../create/CreateEventForm'

interface EditEventModalProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditEventModal = ({
  event,
  open,
  onOpenChange
}: EditEventModalProps) => {
  const { closeModal: _closeModal } = useCreateModalStore()

  const handleSubmit = async (data: unknown) => {
    // Event update tracked in Issue #89
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