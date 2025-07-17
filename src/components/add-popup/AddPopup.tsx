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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* ClickUp-style Header */}
        <div className="relative">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    Choose what you'd like to create
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-white/50 dark:hover:bg-black/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ClickUp-style Tab Navigation */}
        <Tabs defaultValue={defaultTab} className="w-full flex-1">
          <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-b">
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger 
                value="schedule" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
              >
                <Calendar className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Schedule</div>
                  <div className="text-xs opacity-80">Plan future work</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="record" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg"
              >
                <FileCheck className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Record</div>
                  <div className="text-xs opacity-80">Log completed work</div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="schedule" className="mt-0 h-full">
              <div className="p-6 h-[500px] overflow-y-auto">
                <ScheduleCreateForm contextData={contextData} />
              </div>
            </TabsContent>
            
            <TabsContent value="record" className="mt-0 h-full">
              <div className="p-6 h-[500px] overflow-y-auto">
                <RecordCreateForm contextData={contextData} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* ClickUp-style Footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Quick Create
              </Badge>
              <span className="text-xs text-muted-foreground">
                Ctrl+Enter to submit
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} size="sm">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[120px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { CreateContextData }