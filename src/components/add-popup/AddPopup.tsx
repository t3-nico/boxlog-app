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
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EventCreateForm, type EventFormData } from './EventCreateForm'
import { LogCreateForm, type LogFormData } from './LogCreateForm'
import { createEvent } from '@/lib/supabase/events'
import { createTaskRecord } from '@/lib/supabase/task-records'

interface AddPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'event' | 'log'
  contextData?: CreateContextData
}

interface CreateContextData {
  // Task context
  status?: 'Todo' | 'In Progress' | 'Done' | 'Backlog' | 'Cancelled'
  dueDate?: Date
  tags?: string[]
  
  // Common
  defaultColor?: string
  priority?: 'Low' | 'Medium' | 'High'
}

export function AddPopup({ 
  open, 
  onOpenChange, 
  defaultTab = 'event',
  contextData 
}: AddPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'event' | 'log'>(defaultTab)
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null)
  const [logFormData, setLogFormData] = useState<LogFormData | null>(null)
  const [isEventFormValid, setIsEventFormValid] = useState(false)
  const [isLogFormValid, setIsLogFormValid] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    setEventFormData(null)
    setLogFormData(null)
    setIsEventFormValid(false)
    setIsLogFormValid(false)
  }

  const handleSubmit = async () => {
    if (!((activeTab === 'event' && eventFormData && isEventFormValid) || 
          (activeTab === 'log' && logFormData && isLogFormValid))) {
      return
    }

    setIsSubmitting(true)
    try {
      if (activeTab === 'event' && eventFormData) {
        await createEvent(eventFormData)
        console.log('Event created successfully')
      } else if (activeTab === 'log' && logFormData) {
        await createTaskRecord(logFormData)
        console.log('Task record created successfully')
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
                contextData={contextData}
                onFormDataChange={setEventFormData}
                onFormValidChange={setIsEventFormValid}
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
                  'Create'
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