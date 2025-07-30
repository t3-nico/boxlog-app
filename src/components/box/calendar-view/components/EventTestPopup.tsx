'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEventStore } from '@/stores/useEventStore'
import type { CalendarEvent } from '@/types/events'
import { utcToLocal, localToUTC } from '@/utils/dateHelpers'
import { format } from 'date-fns'

interface EventTestPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  onSuccess?: () => void
}

export function EventTestPopup({ open, onOpenChange, event, onSuccess }: EventTestPopupProps) {
  console.log('🔍 EventTestPopup render:', { open, event: event?.id, title: event?.title })
  
  const { updateEvent } = useEventStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // フォーム状態
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState<'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'>('inbox')
  const [priority, setPriority] = useState<'urgent' | 'important' | 'necessary' | 'delegate' | 'optional' | undefined>(undefined)
  const [color, setColor] = useState('#1a73e8')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')

  // 🕐 date-fns-tz ベースの処理関数（タイムゾーン完全対応）

  // イベントデータをフォームに設定
  useEffect(() => {
    console.log('⚡ useEffect triggered:', { event: !!event, open, eventId: event?.id })
    
    // ポップアップが開かれ、かつイベントデータがある場合のみフォームを初期化
    if (open && event) {
      console.log('🕐 date-fns-tz INIT - 元のイベント:', {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      })

      setTitle(event.title || '')
      setDescription(event.description || '')
      setStatus(event.status || 'inbox')
      setPriority(event.priority || undefined)
      setColor(event.color || '#1a73e8')
      setLocation(event.location || '')
      setUrl(event.url || '')
      
      if (event.startDate) {
        // 🌐 UTC→ローカル時間変換（date-fns-tz使用）
        const { date: dateString, time: timeString } = utcToLocal(event.startDate.toISOString())
        
        console.log('🌐 EventTestPopup - UTC to Local conversion:', {
          utc: event.startDate.toISOString(),
          localDate: dateString,
          localTime: timeString
        })
        
        setDate(dateString)
        setStartTime(timeString)
      }
      
      if (event.endDate) {
        const { time: endTimeString } = utcToLocal(event.endDate.toISOString())
        console.log('🌐 EventTestPopup - End time UTC to Local:', {
          utc: event.endDate.toISOString(),
          localTime: endTimeString
        })
        setEndTime(endTimeString)
      } else {
        setEndTime('')
      }
    } else if (!event) {
      // イベントデータがない場合のみフォームをクリア
      setTitle('')
      setDescription('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setStatus('inbox')
      setPriority(undefined)
      setColor('#1a73e8')
      setLocation('')
      setUrl('')
    }
  }, [event?.id, open]) // event全体ではなくidのみを監視

  // 保存処理 - date-fns-tz完全対応版
  const handleSave = async () => {
    if (!event || !title.trim() || !date || !startTime) return

    console.log('🕐 date-fns-tz SAVE - 開始')
    console.log('📝 フォーム値（生）:', { date, startTime, endTime })

    setIsSubmitting(true)
    try {
      // 🌐 ローカル時間をUTCに変換（date-fns-tz使用）
      const startDateTimeUTC = localToUTC(date, startTime)
      let endDateTimeUTC: string | undefined
      
      if (endTime) {
        endDateTimeUTC = localToUTC(date, endTime)
        
        // 翌日チェック
        const startDate = new Date(startDateTimeUTC)
        const endDate = new Date(endDateTimeUTC)
        
        if (endDate <= startDate) {
          const nextDayEnd = new Date(endDate)
          nextDayEnd.setDate(nextDayEnd.getDate() + 1)
          endDateTimeUTC = nextDayEnd.toISOString()
        }
      }
      
      console.log('🌐 EventTestPopup SAVE - ローカル→UTC変換:', {
        inputLocal: { date, startTime, endTime },
        outputUTC: { startDateTimeUTC, endDateTimeUTC }
      })

      const updateData = {
        id: event.id,
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDateTimeUTC),
        endDate: endDateTimeUTC ? new Date(endDateTimeUTC) : undefined,
        status: status,
        priority: priority,
        color: color,
        location: location.trim(),
        url: url.trim(),
        tagIds: event.tags?.map(tag => tag.id) || []
      }

      console.log('🚀 date-fns-tz SAVE - updateEvent呼び出し')
      const result = await updateEvent(updateData)
      console.log('✅ date-fns-tz SAVE - 成功:', result)

      // UIを強制的に更新するためにイベントを再取得
      if (onSuccess) {
        onSuccess()
      }
      
      onOpenChange(false)
    } catch (error: any) {
      console.error('❌ date-fns-tz SAVE - 失敗:', error)
      console.error('エラーの詳細:', {
        message: error?.message,
        stack: error?.stack,
        type: typeof error,
        errorObject: error
      })
      alert(`イベントの更新に失敗しました: ${error?.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            イベントを編集
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* タイトル */}
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="イベントタイトル"
            />
          </div>

          {/* 日付 */}
          <div>
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* ステータスと優先度 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">受信箱</SelectItem>
                  <SelectItem value="planned">予定済み</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">優先度</Label>
              <Select value={priority || 'none'} onValueChange={(value: any) => setPriority(value === 'none' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  <SelectItem value="urgent">緊急</SelectItem>
                  <SelectItem value="important">重要</SelectItem>
                  <SelectItem value="necessary">必要</SelectItem>
                  <SelectItem value="delegate">委任</SelectItem>
                  <SelectItem value="optional">任意</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 色 */}
          <div>
            <Label htmlFor="color">カラー</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#1a73e8"
                className="flex-1"
              />
            </div>
          </div>

          {/* 場所とURL */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="location">場所</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="場所を入力"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* 説明 */}
          <div>
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="イベントの説明"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !title.trim() || !date || !startTime}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}