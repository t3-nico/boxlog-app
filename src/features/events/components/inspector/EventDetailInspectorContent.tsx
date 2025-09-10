'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { 
  Tag as TagIcon,
  Trash2,
  Copy,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Edit3,
  MessageSquare,
  Bell,
  Activity,
  ArrowRight,
  RefreshCw,
  Circle
} from 'lucide-react'
import { background, text, border } from '@/config/theme/colors'
import { typography, spacing } from '@/config/theme'
import type { CalendarEvent } from '@/features/calendar/types/calendar.types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface EventDetailInspectorContentProps {
  event?: CalendarEvent | null  // 新規作成時はnull/undefined
  mode?: 'view' | 'create' | 'edit'
  onSave?: (eventData: Partial<CalendarEvent>) => void
  onDelete?: (eventId: string) => void
  onDuplicate?: (event: CalendarEvent) => void
  onTemplateCreate?: (event: CalendarEvent) => void
  onClose?: () => void
}

export function EventDetailInspectorContent({
  event,
  mode = event ? 'view' : 'create',
  onSave,
  onDelete,
  onDuplicate,
  onTemplateCreate,
  onClose
}: EventDetailInspectorContentProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || null,
    tags: event?.tags || [],
    isRecurring: event?.isRecurring || false,
    reminders: event?.reminders || []
  })
  
  // 編集モード管理 - 常に編集可能
  const isEditable = true
  const isCreateMode = mode === 'create'

  // ステータス判定（予定 vs 記録）
  const isCompleted = event?.status === 'completed'
  const isPast = event?.endDate ? new Date() > event.endDate : event?.startDate ? new Date() > event.startDate : false

  // 自動保存機能（debounce付き）
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (data: typeof formData) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (onSave) {
            onSave({
              ...data,
              id: event?.id || `temp-${Date.now()}`
            })
          }
        }, 500) // 500ms後に保存
      }
    })(),
    [onSave, event?.id]
  )

  // フォームデータが変更された時の自動保存
  useEffect(() => {
    if (isEditable) {
      debouncedSave(formData)
    }
  }, [formData, isEditable, debouncedSave])

  // 時間情報の計算
  const duration = formData.endDate && formData.startDate
    ? Math.round((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60))
    : 60
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  // フォームデータ更新ハンドラー
  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTitleChange = (value: string) => {
    updateFormData('title', value)
  }

  const handleDescriptionChange = (value: string) => {
    updateFormData('description', value)
  }

  const handleLocationChange = (value: string) => {
    updateFormData('location', value)
  }

  const handleDateChange = (value: string) => {
    if (value) {
      const newDate = new Date(value)
      if (!isNaN(newDate.getTime())) {
        // 既存の時間を保持
        const currentTime = formData.startDate
        newDate.setHours(currentTime.getHours(), currentTime.getMinutes())
        updateFormData('startDate', newDate)
        
        // 終了日がある場合も同じ日付に変更
        if (formData.endDate) {
          const newEndDate = new Date(value)
          newEndDate.setHours(formData.endDate.getHours(), formData.endDate.getMinutes())
          updateFormData('endDate', newEndDate)
        }
      }
    }
  }

  return (
    <ScrollArea className="h-full p-0 m-0">
      <div className="space-y-0">
        {/* タイトル */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            予定
          </h3>
          {isEditable ? (
            <>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={isCreateMode ? "タイトルを入力..." : ""}
                className={cn(
                  typography.heading.h4,
                  'md:text-base border-none shadow-none p-2',
                  background.base,
                  text.primary
                )}
              />
            </>
          ) : (
            <>
              <p className={cn(typography.body.base, 'font-medium', text.primary)}>
                {formData.title}
              </p>
            </>
          )}
        </div>

        {/* 時間 */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            時間
          </h3>
          <div className="space-y-3">
            {isEditable ? (
              <Input
                type="date"
                value={format(formData.startDate, 'yyyy-MM-dd')}
                onChange={(e) => handleDateChange(e.target.value)}
                className={cn(
                  typography.body.DEFAULT,
                  'border border-input rounded-md px-3 py-2 w-auto',
                  background.base,
                  text.primary
                )}
              />
            ) : (
              <div className={cn(typography.body.base, 'font-medium', text.primary)}>
                {format(formData.startDate, 'yyyy年M月d日（E）', { locale: ja })}
              </div>
            )}
            <div className="flex items-center gap-2">
                  {isEditable ? (
                    <>
                      <Input
                        type="time"
                        value={format(formData.startDate, 'HH:mm')}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':')
                          const newDate = new Date(formData.startDate)
                          newDate.setHours(parseInt(hours), parseInt(minutes))
                          updateFormData('startDate', newDate)
                        }}
                        className={cn(
                          typography.body.DEFAULT,
                          'border border-input rounded-md px-3 py-2 text-center flex-1',
                          background.base,
                          text.primary
                        )}
                      />
                      <span className={cn(typography.body.DEFAULT, text.muted)}>→</span>
                      <Input
                        type="time"
                        value={formData.endDate ? format(formData.endDate, 'HH:mm') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [hours, minutes] = e.target.value.split(':')
                            const newDate = new Date(formData.startDate)
                            newDate.setHours(parseInt(hours), parseInt(minutes))
                            updateFormData('endDate', newDate)
                          } else {
                            updateFormData('endDate', null)
                          }
                        }}
                        className={cn(
                          typography.body.DEFAULT,
                          'border border-input rounded-md px-3 py-2 text-center flex-1',
                          background.base,
                          text.primary
                        )}
                      />
                    </>
                  ) : (
                    <span className={cn(typography.body.DEFAULT, text.primary)}>
                      {format(formData.startDate, 'HH:mm')} → {formData.endDate ? format(formData.endDate, 'HH:mm') : '未設定'}
                    </span>
                  )}
            </div>
          </div>
        </div>


        {/* タグセクション */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            タグ
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags && formData.tags.length > 0 ? (
              formData.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    'px-3 py-1 rounded-full border',
                    typography.body.xs,
                    background.surface,
                    border.subtle,
                    text.muted,
                    'hover:bg-accent cursor-pointer transition-colors'
                  )}
                  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                >
                  <TagIcon className="w-3 h-3 inline mr-1" />
                  {tag.name}
                </span>
              ))
            ) : (
              <Button
                variant="outline"
                size="sm"
                className={cn(typography.body.xs, text.muted)}
                disabled={!isEditable}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                タグを追加
              </Button>
            )}
          </div>
        </div>

        {/* メモ */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            メモ
          </h3>
          {isEditable ? (
            <Textarea
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="メモを入力..."
              rows={3}
              className={cn(
                typography.body.DEFAULT,
                'border-none shadow-none resize-none p-2',
                background.base,
                text.primary
              )}
            />
          ) : (
            formData.description ? (
              <p className={cn(typography.body.DEFAULT, text.primary)}>
                {formData.description}
              </p>
            ) : (
              <p className={cn(typography.body.DEFAULT, text.muted)}>
                メモがありません
              </p>
            )
          )}
        </div>

        {/* アクティビティ（タイムライン） */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <button
            onClick={() => setIsDetailOpen(!isDetailOpen)}
            className={cn(
              'w-full flex items-center justify-between p-0 bg-transparent border-none outline-none cursor-pointer',
              typography.heading.h6,
              'font-semibold',
              text.primary
            )}
          >
            アクティビティ
            {isDetailOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isDetailOpen && !isCreateMode && (
            <div className="space-y-3 pt-3">
              <div className="relative">
                <div className="space-y-2">
                  {/* 2分前: 時間変更 */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>2分前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <Clock className="w-3 h-3" />
                      </div>
                      {/* 接続線 - アイコンボックスの下から次のアイコンまで */}
                      <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className={cn(typography.body.small, 'leading-relaxed')}>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className={text.muted}>時間変更:</span>
                          <span className={cn(text.muted, 'font-mono text-xs')}>14:00-15:00</span>
                          <ArrowRight className={cn('w-3 h-3', text.muted)} />
                          <span className={cn(text.primary, 'font-mono text-xs font-medium')}>15:00-16:00</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 15分前: ステータス変更（自動） */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>15分前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <Activity className="w-3 h-3" />
                      </div>
                      {/* 接続線 - アイコンボックスの下から次のアイコンまで */}
                      <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn(typography.body.small, 'leading-relaxed')}>
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className={text.muted}>ステータス:</span>
                            <span className={text.muted}>予定</span>
                            <ArrowRight className={cn('w-3 h-3', text.muted)} />
                            <span className={cn(text.primary, 'font-medium')}>進行中</span>
                          </span>
                        </div>
                        <RefreshCw 
                          className={cn('w-3 h-3 flex-shrink-0 mt-0.5', text.muted)} 
                          title="システムによる自動更新" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 45分前: リマインダー設定（自動） */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>45分前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <Bell className="w-3 h-3" />
                      </div>
                      {/* 接続線 - アイコンボックスの下から次のアイコンまで */}
                      <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(typography.body.small, text.primary)}>
                          15分前にリマインド設定
                        </span>
                        <RefreshCw 
                          className={cn('w-3 h-3 flex-shrink-0 mt-0.5', text.muted)} 
                          title="システムによる自動更新" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1時間前: タグ追加 */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>1時間前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <TagIcon className="w-3 h-3" />
                      </div>
                      {/* 接続線 - アイコンボックスの下から次のアイコンまで */}
                      <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className={cn(typography.body.small, 'leading-relaxed')}>
                        <span className="flex items-center gap-1.5">
                          <span className={text.muted}>タグ追加:</span>
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded-full border',
                            background.surface,
                            text.primary,
                            border.strong
                          )}>
                            重要
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2時間前: メモ更新 */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>2時間前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <FileText className="w-3 h-3" />
                      </div>
                      {/* 接続線 - アイコンボックスの下から次のアイコンまで */}
                      <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                    </div>
                    <div className="flex-1 pb-1">
                      <span className={cn(typography.body.small, text.primary)}>
                        メモを更新
                      </span>
                    </div>
                  </div>

                  {/* 3時間前: 作成 */}
                  <div className="flex gap-3 relative">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={cn(typography.body.small, text.muted)}>3時間前</span>
                    </div>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        'w-5 h-5 rounded-lg flex items-center justify-center border',
                        background.surface,
                        border.strong,
                        text.muted
                      )}>
                        <Circle className="w-3 h-3" />
                      </div>
                      {/* 最後のアイテムは接続線なし */}
                    </div>
                    <div className="flex-1 pb-1">
                      <span className={cn(typography.body.small, text.primary)}>
                        作成
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isDetailOpen && isCreateMode && (
            <div className="pt-3 text-center">
              <span className={cn(typography.body.small, text.muted)}>
                作成後にアクティビティが表示されます
              </span>
            </div>
          )}
        </div>

        {/* アクションセクション */}
        <div className="space-y-3 p-4">
          {/* 新規作成時は保存状態のみ表示 */}
          {isCreateMode ? (
            <div className="text-center">
              <span className={cn(typography.body.xs, text.muted)}>
                自動保存中...
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => event && onDuplicate?.(event)}
                  disabled={!event}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  複製
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => event && onTemplateCreate?.(event)}
                  disabled={!event}
                  className="flex-1"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  テンプレート
                </Button>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => event && onDelete?.(event.id)}
                disabled={!event}
                className="w-full"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                削除
              </Button>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}