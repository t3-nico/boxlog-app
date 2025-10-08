// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useCreateModalStore } from '../../stores/useCreateModalStore'
import type { Event } from '../../types/events'
import { CreateEventForm } from '../create/CreateEventForm'

interface EditEventModalProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditEventModal = ({ event, open, onOpenChange }: EditEventModalProps) => {
  const { closeModal: _closeModal } = useCreateModalStore()

  const handleSubmit = async (data: unknown) => {
    // Event update tracked in Issue #89
    console.log('Updating event:', event.id, data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <ErrorBoundary
          fallback={
            <div className="p-6 text-center">
              <div className="mb-4 text-red-600 dark:text-red-400">
                <p className="mb-2 font-semibold">イベント編集フォームでエラーが発生しました</p>
                <p className="text-sm">モーダルを閉じてもう一度お試しください。</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
              tags: event.tags?.map((tag) => tag.id) || [],
            }}
            context={{
              source: 'edit',
              mode: 'edit',
              eventId: event.id,
            }}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
