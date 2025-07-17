'use client'

import { useState } from 'react'
import { Calendar, FileCheck, X, Plus, Zap } from 'lucide-react'
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
import { ScheduleCreateForm } from './ScheduleCreateForm'
import { RecordCreateForm } from './RecordCreateForm'

interface AddPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'schedule' | 'record'
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
  defaultTab = 'schedule',
  contextData 
}: AddPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Implement form submission logic
      console.log('Submitting form')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Close popup on success
      handleClose()
    } catch (error) {
      console.error('Failed to submit form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0">
        {/* Tab Navigation at the top */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="record" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <FileCheck className="w-4 h-4 mr-2" />
              Record
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="schedule" className="mt-0">
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ScheduleCreateForm contextData={contextData} />
            </div>
          </TabsContent>
          
          <TabsContent value="record" className="mt-0">
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <RecordCreateForm contextData={contextData} />
            </div>
          </TabsContent>
        </Tabs>

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
                disabled={isSubmitting}
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