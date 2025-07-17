'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Calendar } from 'lucide-react'
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

interface RecordFormData {
  title: string
  type: TaskType
  completedAt: string
  completedTime: string
  actualHours: string
  description: string
  outcome: string
  nextActions: string
  tags: string[]
}

interface RecordCreateFormProps {
  contextData?: CreateContextData
}

const taskTypes: { value: TaskType; label: string; color: string }[] = [
  { value: 'Feature', label: 'Feature', color: 'bg-blue-100 text-blue-800' },
  { value: 'Bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
  { value: 'Documentation', label: 'Documentation', color: 'bg-green-100 text-green-800' },
]

export function RecordCreateForm({ contextData }: RecordCreateFormProps) {
  const [formData, setFormData] = useState<RecordFormData>({
    title: '',
    type: 'Feature',
    completedAt: '',
    completedTime: '',
    actualHours: '',
    description: '',
    outcome: '',
    nextActions: '',
    tags: [],
  })

  // Initialize form with context data and current time
  useEffect(() => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)

    if (contextData) {
      setFormData(prev => ({
        ...prev,
        completedAt: currentDate,
        completedTime: currentTime,
        tags: contextData.tags || [],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        completedAt: currentDate,
        completedTime: currentTime,
      }))
    }
  }, [contextData])

  const updateFormData = (field: keyof RecordFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedTaskType = taskTypes.find(t => t.value === formData.type)

  return (
    <div className="space-y-4 bg-popover text-popover-foreground">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          What did you complete? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Client meeting conducted successfully"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Work Type</Label>
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

      {/* Completed Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="completedAt">Completed Date</Label>
          <Input
            id="completedAt"
            type="date"
            value={formData.completedAt}
            onChange={(e) => updateFormData('completedAt', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="completedTime">Time</Label>
          <Input
            id="completedTime"
            type="time"
            value={formData.completedTime}
            onChange={(e) => updateFormData('completedTime', e.target.value)}
          />
        </div>
      </div>

      {/* Actual Hours */}
      <div className="space-y-2">
        <Label htmlFor="actualHours">Time Spent (hours)</Label>
        <Input
          id="actualHours"
          type="number"
          min="0"
          step="0.25"
          placeholder="e.g., 1.5"
          value={formData.actualHours}
          onChange={(e) => updateFormData('actualHours', e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Work Details</Label>
        <Textarea
          id="description"
          placeholder="Describe what work was performed and how..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
        />
      </div>

      {/* Outcome */}
      <div className="space-y-2">
        <Label htmlFor="outcome">Outcomes & Results</Label>
        <Textarea
          id="outcome"
          placeholder="What was achieved? What were the key results or learnings?"
          value={formData.outcome}
          onChange={(e) => updateFormData('outcome', e.target.value)}
          rows={2}
        />
      </div>

      {/* Next Actions */}
      <div className="space-y-2">
        <Label htmlFor="nextActions">Next Actions (Optional)</Label>
        <Textarea
          id="nextActions"
          placeholder="Are there any follow-up actions or next steps needed?"
          value={formData.nextActions}
          onChange={(e) => updateFormData('nextActions', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  )
}

export type { RecordFormData }