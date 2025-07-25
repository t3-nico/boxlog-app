'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Event, CreateEventRequest, UpdateEventRequest, EventType, EventStatus } from '@/types/events'
import { X, Calendar, Clock, MapPin, Link, Tag } from 'lucide-react'
import { useTags } from '@/hooks/use-tags'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface EventModalProps {
  event?: Event | null
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: CreateEventRequest | UpdateEventRequest) => Promise<void>
  onDelete?: (eventId: string) => Promise<void>
  defaultDate?: Date
  defaultTime?: string
}

const eventTypeOptions: { value: EventType; label: string; icon: string }[] = [
  { value: 'event', label: 'イベント', icon: '📅' },
  { value: 'task', label: 'タスク', icon: '✓' },
  { value: 'reminder', label: 'リマインダー', icon: '⏰' },
]

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'confirmed', label: '確定' },
  { value: 'tentative', label: '仮' },
  { value: 'cancelled', label: 'キャンセル' },
]

const colorOptions = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6b7280', // gray
]

export function EventModal({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultDate,
  defaultTime
}: EventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    type: EventType
    status: EventStatus
    color: string
    location: string
    url: string
    tagIds: string[]
  }>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    type: 'event',
    status: 'confirmed',
    color: '#3b82f6',
    location: '',
    url: '',
    tagIds: [],
  })

  // タグデータを取得 (temporarily disabled until tags table is created)
  const tags: any[] = [] // { data: tags = [], isLoading: tagsLoading } = useTags(true)
  const tagsLoading = false

  // フォームデータの初期化
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // 編集モード
        setFormData({
          title: event.title,
          description: event.description || '',
          startDate: format(event.startDate, 'yyyy-MM-dd'),
          startTime: format(event.startDate, 'HH:mm'),
          endDate: event.endDate ? format(event.endDate, 'yyyy-MM-dd') : format(event.startDate, 'yyyy-MM-dd'),
          endTime: event.endDate ? format(event.endDate, 'HH:mm') : '',
          type: event.type,
          status: event.status,
          color: event.color,
          location: event.location || '',
          url: event.url || '',
          tagIds: event.tags?.map(tag => tag.id) || [],
        })
      } else {
        // 新規作成モード
        const now = defaultDate || new Date()
        const startTime = defaultTime || format(now, 'HH:mm')
        const endDate = new Date(now)
        endDate.setHours(now.getHours() + 1) // デフォルトで1時間後
        
        setFormData({
          title: '',
          description: '',
          startDate: format(now, 'yyyy-MM-dd'),
          startTime: startTime,
          endDate: format(endDate, 'yyyy-MM-dd'),
          endTime: format(endDate, 'HH:mm'),
                type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          location: '',
          url: '',
          tagIds: [],
        })
      }
    }
  }, [event, isOpen, defaultDate, defaultTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== EventModal handleSubmit called ===')
    console.log('Form data:', formData)
    setLoading(true)

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        type: formData.type,
        status: formData.status,
        color: formData.color,
        location: formData.location || undefined,
        url: formData.url || undefined,
        tagIds: formData.tagIds,
      }

      if (event) {
        await onSave({ id: event.id, ...eventData } as UpdateEventRequest)
      } else {
        await onSave(eventData as CreateEventRequest)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !onDelete) return
    
    setLoading(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  // タグ選択のヘルパー関数
  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  // フラットなタグリストを作成（階層構造を展開）
  const flattenTags = (tagList: any[], level = 0): any[] => {
    let flattened: any[] = []
    tagList.forEach(tag => {
      flattened.push({ ...tag, level })
      if (tag.children && tag.children.length > 0) {
        flattened = flattened.concat(flattenTags(tag.children, level + 1))
      }
    })
    return flattened
  }

  const flatTags = flattenTags(tags)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {event ? 'イベントを編集' : '新しいイベントを作成'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="イベントのタイトルを入力"
              required
            />
          </div>

          {/* 種別とステータス */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>種別</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ステータス</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* 日時設定 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始日</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>開始時刻</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>終了日</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>終了時刻</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 色選択 */}
          <div className="space-y-2">
            <Label>色</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="イベントの詳細を入力（任意）"
              rows={3}
            />
          </div>

          {/* 場所 */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              場所
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="場所を入力（任意）"
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="関連URLを入力（任意）"
            />
          </div>

          {/* タグ選択 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              タグ
            </Label>
            
            {/* 選択されたタグの表示 */}
            {formData.tagIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.tagIds.map(tagId => {
                  const tag = flatTags.find(t => t.id === tagId)
                  if (!tag) return null
                  return (
                    <Badge 
                      key={tagId} 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.icon} {tag.name}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tagId)}
                        className="ml-1 hover:bg-red-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
            
            {/* タグ選択リスト */}
            <div className="border rounded-md p-3 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {tagsLoading ? (
                <div className="text-sm text-gray-500">タグを読み込み中...</div>
              ) : flatTags.length > 0 ? (
                <div className="space-y-1">
                  {flatTags.map(tag => (
                    <div 
                      key={tag.id} 
                      className="flex items-center space-x-2"
                      style={{ paddingLeft: `${tag.level * 12}px` }}
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={formData.tagIds.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <label 
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm cursor-pointer flex items-center gap-1"
                        style={{ color: tag.color }}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">利用可能なタグがありません</div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {event && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  削除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading || !formData.title}>
                {loading ? '保存中...' : event ? '更新' : '作成'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}