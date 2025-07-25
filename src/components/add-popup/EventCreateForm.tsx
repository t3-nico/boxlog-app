'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, Plus, X, Check, Tag as TagIcon, Clock, Repeat,
  AlertTriangle, Star, Circle, ArrowRight, MoreHorizontal 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSidebarStore } from '@/stores/sidebarStore'
import { CreateContextData } from './AddPopup'
import type { EventType, EventStatus, EventPriority, ChecklistItem } from '@/types/events'

interface EventFormData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  status: EventStatus
  priority?: EventPriority
  color: string
  items: ChecklistItem[]
  isRecurring: boolean
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrenceInterval?: number
  recurrenceEndDate?: string
  tagIds: string[]
}

interface EventCreateFormProps {
  contextData?: CreateContextData
  onFormDataChange?: (data: EventFormData) => void
  onFormValidChange?: (isValid: boolean) => void
}


const eventStatuses: { value: EventStatus; label: string; color: string }[] = [
  { value: 'inbox', label: 'Inbox', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
  { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
]

const eventPriorities: { value: EventPriority; label: string; color: string; icon: any }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: AlertTriangle },
  { value: 'important', label: 'Important', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', icon: Star },
  { value: 'necessary', label: 'Necessary', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Circle },
  { value: 'delegate', label: 'Delegate', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: ArrowRight },
  { value: 'optional', label: 'Optional', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100', icon: MoreHorizontal },
]


export function EventCreateForm({ contextData, onFormDataChange, onFormValidChange }: EventCreateFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'inbox',
    priority: undefined,
    color: '#1a73e8',
    items: [],
    isRecurring: false,
    recurrenceType: undefined,
    recurrenceInterval: 1,
    recurrenceEndDate: undefined,
    tagIds: [],
  })

  const [newChecklistItem, setNewChecklistItem] = useState('')
  const { tags } = useSidebarStore()

  // Initialize form with context data
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const defaultStartDate = tomorrow.toISOString().split('T')[0]
    const defaultStartTime = '09:00'
    const defaultEndTime = '10:00'
    
    if (contextData) {
      setFormData(prev => ({
        ...prev,
        date: contextData.dueDate 
          ? contextData.dueDate.toISOString().split('T')[0]
          : defaultStartDate,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        color: contextData.defaultColor || '#1a73e8',
        tagIds: contextData.tags || [],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        date: defaultStartDate,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      }))
    }
  }, [contextData])

  // Tag selection helpers
  const handleTagToggle = (tagId: string) => {
    const currentTags = formData.tagIds
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]
    updateFormData('tagIds', newTags)
  }

  const selectedTags = tags.filter(tag => formData.tagIds.includes(tag.id))
  const availableTags = tags.filter(tag => !formData.tagIds.includes(tag.id))

  const updateFormData = (field: keyof EventFormData, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onFormDataChange?.(newData)
  }

  // Form validation - Only title is required now
  useEffect(() => {
    const isValid = formData.title.trim() !== ''
    onFormValidChange?.(isValid)
  }, [formData.title, onFormValidChange])

  // Notify parent of form data changes
  useEffect(() => {
    onFormDataChange?.(formData)
  }, [formData, onFormDataChange])

  const selectedStatus = eventStatuses.find(s => s.value === formData.status)
  const selectedPriority = eventPriorities.find(p => p.value === formData.priority)

  // Checklist handlers
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Math.random().toString(36).substr(2, 9),
        text: newChecklistItem.trim(),
        completed: false,
        duration: undefined,
        created_at: new Date().toISOString()
      }
      updateFormData('items', [...formData.items, newItem])
      setNewChecklistItem('')
    }
  }

  const removeChecklistItem = (itemId: string) => {
    updateFormData('items', formData.items.filter(item => item.id !== itemId))
  }

  const toggleChecklistItem = (itemId: string) => {
    updateFormData('items', formData.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ))
  }

  const updateChecklistItemText = (itemId: string, text: string) => {
    updateFormData('items', formData.items.map(item => 
      item.id === itemId ? { ...item, text } : item
    ))
  }

  const updateChecklistItemDuration = (itemId: string, duration: number | undefined) => {
    updateFormData('items', formData.items.map(item => 
      item.id === itemId ? { ...item, duration } : item
    ))
  }

  // Calculate totals for checklist
  const checklistStats = useMemo(() => {
    const totalItems = formData.items.length
    const completedItems = formData.items.filter(item => item.completed).length
    const totalMinutes = formData.items.reduce((sum, item) => sum + (item.duration || 0), 0)
    const completedMinutes = formData.items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + (item.duration || 0), 0)
    
    const formatDuration = (minutes: number) => {
      if (minutes === 0) return ''
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      }
      return `${mins}m`
    }

    return {
      totalItems,
      completedItems,
      totalDuration: formatDuration(totalMinutes),
      completedDuration: formatDuration(completedMinutes)
    }
  }, [formData.items])

  return (
    <div className="space-y-6 bg-popover text-popover-foreground">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Event title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-base"
        />
      </div>

      {/* Status and Priority */}
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => updateFormData('status', value as EventStatus)}>
            <SelectTrigger className="w-36">
              <SelectValue>
                {selectedStatus && (
                  <Badge className={selectedStatus.color}>
                    {selectedStatus.label}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {eventStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority || 'none'} onValueChange={(value) => updateFormData('priority', value === 'none' ? undefined : value as EventPriority)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="None">
                {selectedPriority ? (
                  <Badge className={selectedPriority.color}>
                    <selectedPriority.icon className="w-3 h-3 mr-1" />
                    {selectedPriority.label}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {eventPriorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <Badge className={priority.color}>
                    <priority.icon className="w-3 h-3 mr-1" />
                    {priority.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Date and Time - Google Calendar style */}
      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date & Time
          </div>
        </Label>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData('date', e.target.value)}
            className="w-40"
          />
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => updateFormData('startTime', e.target.value)}
            disabled={!formData.date}
            className="w-24"
            placeholder="Start"
          />
          <span className="text-muted-foreground text-sm">-</span>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => updateFormData('endTime', e.target.value)}
            disabled={!formData.date}
            className="w-24"
            placeholder="End"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.isRecurring}
            onCheckedChange={(checked) => updateFormData('isRecurring', checked)}
          />
          <Label>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Repeat
            </div>
          </Label>
        </div>
        
        {formData.isRecurring && (
          <div className="ml-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm w-12">Every</span>
              <Input
                type="number"
                value={formData.recurrenceInterval || 1}
                onChange={(e) => updateFormData('recurrenceInterval', parseInt(e.target.value) || 1)}
                className="w-16"
                min="1"
              />
              <Select value={formData.recurrenceType || 'weekly'} onValueChange={(value) => updateFormData('recurrenceType', value as 'daily' | 'weekly' | 'monthly' | 'yearly')}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Day(s)</SelectItem>
                  <SelectItem value="weekly">Week(s)</SelectItem>
                  <SelectItem value="monthly">Month(s)</SelectItem>
                  <SelectItem value="yearly">Year(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm w-12">Until</span>
              <Input
                type="date"
                value={formData.recurrenceEndDate || ''}
                onChange={(e) => updateFormData('recurrenceEndDate', e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        )}
      </div>


      {/* Tags */}
      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            Tags
          </div>
        </Label>
        
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
        
        {/* Tag selection */}
        <Select onValueChange={(value) => handleTagToggle(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tags..." />
          </SelectTrigger>
          <SelectContent>
            {availableTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                  {tag.count && (
                    <span className="text-xs text-muted-foreground">({tag.count})</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <RichTextEditor
          content={formData.description}
          onChange={(content) => updateFormData('description', content)}
          placeholder="Add description, notes, or additional details..."
          minimal={false}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Checklist</Label>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {checklistStats.totalItems > 0 && (
              <>
                <span>{checklistStats.completedItems}/{checklistStats.totalItems} items</span>
                {checklistStats.totalDuration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {checklistStats.completedDuration && checklistStats.totalDuration !== checklistStats.completedDuration
                        ? `${checklistStats.completedDuration} / ${checklistStats.totalDuration}`
                        : checklistStats.totalDuration
                      }
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {/* Existing items */}
          {formData.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleChecklistItem(item.id)}
              />
              <Input
                value={item.text}
                onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                placeholder="Task description..."
              />
              <Input
                type="number"
                value={item.duration || ''}
                onChange={(e) => updateChecklistItemDuration(item.id, e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-20 text-sm"
                placeholder="min"
                min="0"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChecklistItem(item.id)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {/* Add new item */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add checklist item..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addChecklistItem()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChecklistItem}
              disabled={!newChecklistItem.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { EventFormData }