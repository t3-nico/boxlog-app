'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils'
import { useInboxFocusStore } from '@/features/inbox/stores/useInboxFocusStore'
import { format } from 'date-fns'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  ExternalLink,
  FileText,
  Link,
  MoreHorizontal,
  PanelRight,
  Plus,
  Repeat,
  Save,
  Tag,
  Trash,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlan } from '../../hooks/usePlan'
import { usePlanActivities } from '../../hooks/usePlanActivities'
import { usePlanMutations } from '../../hooks/usePlanMutations'
import { usePlans } from '../../hooks/usePlans'
import { usePlanTags } from '../../hooks/usePlanTags'
import { usePlanCacheStore } from '../../stores/usePlanCacheStore'
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore'
import type { Plan } from '../../types/plan'
import { formatActivity, formatRelativeTime } from '../../utils/activityFormatter'
import { configToReadable, ruleToConfig } from '../../utils/rrule'
import { NovelDescriptionEditor } from '../shared/NovelDescriptionEditor'
import { PlanDateTimeInput } from '../shared/PlanDateTimeInput'
import { PlanTagsSection } from '../shared/PlanTagsSection'
import { RecurrencePopover } from '../shared/RecurrencePopover'
import { ReminderSelect } from '../shared/ReminderSelect'

/**
 * Plan Inspector（全ページ共通Sheet）
 *
 * - Kanban、Calendar、Table等、全ビューから呼び出し可能
 * - usePlanInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 *
 * @example
 * ```tsx
 * // レイアウトに配置
 * <PlanInspector />
 *
 * // 各ビューから呼び出し
 * const { openInspector } = usePlanInspectorStore()
 * <div onClick={() => openInspector(plan.id)}>...</div>
 * ```
 */
