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
    <div className="space-y-5">
      {/* Status Badge */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">Record Completed Work</p>
          <p className="text-xs text-green-600 dark:text-green-400">Log what you've accomplished</p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          What did you complete? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Client meeting conducted successfully"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
        />
        <p className="text-xs text-gray-500">
          Briefly describe what you accomplished
        </p>
      </div>

      {/* Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Work Type</Label>
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

      {/* Completed Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="completedAt" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Completed Date
          </Label>
          <Input
            id="completedAt"
            type="date"
            value={formData.completedAt}
            onChange={(e) => updateFormData('completedAt', e.target.value)}
            className="text-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="completedTime" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </Label>
          <Input
            id="completedTime"
            type="time"
            value={formData.completedTime}
            onChange={(e) => updateFormData('completedTime', e.target.value)}
            className="text-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
          />
        </div>
      </div>

      {/* Actual Hours */}
      <div className="space-y-3">
        <Label htmlFor="actualHours" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Time Spent (hours)
        </Label>
        <Input
          id="actualHours"
          type="number"
          min="0"
          step="0.25"
          placeholder="e.g., 1.5"
          value={formData.actualHours}
          onChange={(e) => updateFormData('actualHours', e.target.value)}
          className="text-sm border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
        />
        <p className="text-xs text-gray-500">
          How much time did you actually spend? (15min increments)
        </p>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Work Details
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what work was performed and how..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="text-sm resize-none border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
          rows={3}
        />
      </div>

      {/* Outcome */}
      <div className="space-y-3">
        <Label htmlFor="outcome" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Outcomes & Results
        </Label>
        <Textarea
          id="outcome"
          placeholder="What was achieved? What were the key results or learnings?"
          value={formData.outcome}
          onChange={(e) => updateFormData('outcome', e.target.value)}
          className="text-sm resize-none border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
          rows={2}
        />
        <p className="text-xs text-gray-500">
          Document specific achievements and insights gained
        </p>
      </div>

      {/* Next Actions */}
      <div className="space-y-3">
        <Label htmlFor="nextActions" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Next Actions (Optional)
        </Label>
        <Textarea
          id="nextActions"
          placeholder="Are there any follow-up actions or next steps needed?"
          value={formData.nextActions}
          onChange={(e) => updateFormData('nextActions', e.target.value)}
          className="text-sm resize-none border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 rounded-lg px-4 py-3"
          rows={2}
        />
        <p className="text-xs text-gray-500">
          Note any follow-up tasks or items that need attention
        </p>
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

export type { RecordFormData }