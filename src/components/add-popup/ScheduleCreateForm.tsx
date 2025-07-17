'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateContextData } from './AddPopup'

type TaskType = 'Bug' | 'Feature' | 'Documentation'
type TaskPriority = 'Low' | 'Medium' | 'High'
type TaskStatus = 'Todo' | 'Backlog'

interface ScheduleFormData {
  title: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  dueTime: string
  estimatedHours: string
  description: string
  tags: string[]
}

interface ScheduleCreateFormProps {
  contextData?: CreateContextData
}

const taskTypes: { value: TaskType; label: string; color: string }[] = [
  { value: 'Feature', label: 'Feature', color: 'bg-blue-100 text-blue-800' },
  { value: 'Bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
  { value: 'Documentation', label: 'Documentation', color: 'bg-green-100 text-green-800' },
]

const priorities: { value: TaskPriority; label: string; color: string; description: string }[] = [
  { value: 'Low', label: '低', color: 'bg-gray-100 text-gray-700', description: '時間があるときに' },
  { value: 'Medium', label: '中', color: 'bg-yellow-100 text-yellow-700', description: '通常の優先度' },
  { value: 'High', label: '高', color: 'bg-red-100 text-red-700', description: '早急に対応' },
]

export function ScheduleCreateForm({ contextData }: ScheduleCreateFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    type: 'Feature',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '',
    dueTime: '',
    estimatedHours: '',
    description: '',
    tags: [],
  })

  // Initialize form with context data
  useEffect(() => {
    if (contextData) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData(prev => ({
        ...prev,
        status: (contextData.status === 'Todo' || contextData.status === 'Backlog') 
          ? contextData.status 
          : 'Todo',
        dueDate: contextData.dueDate 
          ? contextData.dueDate.toISOString().split('T')[0]
          : tomorrow.toISOString().split('T')[0],
        priority: contextData.priority || 'Medium',
        tags: contextData.tags || [],
      }))
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData(prev => ({
        ...prev,
        dueDate: tomorrow.toISOString().split('T')[0]
      }))
    }
  }, [contextData])

  const updateFormData = (field: keyof ScheduleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedTaskType = taskTypes.find(t => t.value === formData.type)
  const selectedPriority = priorities.find(p => p.value === formData.priority)

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Task Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
        />
      </div>

      {/* Type and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger>
              <SelectValue>
                {selectedTaskType && (
                  <Badge className={selectedTaskType.color}>
                    {selectedTaskType.label}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
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
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
            <SelectTrigger>
              <SelectValue>
                {selectedPriority && (
                  <Badge className={selectedPriority.color}>
                    {selectedPriority.label}
                  </Badge>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <Badge className={priority.color}>
                    {priority.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="Backlog">Backlog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateFormData('dueDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueTime">Time (Optional)</Label>
          <Input
            id="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={(e) => updateFormData('dueTime', e.target.value)}
          />
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-2">
        <Label htmlFor="estimatedHours">Estimated Time (hours)</Label>
        <Input
          id="estimatedHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g., 2.5"
          value={formData.estimatedHours}
          onChange={(e) => updateFormData('estimatedHours', e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add more details, context, or requirements..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

export type { ScheduleFormData }