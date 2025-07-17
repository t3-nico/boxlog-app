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
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">完了した作業の記録</p>
          <p className="text-xs text-green-600">実施した活動や成果を記録します</p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          作業内容 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="例: クライアントミーティングを実施"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          何を実施したかを簡潔に記録してください
        </p>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">作業タイプ</Label>
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

      {/* Completed Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="completedAt" className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            完了日
          </Label>
          <Input
            id="completedAt"
            type="date"
            value={formData.completedAt}
            onChange={(e) => updateFormData('completedAt', e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="completedTime" className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            完了時刻
          </Label>
          <Input
            id="completedTime"
            type="time"
            value={formData.completedTime}
            onChange={(e) => updateFormData('completedTime', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Actual Hours */}
      <div className="space-y-2">
        <Label htmlFor="actualHours" className="text-sm font-medium">
          実際の作業時間（時間）
        </Label>
        <Input
          id="actualHours"
          type="number"
          min="0"
          step="0.25"
          placeholder="例: 1.5"
          value={formData.actualHours}
          onChange={(e) => updateFormData('actualHours', e.target.value)}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          実際にかかった時間を記録してください（15分単位）
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          作業詳細
        </Label>
        <Textarea
          id="description"
          placeholder="どのような作業を行ったかの詳細を記録..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Outcome */}
      <div className="space-y-2">
        <Label htmlFor="outcome" className="text-sm font-medium">
          成果・結果
        </Label>
        <Textarea
          id="outcome"
          placeholder="何を達成したか、どんな成果が得られたかを記録..."
          value={formData.outcome}
          onChange={(e) => updateFormData('outcome', e.target.value)}
          className="text-sm resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          この作業で得られた具体的な成果や学びを記録してください
        </p>
      </div>

      {/* Next Actions */}
      <div className="space-y-2">
        <Label htmlFor="nextActions" className="text-sm font-medium">
          次のアクション（任意）
        </Label>
        <Textarea
          id="nextActions"
          placeholder="この作業の結果として必要になった次のステップがあれば記録..."
          value={formData.nextActions}
          onChange={(e) => updateFormData('nextActions', e.target.value)}
          className="text-sm resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          フォローアップが必要な項目があれば記録してください
        </p>
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

export type { RecordFormData }