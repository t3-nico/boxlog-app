'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Link as LinkIcon, Palette } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateContextData } from './AddPopup'
import type { EventType, EventStatus } from '@/types/events'

interface EventFormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  isAllDay: boolean
  eventType: EventType
  status: EventStatus
  color: string
  location: string
  url: string
  tagIds: string[]
}

interface EventCreateFormProps {
  contextData?: CreateContextData
  onFormDataChange?: (data: EventFormData) => void
  onFormValidChange?: (isValid: boolean) => void
}

const eventTypes: { value: EventType; label: string; color: string }[] = [
  { value: 'event', label: 'Event', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  { value: 'task', label: 'Task', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
]

const eventStatuses: { value: EventStatus; label: string; color: string }[] = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: 'tentative', label: 'Tentative', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
]

const colorOptions = [
  { value: '#1a73e8', label: 'Blue', color: 'bg-blue-500' },
  { value: '#e37400', label: 'Orange', color: 'bg-orange-500' },
  { value: '#0d7377', label: 'Teal', color: 'bg-teal-500' },
  { value: '#8e24aa', label: 'Purple', color: 'bg-purple-500' },
  { value: '#d32f2f', label: 'Red', color: 'bg-red-500' },
  { value: '#388e3c', label: 'Green', color: 'bg-green-500' },
  { value: '#f57c00', label: 'Amber', color: 'bg-amber-500' },
  { value: '#5d4037', label: 'Brown', color: 'bg-amber-800' },
]

export function EventCreateForm({ contextData, onFormDataChange, onFormValidChange }: EventCreateFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
    eventType: 'event',
    status: 'confirmed',
    color: '#1a73e8',
    location: '',
    url: '',
    tagIds: [],
  })

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
        startDate: contextData.dueDate 
          ? contextData.dueDate.toISOString().split('T')[0]
          : defaultStartDate,
        endDate: contextData.dueDate 
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
        startDate: defaultStartDate,
        endDate: defaultStartDate,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      }))
    }
  }, [contextData])

  // Auto-sync end date with start date if they were the same
  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.startDate === formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: formData.startDate }))
    }
  }, [formData.startDate])

  const updateFormData = (field: keyof EventFormData, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onFormDataChange?.(newData)
  }

  // Form validation
  useEffect(() => {
    const isValid = formData.title.trim() !== '' && formData.startDate !== ''
    onFormValidChange?.(isValid)
  }, [formData.title, formData.startDate, onFormValidChange])

  // Notify parent of form data changes
  useEffect(() => {
    onFormDataChange?.(formData)
  }, [formData, onFormDataChange])

  const selectedEventType = eventTypes.find(t => t.value === formData.eventType)
  const selectedStatus = eventStatuses.find(s => s.value === formData.status)
  const selectedColor = colorOptions.find(c => c.value === formData.color)

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

      {/* Type and Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.eventType} onValueChange={(value) => updateFormData('eventType', value)}>
            <SelectTrigger>
              <SelectValue>
                {selectedEventType && (
                  <Badge className={selectedEventType.color}>
                    {selectedEventType.label}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <Badge className={type.color}>
                    {type.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
            <SelectTrigger>
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
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <Label htmlFor="allDay" className="text-sm font-medium">All day event</Label>
        </div>
        <Switch
          id="allDay"
          checked={formData.isAllDay}
          onCheckedChange={(checked) => updateFormData('isAllDay', checked)}
        />
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
            />
          </div>

          {!formData.isAllDay && (
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData('startTime', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* End Date and Time - Only show if not all day or different end date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData('endDate', e.target.value)}
            />
          </div>

          {!formData.isAllDay && (
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData('endTime', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          <Select value={formData.color} onValueChange={(value) => updateFormData('color', value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedColor && (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${selectedColor.color}`} />
                    <span>{selectedColor.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${color.color}`} />
                    <span>{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </div>
        </Label>
        <Input
          id="location"
          placeholder="Add location"
          value={formData.location}
          onChange={(e) => updateFormData('location', e.target.value)}
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            URL
          </div>
        </Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={formData.url}
          onChange={(e) => updateFormData('url', e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add description, notes, or additional details..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  )
}

export type { EventFormData }