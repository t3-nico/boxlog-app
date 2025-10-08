import { useCallback, useEffect, useRef, useState } from 'react'

import { Tag } from '@/types'

type ScheduleMode = 'defer' | 'schedule'

interface InitialData {
  title?: string
  date?: Date
  endDate?: Date
  tags?: Tag[]
  description?: string
  estimatedDuration?: number
  priority?: 'low' | 'medium' | 'high'
}

interface EssentialFormState {
  scheduleMode: ScheduleMode
  title: string
  date: Date
  endDate: Date
  tags: Tag[]
  estimatedDuration: number
  taskPriority: 'low' | 'medium' | 'high'
  memo: string
  showMemo: boolean
  reminder: number | null
  priority: 'low' | 'necessary' | 'high'
  fastInputMode: boolean
  isSubmitting: boolean
  error: string | null
  showSuccess: boolean
}

interface EssentialFormActions {
  setScheduleMode: (mode: ScheduleMode) => void
  setTitle: (title: string) => void
  setDate: (date: Date) => void
  setEndDate: (date: Date) => void
  setTags: (tags: Tag[]) => void
  setEstimatedDuration: (duration: number) => void
  setTaskPriority: (priority: 'low' | 'medium' | 'high') => void
  setMemo: (memo: string) => void
  setShowMemo: (show: boolean) => void
  setReminder: (reminder: number | null) => void
  setPriority: (priority: 'low' | 'necessary' | 'high') => void
  setFastInputMode: (mode: boolean) => void
  setIsSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  setShowSuccess: (success: boolean) => void
  resetForm: () => void
}

// ヘルパー関数のインポート（既存の関数を使用）
const getInitialScheduleMode = (initialData?: InitialData): ScheduleMode => {
  if (initialData?.date) {
    return 'schedule'
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('boxlog-create-mode')
    if (saved && ['defer', 'schedule'].includes(saved)) {
      return saved as ScheduleMode
    }
  }

  return 'defer'
}

const roundToNext15Minutes = (date: Date = new Date()): Date => {
  const result = new Date(date)
  const minutes = result.getMinutes()

  let roundedMinutes
  if (minutes === 0) {
    roundedMinutes = 0
  } else if (minutes <= 15) {
    roundedMinutes = 15
  } else if (minutes <= 30) {
    roundedMinutes = 30
  } else if (minutes <= 45) {
    roundedMinutes = 45
  } else {
    roundedMinutes = 60
  }

  if (roundedMinutes === 60) {
    result.setHours(result.getHours() + 1)
    result.setMinutes(0, 0, 0)
  } else {
    result.setMinutes(roundedMinutes, 0, 0)
  }

  return result
}

const getInitialDate = (initialData?: InitialData, scheduleMode?: string): Date => {
  if (initialData?.date) return initialData.date

  if (scheduleMode === 'specify') {
    return roundToNext15Minutes()
  }

  return new Date()
}

const getInitialEndDate = (initialData?: InitialData): Date => {
  if (initialData?.endDate) {
    return initialData.endDate
  }

  const startTime = initialData?.date || roundToNext15Minutes()
  const defaultEnd = new Date(startTime)

  const duration = initialData?.estimatedDuration || 60
  defaultEnd.setMinutes(defaultEnd.getMinutes() + duration)

  return defaultEnd
}

const hasInitialDataChanged = (prev: InitialData | null, current: InitialData | undefined): boolean => {
  if (!prev || !current) return !!current

  return (
    prev.title !== current.title ||
    prev.date?.getTime() !== current.date?.getTime() ||
    prev.endDate?.getTime() !== current.endDate?.getTime()
  )
}

export const useEssentialForm = (
  initialData?: InitialData,
  isOpen?: boolean
): [EssentialFormState, EssentialFormActions] => {
  // 状態管理
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(() => getInitialScheduleMode(initialData))

  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(() => getInitialDate(initialData, scheduleMode))
  const [endDate, setEndDate] = useState(() => getInitialEndDate(initialData))
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || [])
  const [estimatedDuration, setEstimatedDuration] = useState<number>(initialData?.estimatedDuration || 30)
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium')

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fastInputMode, setFastInputMode] = useState(false)

  // 追加オプション状態
  const [showMemo, setShowMemo] = useState(false)
  const [memo, setMemo] = useState('')
  const [reminder, setReminder] = useState<number | null>(null)
  const [priority, setPriority] = useState<'low' | 'necessary' | 'high'>('necessary')

  // 前回のinitialDataを保存するRef
  const prevInitialDataRef = useRef<InitialData | null>(null)

  // 初期データ更新処理
  const updateStateFromInitialData = useCallback((data: InitialData) => {
    if (data.title !== undefined) setTitle(data.title)
    if (data.date) setDate(data.date)
    if (data.endDate) {
      setEndDate(data.endDate)
    } else if (data.date) {
      const newEndDate = new Date(data.date)
      newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000)
      setEndDate(newEndDate)
    }
    if (data.tags) setTags(data.tags)
    if (data.description) {
      setMemo(data.description)
      setShowMemo(true)
    }
    if (data.estimatedDuration) setEstimatedDuration(data.estimatedDuration)
    if (data.priority) setTaskPriority(data.priority)

    // スケジュールモード更新
    setScheduleMode(data.date ? 'schedule' : 'defer')
  }, [])

  // 初期データ変更監視
  useEffect(() => {
    if (isOpen && initialData) {
      const prev = prevInitialDataRef.current
      const hasChanged = hasInitialDataChanged(prev, initialData)

      if (hasChanged) {
        updateStateFromInitialData(initialData)
        prevInitialDataRef.current = initialData
      }
    }
  }, [isOpen, initialData, updateStateFromInitialData])

  // フォームリセット
  const resetForm = useCallback(() => {
    setTitle('')
    setTags([])
    setMemo('')
    setShowMemo(false)
    setError(null)
    setShowSuccess(false)
    setIsSubmitting(false)
    setFastInputMode(false)
    setReminder(null)
    setPriority('necessary')
    setEstimatedDuration(30)
    setTaskPriority('medium')
  }, [])

  // スケジュールモード変更ハンドラー
  const handleScheduleModeChange = useCallback(
    (newMode: ScheduleMode) => {
      setScheduleMode(newMode)

      // 新規作成の場合のみlocalStorageに保存
      if (!initialData && typeof window !== 'undefined') {
        localStorage.setItem('boxlog-create-mode', newMode)
      }

      // モード変更時の日付設定
      if (newMode === 'schedule') {
        const roundedDate = roundToNext15Minutes()
        setDate(roundedDate)

        const newEndDate = new Date(roundedDate)
        newEndDate.setMinutes(roundedDate.getMinutes() + estimatedDuration)
        setEndDate(newEndDate)
      }
    },
    [initialData, estimatedDuration]
  )

  const state: EssentialFormState = {
    scheduleMode,
    title,
    date,
    endDate,
    tags,
    estimatedDuration,
    taskPriority,
    memo,
    showMemo,
    reminder,
    priority,
    fastInputMode,
    isSubmitting,
    error,
    showSuccess,
  }

  const actions: EssentialFormActions = {
    setScheduleMode: handleScheduleModeChange,
    setTitle,
    setDate,
    setEndDate,
    setTags,
    setEstimatedDuration,
    setTaskPriority,
    setMemo,
    setShowMemo,
    setReminder,
    setPriority,
    setFastInputMode,
    setIsSubmitting,
    setError,
    setShowSuccess,
    resetForm,
  }

  return [state, actions]
}
