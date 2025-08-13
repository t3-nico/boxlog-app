'use client'

import { useState } from 'react'
import { Calendar, FileCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EventCreateForm, type EventFormData } from './EventCreateForm'
import { LogCreateForm, type LogFormData } from './LogCreateForm'
// import { createTaskRecord } from '@/lib/supabase/task-records' // Temporarily commented out - using localStorage instead
import { useEventStore } from '@/features/events'

interface AddPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'event' | 'log'
  contextData?: CreateContextData
  editingEvent?: any // 編集中のイベントデータ
  defaultDate?: Date
  defaultTime?: string
  defaultEndTime?: string
}

interface CreateContextData {
  // Task context
  status?: 'Todo' | 'In Progress' | 'Done' | 'Backlog' | 'Cancelled'
  dueDate?: Date
  tags?: string[]
  
  // Common
  defaultColor?: string
  priority?: 'Low' | 'Medium' | 'High'
  
  // Event editing
  editingEvent?: any
}

export function AddPopup({ 
  open, 
  onOpenChange, 
  defaultTab = 'event',
  contextData,
  editingEvent,
  defaultDate,
  defaultTime,
  defaultEndTime 
}: AddPopupProps) {
  console.log('🔍 AddPopup rendered with:', { open, editingEvent, defaultTab })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'event' | 'log'>(defaultTab)
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null)
  const [logFormData, setLogFormData] = useState<LogFormData | null>(null)
  const [isEventFormValid, setIsEventFormValid] = useState(false)
  const [isLogFormValid, setIsLogFormValid] = useState(false)
  
  const eventStore = useEventStore()

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    setEventFormData(null)
    setLogFormData(null)
    setIsEventFormValid(false)
    setIsLogFormValid(false)
  }

  const handleSubmit = async () => {
    console.log('🎯 AddPopup: Submit button clicked', { 
      activeTab, 
      hasEventData: !!eventFormData,
      isEventFormValid,
      hasLogData: !!logFormData,
      isLogFormValid
    })
    
    if (!((activeTab === 'event' && eventFormData && isEventFormValid) || 
          (activeTab === 'log' && logFormData && isLogFormValid))) {
      console.log('❌ AddPopup: Form validation failed, skipping submit')
      return
    }

    setIsSubmitting(true)
    try {
      if (activeTab === 'event' && eventFormData) {
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
        
        console.log('📅 AddPopup creating event with dates:', {
          date: eventFormData.date,
          startTime: eventFormData.startTime,
          endTime: eventFormData.endTime,
          startDate,
          endDate
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
          reminders: eventFormData.reminders,
          tagIds: eventFormData.tagIds,
        }
        
        if (editingEvent) {
          // 編集モード
          console.log('🔄 AddPopup: Updating existing event', editingEvent.id)
          await eventStore.updateEvent({
            ...eventData,
            id: editingEvent.id
          })
          console.log('✅ AddPopup: Event updated successfully')
        } else {
          // 新規作成モード
          console.log('🚀 AddPopup: Creating new event with data:', eventData)
          await eventStore.createEvent(eventData)
          console.log('✅ AddPopup: Event created successfully')
        }
      } else if (activeTab === 'log' && logFormData) {
        // TODO: Implement localStorage-based log creation
        console.log('Log creation temporarily disabled - localStorage implementation needed:', logFormData)
      }
      
      // Close popup on success
      handleClose()
    } catch (error) {
      console.error('Failed to submit form:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = activeTab === 'event' ? isEventFormValid : isLogFormValid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 bg-popover text-popover-foreground flex flex-col">
        <VisuallyHidden>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Create New Item'}
          </DialogTitle>
        </VisuallyHidden>
        
        {/* Tab Navigation at the top - Fixed position */}
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

        {/* Tab Content - Expandable area */}
        <div className="flex-1 min-h-0">
          {activeTab === 'event' && (
            <div className="p-6 h-full overflow-y-auto">
              <EventCreateForm 
                contextData={{
                  ...contextData,
                  editingEvent: editingEvent
                }}
                onFormDataChange={setEventFormData}
                onFormValidChange={setIsEventFormValid}
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                defaultEndTime={defaultEndTime}
              />
            </div>
          )}
          
          {activeTab === 'log' && (
            <div className="p-6 h-full overflow-y-auto">
              <LogCreateForm 
                contextData={contextData}
                onFormDataChange={setLogFormData}
                onFormValidChange={setIsLogFormValid}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Ctrl+Enter to submit
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  editingEvent ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { CreateContextData }