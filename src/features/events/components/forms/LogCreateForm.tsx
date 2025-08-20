'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Calendar, Star, Zap, Focus, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/shadcn-ui/input'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Label } from '@/components/shadcn-ui/label'
import { Badge } from '@/components/shadcn-ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import { CreateContextData } from './AddPopup'

interface LogFormData {
  title: string
  actualStart: string
  actualStartTime: string
  actualEnd: string
  actualEndTime: string
  satisfaction: number
  focusLevel: number
  energyLevel: number
  interruptions: number
  memo: string
  tags: string[]
}

interface LogCreateFormProps {
  contextData?: CreateContextData
  onFormDataChange?: (data: LogFormData) => void
  onFormValidChange?: (isValid: boolean) => void
}

const ratingOptions = [
  { value: 1, label: '1 - Very Low', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  { value: 2, label: '2 - Low', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
  { value: 3, label: '3 - Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  { value: 4, label: '4 - High', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: 5, label: '5 - Very High', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
]

const interruptionOptions = [
  { value: 0, label: '0 - None', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { value: 1, label: '1 - Minimal', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  { value: 2, label: '2 - Some', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  { value: 3, label: '3 - Frequent', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
  { value: 4, label: '4 - Constant', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
]

export function LogCreateForm({ contextData, onFormDataChange, onFormValidChange }: LogCreateFormProps) {
  const [formData, setFormData] = useState<LogFormData>({
    title: '',
    actualStart: '',
    actualStartTime: '',
    actualEnd: '',
    actualEndTime: '',
    satisfaction: 3,
    focusLevel: 3,
    energyLevel: 3,
    interruptions: 0,
    memo: '',
    tags: [],
  })

  // Initialize form with context data and current time
  useEffect(() => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)
    
    // Default end time to 1 hour later
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const endTime = oneHourLater.toTimeString().slice(0, 5)

    if (contextData) {
      setFormData(prev => ({
        ...prev,
        actualStart: currentDate,
        actualStartTime: currentTime,
        actualEnd: currentDate,
        actualEndTime: endTime,
        tags: contextData.tags || [],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        actualStart: currentDate,
        actualStartTime: currentTime,
        actualEnd: currentDate,
        actualEndTime: endTime,
      }))
    }
  }, [contextData])

  // Auto-sync end date with start date if they were the same
  useEffect(() => {
    if (formData.actualStart && formData.actualEnd && formData.actualStart === formData.actualEnd) {
      setFormData(prev => ({ ...prev, actualEnd: formData.actualStart }))
    }
  }, [formData.actualStart, formData.actualEnd])

  const updateFormData = (field: keyof LogFormData, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onFormDataChange?.(newData)
  }

  // Form validation
  useEffect(() => {
    const isValid = formData.title.trim() !== '' && 
                   formData.actualStart !== '' && 
                   formData.actualStartTime !== '' &&
                   formData.actualEnd !== '' && 
                   formData.actualEndTime !== ''
    onFormValidChange?.(isValid)
  }, [formData.title, formData.actualStart, formData.actualStartTime, formData.actualEnd, formData.actualEndTime, onFormValidChange])

  // Notify parent of form data changes
  useEffect(() => {
    onFormDataChange?.(formData)
  }, [formData, onFormDataChange])

  const calculateDuration = () => {
    if (formData.actualStart && formData.actualStartTime && formData.actualEnd && formData.actualEndTime) {
      const startDateTime = new Date(`${formData.actualStart}T${formData.actualStartTime}`)
      const endDateTime = new Date(`${formData.actualEnd}T${formData.actualEndTime}`)
      const diffMs = endDateTime.getTime() - startDateTime.getTime()
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      return diffMinutes > 0 ? diffMinutes : 0
    }
    return 0
  }

  const duration = calculateDuration()
  const durationHours = Math.floor(duration / 60)
  const durationMinutes = duration % 60

  const getSatisfactionOption = (value: number) => ratingOptions.find(opt => opt.value === value)
  const getFocusOption = (value: number) => ratingOptions.find(opt => opt.value === value)
  const getEnergyOption = (value: number) => ratingOptions.find(opt => opt.value === value)
  const getInterruptionOption = (value: number) => interruptionOptions.find(opt => opt.value === value)

  return (
    <div className="space-y-6 bg-popover text-popover-foreground">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          What did you work on? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Completed client presentation, Fixed critical bug, Attended team meeting"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-base"
        />
      </div>

      {/* Time Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          <span>Time Range</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actualStart">Start Date <span className="text-red-500">*</span></Label>
            <Input
              id="actualStart"
              type="date"
              value={formData.actualStart}
              onChange={(e) => updateFormData('actualStart', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualStartTime">Start Time <span className="text-red-500">*</span></Label>
            <Input
              id="actualStartTime"
              type="time"
              value={formData.actualStartTime}
              onChange={(e) => updateFormData('actualStartTime', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actualEnd">End Date <span className="text-red-500">*</span></Label>
            <Input
              id="actualEnd"
              type="date"
              value={formData.actualEnd}
              onChange={(e) => updateFormData('actualEnd', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualEndTime">End Time <span className="text-red-500">*</span></Label>
            <Input
              id="actualEndTime"
              type="time"
              value={formData.actualEndTime}
              onChange={(e) => updateFormData('actualEndTime', e.target.value)}
            />
          </div>
        </div>

        {/* Duration Display */}
        {duration > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300">
                Duration: {durationHours > 0 && `${durationHours}h `}{durationMinutes}m
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quality Metrics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Star className="w-4 h-4" />
          <span>Quality Assessment</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Satisfaction */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Satisfaction
            </Label>
            <Select 
              value={formData.satisfaction.toString()} 
              onValueChange={(value) => updateFormData('satisfaction', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue>
                  {getSatisfactionOption(formData.satisfaction) && (
                    <Badge className={getSatisfactionOption(formData.satisfaction)!.color}>
                      {getSatisfactionOption(formData.satisfaction)!.label}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <Badge className={option.color}>
                      {option.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Focus Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Focus className="w-4 h-4" />
              Focus Level
            </Label>
            <Select 
              value={formData.focusLevel.toString()} 
              onValueChange={(value) => updateFormData('focusLevel', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue>
                  {getFocusOption(formData.focusLevel) && (
                    <Badge className={getFocusOption(formData.focusLevel)!.color}>
                      {getFocusOption(formData.focusLevel)!.label}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <Badge className={option.color}>
                      {option.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Energy Level
            </Label>
            <Select 
              value={formData.energyLevel.toString()} 
              onValueChange={(value) => updateFormData('energyLevel', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue>
                  {getEnergyOption(formData.energyLevel) && (
                    <Badge className={getEnergyOption(formData.energyLevel)!.color}>
                      {getEnergyOption(formData.energyLevel)!.label}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <Badge className={option.color}>
                      {option.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interruptions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Interruptions
            </Label>
            <Select 
              value={formData.interruptions.toString()} 
              onValueChange={(value) => updateFormData('interruptions', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue>
                  {getInterruptionOption(formData.interruptions) && (
                    <Badge className={getInterruptionOption(formData.interruptions)!.color}>
                      {getInterruptionOption(formData.interruptions)!.label}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {interruptionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <Badge className={option.color}>
                      {option.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="memo">Notes & Reflections</Label>
        <Textarea
          id="memo"
          placeholder="What went well? What could be improved? Any key learnings or obstacles encountered?"
          value={formData.memo}
          onChange={(e) => updateFormData('memo', e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  )
}

export type { LogFormData }