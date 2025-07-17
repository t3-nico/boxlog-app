'use client'

import { useState } from 'react'
import { Calendar, FileCheck, X } from 'lucide-react'
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
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-hidden">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                新しいアイテムを作成
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                予定の作成または活動の記録ができます
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="schedule" 
              className="flex items-center gap-2 py-2.5"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">予定</span>
            </TabsTrigger>
            <TabsTrigger 
              value="record" 
              className="flex items-center gap-2 py-2.5"
            >
              <FileCheck className="w-4 h-4" />
              <span className="font-medium">記録</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="min-h-[400px] max-h-[400px] overflow-y-auto">
            <TabsContent value="schedule" className="mt-0">
              <ScheduleCreateForm contextData={contextData} />
            </TabsContent>
            
            <TabsContent value="record" className="mt-0">
              <RecordCreateForm contextData={contextData} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-muted-foreground"
              >
                Ctrl+Enter
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    作成中...
                  </div>
                ) : (
                  '作成'
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