export function PlanInspector() {
  const { isOpen, planId, initialData, closeInspector, openInspector } = usePlanInspectorStore()
  const { setFocusedId } = useInboxFocusStore()

  // Planデータ取得（タグ情報も含む）
  const { data: planData, isLoading } = usePlan(planId!, { includeTags: true, enabled: !!planId })
  // Type assertion: In practice planData is Plan | undefined (tRPC error handling is separate)
  const plan = (planData ?? null) as unknown as Plan | null

  // 全プランリスト取得（ナビゲーション用・リアルタイム性最適化済み）
  const { data: allPlans = [] } = usePlans()

  // 現在のプランのインデックスを計算
  const currentIndex = useMemo(() => {
    return allPlans.findIndex((t) => t.id === planId)
  }, [allPlans, planId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < allPlans.length - 1

  // アクティビティの並び順状態
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc')
  // ソートアイコンのホバー状態
  const [isHoveringSort, setIsHoveringSort] = useState(false)
  // 選択されたタグのID配列
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const { addPlanTag, removePlanTag } = usePlanTags()

  // プランのタグ情報を selectedTagIds に反映
  useEffect(() => {
    if (planData && 'tags' in planData) {
      const tagIds = (planData.tags as Array<{ id: string }>).map((tag) => tag.id)

      setSelectedTagIds(tagIds)
    } else {
      setSelectedTagIds([])
    }
  }, [planData])

  // Title欄のref（フォーカス制御用）
  const titleRef = useRef<HTMLSpanElement>(null)

  // Description欄の初期高さ設定
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (descriptionRef.current && plan) {
      const textarea = descriptionRef.current
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 96) // 96px = 6rem (4行分)
      textarea.style.height = `${newHeight}px`
    }
  }, [plan])

  // Inspectorの幅管理
  const [inspectorWidth, setInspectorWidth] = useState(540)
  const [isResizing, setIsResizing] = useState(false)

  // タグ変更ハンドラー（追加の差分を検出して実行）
  const handleTagsChange = async (newTagIds: string[]) => {
    if (!planId) return

    const oldTagIds = selectedTagIds
    const added = newTagIds.filter((id) => !oldTagIds.includes(id))

    // 楽観的更新
    setSelectedTagIds(newTagIds)

    try {
      // 追加されたタグを保存
      for (const tagId of added) {
        await addPlanTag(planId, tagId)
      }
    } catch (error) {
      console.error('Failed to add tags:', error)
      // エラー時は元に戻す
      setSelectedTagIds(oldTagIds)
    }
  }

  // タグ削除ハンドラー
  const handleRemoveTag = async (tagId: string) => {
    if (!planId) return

    // 楽観的更新
    const oldTagIds = selectedTagIds
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))

    try {
      await removePlanTag(planId, tagId)
    } catch (error) {
      console.error('Failed to remove tag:', error)
      // エラー時は元に戻す
      setSelectedTagIds(oldTagIds)
    }
  }

  // リサイズハンドラー
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      // 最小400px、最大800px
      if (newWidth >= 400 && newWidth <= 800) {
        setInspectorWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const goToPrevious = () => {
    if (hasPrevious) {
      const prevPlanId = allPlans[currentIndex - 1]!.id
      openInspector(prevPlanId)
      setFocusedId(prevPlanId)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      const nextPlanId = allPlans[currentIndex + 1]!.id
      openInspector(nextPlanId)
      setFocusedId(nextPlanId)
    }
  }

  // Mutations（Toast通知・キャッシュ無効化込み）
  const { updatePlan, deletePlan } = usePlanMutations()
  const { getCache } = usePlanCacheStore()

  // 削除ハンドラー
  const handleDelete = () => {
    if (!planId) return
    if (confirm('このプランを削除しますか？')) {
      deletePlan.mutate({ id: planId })
      closeInspector()
    }
  }

  // IDコピー
  const handleCopyId = () => {
    if (!planId) return
    navigator.clipboard.writeText(planId)
  }

  // 新しいタブで開く
  const handleOpenInNewTab = () => {
    if (!planId) return
    window.open(`/plans/${planId}`, '_blank')
  }

  // 複製
  const handleDuplicate = () => {
    if (!plan) return
    // TODO: 複製ロジックを実装
    console.log('Duplicate plan:', plan)
  }

  // リンクをコピー
  const handleCopyLink = () => {
    if (!planId) return
    const url = `${window.location.origin}/plans/${planId}`
    navigator.clipboard.writeText(url)
  }

  // テンプレートとして保存
  const handleSaveAsTemplate = () => {
    if (!plan) return
    // TODO: テンプレート保存ロジックを実装
    console.log('Save as template:', plan)
  }

  // デバウンスタイマー
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ローカル状態（UI用）
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [_repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false)
  const recurrenceTriggerRef = useRef<HTMLDivElement>(null)

  // Inspector が閉じられたときにポップアップも閉じる
  useEffect(() => {
    if (!isOpen) {
      setRecurrencePopoverOpen(false)
    }
  }, [isOpen])

  // Planデータが読み込まれたら状態を初期化
  useEffect(() => {
    // 既存プラン編集モード
    if (plan && 'id' in plan) {
      if (plan.due_date) {
        setSelectedDate(parseDateString(plan.due_date))
      } else {
        setSelectedDate(undefined)
      }

      if (plan.start_time) {
        const date = parseDatetimeString(plan.start_time)

        setStartTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setStartTime('')
      }

      if (plan.end_time) {
        const date = parseDatetimeString(plan.end_time)

        setEndTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setEndTime('')
      }

      // reminder_minutes から UI表示用の文字列に変換
      if ('reminder_minutes' in plan && plan.reminder_minutes !== null) {
        const minutes = plan.reminder_minutes
        const reminderMap: Record<number, string> = {
          0: '開始時刻',
          10: '10分前',
          30: '30分前',
          60: '1時間前',
          1440: '1日前',
          10080: '1週間前',
        }

        setReminderType(reminderMap[minutes] || 'カスタム')
      } else {
        setReminderType('')
      }
    }
    // 新規作成モード（initialDataあり）
    else if (!plan && initialData) {
      // start_time と end_time から日付と時刻を設定
      if (initialData.start_time) {
        const startDate = new Date(initialData.start_time)
        setSelectedDate(startDate)
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
        )
      }

      if (initialData.end_time) {
        const endDate = new Date(initialData.end_time)
        setEndTime(
          `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        )
      }
    }
    // 新規作成モード（initialDataなし）
    else if (!plan && !initialData) {
      // フィールドをクリア
      setSelectedDate(undefined)
      setStartTime('')
      setEndTime('')
      setReminderType('')
    }
  }, [plan, initialData])

  // Inspectorが開いたときにタイトルにフォーカス
  useEffect(() => {
    if (isOpen && titleRef.current) {
      // 少し遅延させてDOMが完全にレンダリングされた後にフォーカス
      const timer = setTimeout(() => {
        titleRef.current?.focus()
        // テキストを全選択（既存のタイトルを簡単に置き換えられるように）
        const range = document.createRange()
        const selection = window.getSelection()
        if (selection && titleRef.current) {
          range.selectNodeContents(titleRef.current)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen, planId])

  // 自動保存関数（デバウンス処理付き）
  const autoSave = (field: string, value: string | undefined) => {
    if (!planId) return

    // 既存のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 新しいタイマーを設定（500ms後に保存）
    debounceTimerRef.current = setTimeout(() => {
      const updateData: Record<string, string | undefined> = {}

      // フィールドに応じて適切な型で設定
      if (field === 'status' && value) {
        updateData.status = value as 'open' | 'in_progress' | 'completed' | 'cancelled'
      } else {
        updateData[field] = value
      }

      updatePlan.mutate({
        id: planId,
        data: updateData,
      })
    }, 500)
  }

  // 日付変更時の保存
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      autoSave('due_date', format(date, 'yyyy-MM-dd'))
    } else {
      autoSave('due_date', undefined)
    }
  }

  // 開始時間変更時の保存
  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    if (time && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
      autoSave('start_time', dateTime.toISOString())
    } else {
      autoSave('start_time', undefined)
    }
  }

  // 終了時間変更時の保存
  const handleEndTimeChange = (time: string) => {
    setEndTime(time)
    if (time && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
      autoSave('end_time', dateTime.toISOString())
    } else {
      autoSave('end_time', undefined)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Early return if no plan
  if (!isOpen) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeInspector()} modal={false}>
      <SheetContent className="gap-0 overflow-y-auto" style={{ width: `${inspectorWidth}px` }} showCloseButton={false}>
        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          className={`hover:bg-primary/50 absolute top-0 left-0 h-full w-1 cursor-ew-resize ${
            isResizing ? 'bg-primary' : ''
          }`}
          style={{ touchAction: 'none' }}
        />
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        ) : !plan ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">プランが見つかりません</p>
          </div>
        ) : (
          <>
            {/* ヘッダー */}
            <div className="flex h-10 items-center justify-between pt-2">
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => closeInspector()}
                        aria-label="閉じる"
                      >
                        <PanelRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>閉じる</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToPrevious}
                          disabled={!hasPrevious}
                          aria-label="前のプラン"
                        >
                          <ChevronUp className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>前のプラン</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToNext}
                          disabled={!hasNext}
                          aria-label="次のプラン"
                        >
                          <ChevronDown className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>次のプラン</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>

              {/* オプションメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0" aria-label="オプション">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    複製する
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    リンクをコピー
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAsTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    テンプレートとして保存
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyId}>
                    <Copy className="mr-2 h-4 w-4" />
                    IDをコピー
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    新しいタブで開く
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* タブ構成 */}
            <Tabs defaultValue="details" className="pt-2">
              <TabsList className="border-border grid h-10 w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  詳細
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <span className="relative flex items-center gap-1.5">
                    アクティビティ
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc')
                      }}
                      onMouseEnter={() => setIsHoveringSort(true)}
                      onMouseLeave={() => setIsHoveringSort(false)}
                      className="hover:bg-foreground/8 rounded p-0.5 transition-colors"
                      aria-label={activityOrder === 'desc' ? '古い順に変更' : '最新順に変更'}
                    >
                      {activityOrder === 'desc' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isHoveringSort && (
                      <div className="bg-foreground text-background absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                        {activityOrder === 'desc' ? '最新順で表示中' : '古い順で表示中'}
                      </div>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  コメント
                </TabsTrigger>
              </TabsList>

              {/* 詳細タブ */}
              <TabsContent value="details">
                {/* タイトル */}
                <div className="px-6 pt-4 pb-2">
                  <div className="inline">
                    <span
                      ref={titleRef}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => autoSave('title', e.currentTarget.textContent || '')}
                      className="bg-card dark:bg-card border-0 px-0 text-[2rem] font-bold outline-none"
                      style={{ fontSize: 'var(--font-size-xl)' }}
                    >
                      {plan.title}
                    </span>
                    {plan.plan_number && (
                      <span
                        className="text-muted-foreground ml-4 text-[2rem]"
                        style={{ fontSize: 'var(--font-size-xl)' }}
                      >
                        #{plan.plan_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* 日付・時間 */}
                <PlanDateTimeInput
                  selectedDate={selectedDate}
                  startTime={startTime}
                  endTime={endTime}
                  onDateChange={handleDateChange}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={handleEndTimeChange}
                  showBorderTop={true}
                />

                {/* リピートと通知 */}
                <div className="flex h-[40px] items-center gap-4 px-6 pb-2">
                  <div className="ml-6 flex h-[32px] items-center gap-4">
                    <div className="relative" ref={recurrenceTriggerRef}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={(() => {
                          if (!planId) return 'text-muted-foreground h-8 gap-2 px-2'
                          const cache = getCache(planId)
                          const recurrence_rule =
                            cache?.recurrence_rule !== undefined
                              ? cache.recurrence_rule
                              : plan && 'recurrence_rule' in plan
                                ? plan.recurrence_rule
                                : null
                          const recurrence_type =
                            cache?.recurrence_type !== undefined
                              ? cache.recurrence_type
                              : plan && 'recurrence_type' in plan
                                ? plan.recurrence_type
                                : null
                          return recurrence_rule || (recurrence_type && recurrence_type !== 'none')
                            ? 'text-foreground h-8 gap-2 px-2'
                            : 'text-muted-foreground h-8 gap-2 px-2'
                        })()}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRecurrencePopoverOpen(!recurrencePopoverOpen)
                        }}
                      >
                        <Repeat className="h-4 w-4" />
                        <span className="text-sm">
                          {(() => {
                            if (!planId) return '繰り返し'
                            const cache = getCache(planId)
                            const recurrence_rule =
                              cache?.recurrence_rule !== undefined
                                ? cache.recurrence_rule
                                : plan && 'recurrence_rule' in plan
                                  ? plan.recurrence_rule
                                  : null
                            const recurrence_type =
                              cache?.recurrence_type !== undefined
                                ? cache.recurrence_type
                                : plan && 'recurrence_type' in plan
                                  ? plan.recurrence_type
                                  : null

                            // カスタムルール（RRULE）がある場合
                            if (recurrence_rule) {
                              return configToReadable(ruleToConfig(recurrence_rule))
                            }

                            // シンプルな繰り返しタイプがある場合
                            if (recurrence_type && recurrence_type !== 'none') {
                              const typeMap: Record<string, string> = {
                                daily: '毎日',
                                weekly: '毎週',
                                monthly: '毎月',
                                yearly: '毎年',
                                weekdays: '平日',
                                none: '繰り返し',
                              }
                              return typeMap[recurrence_type] || '繰り返し'
                            }

                            return '繰り返し'
                          })()}
                        </span>
                      </Button>

                      <RecurrencePopover
                        open={recurrencePopoverOpen}
                        onOpenChange={setRecurrencePopoverOpen}
                        onRepeatTypeChange={(type) => {
                          if (!planId) return
                          setRepeatType(type)

                          // 型マッピング
                          const typeMap: Record<
                            string,
                            'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'
                          > = {
                            '': 'none',
                            毎日: 'daily',
                            毎週: 'weekly',
                            毎月: 'monthly',
                            毎年: 'yearly',
                            平日: 'weekdays',
                          }

                          const recurrenceType = typeMap[type] || 'none'

                          // optimistic updateがキャッシュを即座に更新
                          updatePlan.mutate({
                            id: planId,
                            data: { recurrence_type: recurrenceType, recurrence_rule: null },
                          })
                        }}
                        triggerRef={recurrenceTriggerRef}
                        recurrenceRule={(() => {
                          if (!planId) return null
                          const cache = getCache(planId)
                          return cache?.recurrence_rule !== undefined
                            ? cache.recurrence_rule
                            : plan && 'recurrence_rule' in plan
                              ? plan.recurrence_rule
                              : null
                        })()}
                        onRecurrenceRuleChange={(rrule) => {
                          if (!planId) return

                          // updatePlan.mutateがZustandキャッシュを即座に更新
                          updatePlan.mutate({
                            id: planId,
                            data: { recurrence_rule: rrule },
                          })
                        }}
                        placement="bottom"
                      />
                    </div>

                    <ReminderSelect
                      value={reminderType}
                      onChange={(type) => {
                        if (!planId) return
                        setReminderType(type)

                        // UI表示文字列 → 分数に変換
                        const reminderMap: Record<string, number | null> = {
                          '': null,
                          開始時刻: 0,
                          '10分前': 10,
                          '30分前': 30,
                          '1時間前': 60,
                          '1日前': 1440,
                          '1週間前': 10080,
                        }

                        const reminderMinutes = reminderMap[type] ?? null
                        updatePlan.mutate({
                          id: planId,
                          data: { reminder_minutes: reminderMinutes },
                        })
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <PlanTagsSection
                  selectedTagIds={selectedTagIds}
                  onTagsChange={handleTagsChange}
                  onRemoveTag={handleRemoveTag}
                  showBorderTop={true}
                  popoverAlign="end"
                  popoverSide="bottom"
                  popoverAlignOffset={-80}
                />

                {/* 説明 */}
                <div className="border-border/50 max-h-[232px] min-h-[48px] border-t px-6 py-2">
                  <div className="flex h-full items-start gap-2">
                    <FileText className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <NovelDescriptionEditor
                        key={plan.id}
                        content={plan.description || ''}
                        onChange={(html) => autoSave('description', html)}
                        placeholder="Add description..."
                      />
                    </div>
                  </div>
                </div>

                {/* ステータス */}
                <div className="flex flex-col gap-4 px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="status">ステータス</Label>
                    <select
                      id="status"
                      key={`status-${plan.id}`}
                      defaultValue={plan.status}
                      onChange={(e) => autoSave('status', e.target.value)}
                      className="bg-background border-input ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              {/* アクティビティタブ */}
              <TabsContent value="activity">
                <ActivityTab planId={planId!} order={activityOrder} onOrderChange={setActivityOrder} />
              </TabsContent>

              <TabsContent value="comments">
                <div className="text-muted-foreground py-8 text-center">コメント機能は準備中です</div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * アクティビティタブコンポーネント
 */
function ActivityTab({
  planId,
  order,
  onOrderChange: _onOrderChange,
}: {
  planId: string
  order: 'asc' | 'desc'
  onOrderChange: (order: 'asc' | 'desc') => void
}) {
  const { data: activities, isLoading } = usePlanActivities(planId, { order })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">まだアクティビティがありません</div>
  }

  return (
    <div>
      {/* アクティビティリスト */}
      <div className="px-6 py-4">
        {activities.map((activity, index) => {
          const formatted = formatActivity(activity)
          const IconComponent = getActivityIcon(formatted.icon)
          const isLast = index === activities.length - 1

          return (
            <div key={activity.id} className="flex gap-3">
              {/* タイムラインライン + アイコン */}
              <div className="relative flex flex-col items-center">
                {/* アイコン */}
                <div className="bg-muted relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* 縦線（最後のアイテム以外） */}
                {!isLast && <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />}
              </div>

              {/* 内容 */}
              <div className="flex-1 space-y-1 pb-6">
                <p className="text-sm">{formatted.message}</p>
                <p className="text-muted-foreground text-xs">{formatRelativeTime(activity.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * アクティビティアイコン取得
 */
function getActivityIcon(icon: 'create' | 'update' | 'status' | 'tag' | 'delete') {
  switch (icon) {
    case 'create':
      return Plus
    case 'update':
      return Edit
    case 'status':
      return CheckCircle
    case 'tag':
      return Tag
    case 'delete':
      return Trash
    default:
      return Edit
  }
}
