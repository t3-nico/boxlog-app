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
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Task Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-3"
        />
      </div>

      {/* Type and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <SelectValue>
                {selectedTaskType && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTaskType.value === 'Feature' ? 'bg-blue-500' :
                      selectedTaskType.value === 'Bug' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <span className="font-medium">{selectedTaskType.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700">
              {taskTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="rounded-md">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type.value === 'Feature' ? 'bg-blue-500' :
                      type.value === 'Bug' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
            <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <SelectValue>
                {selectedPriority && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPriority.value === 'Low' ? 'bg-gray-400' :
                      selectedPriority.value === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{selectedPriority.label}</span>
                    <span className="text-xs text-gray-500">
                      {selectedPriority.description}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700">
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value} className="rounded-md">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      priority.value === 'Low' ? 'bg-gray-400' :
                      priority.value === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{priority.label}</div>
                      <div className="text-xs text-gray-500">{priority.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</Label>
        <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
          <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700">
            <SelectItem value="Todo" className="rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Todo</div>
                  <div className="text-xs text-gray-500">Ready to start</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="Backlog" className="rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <div>
                  <div className="font-medium">Backlog</div>
                  <div className="text-xs text-gray-500">For later</div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateFormData('dueDate', e.target.value)}
            className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-3"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="dueTime" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time (Optional)
          </Label>
          <Input
            id="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={(e) => updateFormData('dueTime', e.target.value)}
            className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-3"
          />
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-3">
        <Label htmlFor="estimatedHours" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Estimated Time (hours)
        </Label>
        <Input
          id="estimatedHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g., 2.5"
          value={formData.estimatedHours}
          onChange={(e) => updateFormData('estimatedHours', e.target.value)}
          className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-3"
        />
        <p className="text-xs text-gray-500">
          How long do you think this will take?
        </p>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Add more details, context, or requirements..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="text-sm resize-none border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-4 py-3"
          rows={3}
        />
      </div>

      {/* Tags Placeholder */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (Optional)</Label>
        <div className="min-h-[44px] p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🏷️ Tag selection coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export type { ScheduleFormData }