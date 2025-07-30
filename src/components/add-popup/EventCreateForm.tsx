'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Calendar, Plus, X, Check, Tag as TagIcon, Clock, Repeat,
  AlertTriangle, Star, Circle, ArrowRight, MoreHorizontal,
  FileText, CheckSquare, Type
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { SimpleTags } from '@/components/ui/tags'
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
  location?: string
  url?: string
}

interface EventCreateFormProps {
  contextData?: CreateContextData
  onFormDataChange?: (data: EventFormData) => void
  onFormValidChange?: (isValid: boolean) => void
  defaultDate?: Date
  defaultTime?: string
  defaultEndTime?: string
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

// Generate 15-minute interval time options
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = timeValue // 24-hour format
      times.push({ value: timeValue, label: displayTime })
    }
  }
  return times
}

const timeOptions = generateTimeOptions()


export function EventCreateForm({ contextData, onFormDataChange, onFormValidChange, defaultDate, defaultTime, defaultEndTime }: EventCreateFormProps) {
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
    location: '',
    url: '',
  })

  const [newChecklistItem, setNewChecklistItem] = useState('')
  const { tags } = useSidebarStore()

  // スマートな時間設定を計算する関数
  const getSmartDefaultTimes = useCallback((providedTime?: string, providedEndTime?: string) => {
    const now = new Date()
    
    if (providedTime) {
      // defaultTimeが明示的に指定されている場合（カレンダードラッグなど）
      const [hours, minutes] = providedTime.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(hours + 1, minutes) // 1時間後
      return {
        start: providedTime,
        end: providedEndTime || `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      }
    } else {
      // 自動設定：現在時刻を30分単位で切り上げ
      const currentMinutes = now.getMinutes()
      const roundedMinutes = Math.ceil(currentMinutes / 30) * 30
      
      const startTime = new Date(now)
      if (roundedMinutes >= 60) {
        startTime.setHours(now.getHours() + 1, 0, 0, 0)
      } else {
        startTime.setHours(now.getHours(), roundedMinutes, 0, 0)
      }
      
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1時間後
      
      return {
        start: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
        end: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
      }
    }
  }, [])

  // カレンダーからの値（defaultDate, defaultTime, defaultEndTime）が変更された時の処理
  useEffect(() => {
    if (defaultDate || defaultTime || defaultEndTime) {
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const defaultStartDate = defaultDate 
        ? defaultDate.toISOString().split('T')[0]
        : tomorrow.toISOString().split('T')[0]
      
      const smartTimes = getSmartDefaultTimes(defaultTime, defaultEndTime)
      
      setFormData({
        title: '',
        description: '',
        date: defaultStartDate,
        startTime: smartTimes.start,
        endTime: smartTimes.end,
        status: 'inbox',
        priority: undefined,
        color: '#1a73e8',
        items: [],
        isRecurring: false,
        recurrenceType: undefined,
        recurrenceInterval: 1,
        recurrenceEndDate: undefined,
        tagIds: [],
        location: '',
        url: '',
      })
    }
  }, [defaultDate, defaultTime, defaultEndTime, getSmartDefaultTimes])

  // contextDataの処理（カレンダー以外からの呼び出し）
  useEffect(() => {
    // カレンダーからの値がある場合は無視
    if (defaultDate || defaultTime || defaultEndTime) return
    
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const defaultStartDate = tomorrow.toISOString().split('T')[0]
    const smartTimes = getSmartDefaultTimes()
    
    if (contextData && !contextData.editingEvent) {
      setFormData(prev => ({
        ...prev,
        date: contextData.dueDate 
          ? contextData.dueDate.toISOString().split('T')[0]
          : defaultStartDate,
        startTime: smartTimes.start,
        endTime: smartTimes.end,
        color: contextData.defaultColor || '#1a73e8',
        tagIds: contextData.tags || [],
      }))
    } else if (!contextData) {
      // 初期状態
      setFormData(prev => ({
        ...prev,
        date: defaultStartDate,
        startTime: smartTimes.start,
        endTime: smartTimes.end,
      }))
    }
  }, [contextData?.dueDate, contextData?.defaultColor, contextData?.tags, contextData?.editingEvent, getSmartDefaultTimes, defaultDate, defaultTime, defaultEndTime])

  // Handle editing event data separately to avoid infinite loop
  useEffect(() => {
    
    if (contextData?.editingEvent) {
      const event = contextData.editingEvent
      
      const eventDate = event.startDate ? new Date(event.startDate) : new Date()
      const eventEndDate = event.endDate ? new Date(event.endDate) : null
      
      const newFormData = {
        title: event.title || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        startTime: eventDate.toTimeString().slice(0, 5),
        endTime: eventEndDate ? eventEndDate.toTimeString().slice(0, 5) : '',
        status: event.status || 'inbox',
        priority: event.priority,
        color: event.color || '#1a73e8',
        items: event.items || [],
        isRecurring: event.isRecurring || false,
        recurrenceType: undefined,
        recurrenceInterval: 1,
        recurrenceEndDate: undefined,
        tagIds: event.tags?.map(tag => tag.id) || [],
        location: event.location || '',
        url: event.url || '',
      }
      
      setFormData(newFormData)
    }
  }, [contextData?.editingEvent?.id]) // Only re-run when editing a different event

  const updateFormData = (field: keyof EventFormData, value: any) => {
    let newData = { ...formData, [field]: value }
    
    // Auto-set end time when start time is selected
    if (field === 'startTime' && value && !formData.endTime) {
      const [hours, minutes] = value.split(':').map(Number)
      const startTime = new Date()
      startTime.setHours(hours, minutes, 0, 0)
      
      // Add 1 hour
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
      const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
      
      // Check if the calculated end time exists in our time options
      const endTimeExists = timeOptions.find(option => option.value === endTimeString)
      if (endTimeExists) {
        newData = { ...newData, endTime: endTimeString }
      }
    }
    
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
    <div className="space-y-4 bg-popover text-popover-foreground -mt-2">
      {/* Title */}
      <div className="pl-7">
        <Input
          id="title"
          placeholder="Event title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-xl w-full border-0 border-b border-border bg-transparent px-0 py-2 rounded-none focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Date and Time - Google Calendar style */}
      <div className="flex items-start gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              className="w-40"
            />
            <Select 
              value={formData.startTime} 
              onValueChange={(value) => updateFormData('startTime', value)}
              disabled={!formData.date}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">-</span>
            <Select 
              value={formData.endTime} 
              onValueChange={(value) => updateFormData('endTime', value)}
              disabled={!formData.date}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="End" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Recurrence within Date section */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.isRecurring}
              onCheckedChange={(checked) => updateFormData('isRecurring', checked)}
            />
            <span className="text-sm">Repeat</span>
          </div>
          
          {formData.isRecurring && (
            <div className="space-y-3 ml-6">
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
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <Select value={formData.status} onValueChange={(value) => updateFormData('status', value as EventStatus)}>
          <SelectTrigger className="w-40">
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

      {/* Priority */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <Select value={formData.priority || 'none'} onValueChange={(value) => updateFormData('priority', value === 'none' ? undefined : value as EventPriority)}>
          <SelectTrigger className="w-40">
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

      {/* Tags */}
      <div className="flex items-start gap-3">
        <TagIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <SimpleTags
          value={formData.tagIds}
          onValueChange={(value) => updateFormData('tagIds', value)}
          options={tags}
          placeholder="Select tags..."
          onCreateTag={(tagName) => {
            // TODO: Implement tag creation API call
          }}
        />
      </div>

      {/* Checklist Items */}
      <div className="flex items-start gap-3">
        <CheckSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Checklist</span>
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

      {/* Description - moved to bottom */}
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3" />
        <div className="flex-1">
          <RichTextEditor
            content={formData.description}
            onChange={(content) => updateFormData('description', content)}
            placeholder="Add description, notes, or additional details..."
            minimal={false}
          />
        </div>
      </div>
    </div>
  )
}

export type { EventFormData }