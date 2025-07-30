'use client'

import { useState } from 'react'
import { Calendar, FileCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { EventCreateForm, type EventFormData } from '@/components/add-popup/EventCreateForm'
import { useEventStore } from '@/stores/useEventStore'

interface CalendarEventPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  defaultTime?: string
  defaultEndTime?: string
  editingEvent?: any
  onSuccess?: () => void
}

export function CalendarEventPopup({ 
  open, 
  onOpenChange, 
  defaultDate,
  defaultTime,
  defaultEndTime,
  editingEvent,
  onSuccess
}: CalendarEventPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null)
  const [isEventFormValid, setIsEventFormValid] = useState(false)
  const [activeTab, setActiveTab] = useState<'event' | 'log'>('event')
  
  const eventStore = useEventStore()

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    setEventFormData(null)
    setIsEventFormValid(false)
  }

  const handleSubmit = async () => {
    if (!(eventFormData && isEventFormValid)) {
      return
    }

    setIsSubmitting(true)
    try {
      // 編集モードかどうかで処理を分岐
      // タイムゾーン安全な日付作成
      let startDate: Date
      if (eventFormData.date) {
        const [year, month, day] = eventFormData.date.split('-').map(Number)
        const [hours, minutes] = (eventFormData.startTime || '00:00').split(':').map(Number)
        startDate = new Date()
        startDate.setFullYear(year, month - 1, day)
        startDate.setHours(hours, minutes, 0, 0)
      } else {
        startDate = new Date()
      }
      
      let endDate: Date | undefined
      if (eventFormData.date && eventFormData.endTime) {
        const [year, month, day] = eventFormData.date.split('-').map(Number)
        const [endHours, endMinutes] = eventFormData.endTime.split(':').map(Number)
        endDate = new Date()
        endDate.setFullYear(year, month - 1, day)
        endDate.setHours(endHours, endMinutes, 0, 0)
        
        // 終了時間が開始時間より早い場合は翌日扱い
        if (endDate <= startDate) {
          endDate.setDate(endDate.getDate() + 1)
        }
      }
      console.log('🆕 CREATE FLOW - Form data:', {
        date: eventFormData.date,
        startTime: eventFormData.startTime,
        endTime: eventFormData.endTime
      })
      console.log('🆕 CREATE FLOW - Converted dates:', {
        startDate: startDate,
        startDateISO: startDate.toISOString(),
        endDate: endDate,
        endDateISO: endDate?.toISOString()
      })
      
      const eventData = {
        title: eventFormData.title,
        description: eventFormData.description,
        startDate,
        endDate,
        status: eventFormData.status,
        priority: eventFormData.priority,
        color: eventFormData.color,
        isRecurring: eventFormData.isRecurring,
        recurrenceRule: eventFormData.isRecurring ? {
          type: eventFormData.recurrenceType || 'weekly',
          interval: eventFormData.recurrenceInterval || 1,
          endDate: eventFormData.recurrenceEndDate || null,
        } : undefined,
        items: eventFormData.items,
        location: eventFormData.location,
        url: eventFormData.url,
        tagIds: eventFormData.tagIds,
      }
      
      if (editingEvent) {
        // 編集モード
        await eventStore.updateEvent({
          ...eventData,
          id: editingEvent.id
        })
      } else {
        // 新規作成モード
        console.log('🚀 Creating event with data:', eventData)
        const createdEvent = await eventStore.createEvent(eventData)
        console.log('✅ Event created successfully:', createdEvent)
      }
      
      // Close popup on success
      handleClose()
      
      // Trigger success callback to refresh calendar
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 bg-popover text-popover-foreground flex flex-col">
        <VisuallyHidden>
          <DialogTitle>
            {editingEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}
          </DialogTitle>
          <DialogDescription>
            {editingEvent ? 'Edit your calendar event details' : 'Create a new calendar event'}
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="w-full flex-shrink-0">
          <div className="flex bg-popover p-2">
            <div className="flex h-auto gap-1">
              <button 
                onClick={() => setActiveTab('event')}
                className={`flex items-center gap-2 px-4 py-3 transition-colors rounded-md ${
                  activeTab === 'event' 
                    ? 'bg-zinc-950/5 dark:bg-white/5 font-medium' 
                    : 'bg-transparent hover:bg-zinc-950/5 dark:hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Event
              </button>
              <button 
                onClick={() => setActiveTab('log')}
                className={`flex items-center gap-2 px-4 py-3 transition-colors rounded-md ${
                  activeTab === 'log' 
                    ? 'bg-zinc-950/5 dark:bg-white/5 font-medium' 
                    : 'bg-transparent hover:bg-zinc-950/5 dark:hover:bg-white/5'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Log
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-0">
          <div className="p-6 h-full overflow-y-auto">
            {activeTab === 'event' && (
              <EventCreateForm 
                contextData={null} // カレンダー専用なのでcontextDataは常にnull
                onFormDataChange={setEventFormData}
                onFormValidChange={setIsEventFormValid}
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                defaultEndTime={defaultEndTime}
              />
            )}
            {activeTab === 'log' && (
              <div className="text-center text-muted-foreground py-8">
                Log機能は準備中です
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Ctrl+Enter to submit • {activeTab === 'event' ? 'Event' : 'Log'}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || (activeTab === 'event' ? !isEventFormValid : false)}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {activeTab === 'event' ? 'Creating...' : 'Saving...'}
                  </div>
                ) : (
                  activeTab === 'event' 
                    ? (editingEvent ? 'Update Event' : 'Create Event')
                    : 'Save Log'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}