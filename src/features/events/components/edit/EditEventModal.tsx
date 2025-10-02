// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn-ui/dialog'
import { ErrorBoundary } from '@/components/error-boundary'

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

        <ErrorBoundary
          fallback={
            <div className="p-6 text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <p className="font-semibold mb-2">イベント編集フォームでエラーが発生しました</p>
                <p className="text-sm">モーダルを閉じてもう一度お試しください。</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          }
        >
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
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}