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
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="例: クライアントミーティングの準備"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Type and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">タイプ</Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedTaskType && (
                  <div className="flex items-center gap-2">
                    <Badge className={`${selectedTaskType.color} text-xs px-2 py-0.5`}>
                      {selectedTaskType.label}
                    </Badge>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <Badge className={`${type.color} text-xs px-2 py-0.5`}>
                    {type.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">優先度</Label>
          <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedPriority && (
                  <div className="flex items-center gap-2">
                    <Badge className={`${selectedPriority.color} text-xs px-2 py-0.5`}>
                      {selectedPriority.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedPriority.description}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center justify-between w-full">
                    <Badge className={`${priority.color} text-xs px-2 py-0.5`}>
                      {priority.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      {priority.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">ステータス</Label>
        <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todo">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Todo</span>
                <span className="text-xs text-muted-foreground">- すぐに取りかかる</span>
              </div>
            </SelectItem>
            <SelectItem value="Backlog">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Backlog</span>
                <span className="text-xs text-muted-foreground">- 後で実行する</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            予定日
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateFormData('dueDate', e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueTime" className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            時刻（任意）
          </Label>
          <Input
            id="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={(e) => updateFormData('dueTime', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-2">
        <Label htmlFor="estimatedHours" className="text-sm font-medium">
          予想作業時間（時間）
        </Label>
        <Input
          id="estimatedHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="例: 2.5"
          value={formData.estimatedHours}
          onChange={(e) => updateFormData('estimatedHours', e.target.value)}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          この作業にかかると予想される時間を入力してください
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          詳細説明（任意）
        </Label>
        <Textarea
          id="description"
          placeholder="詳細な説明や注意事項を入力..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Tags Placeholder */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">タグ（任意）</Label>
        <div className="min-h-[40px] p-3 border rounded-md bg-muted/50">
          <p className="text-xs text-muted-foreground">
            タグ選択機能は後で実装予定
          </p>
        </div>
      </div>
    </div>
  )
}

export type { ScheduleFormData }