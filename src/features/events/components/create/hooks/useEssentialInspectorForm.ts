import { useState, useRef, useEffect, useCallback } from 'react'

// タグの色生成ヘルパー関数
const generateTagColor = (name: string): string => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
    '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'
  ]
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialInspectorFormData {
  title: string
  date?: Date
  endDate?: Date
  tags: Tag[]
  description?: string
  estimatedDuration?: number
  priority?: 'low' | 'medium' | 'high'
  status?: 'backlog' | 'scheduled'
}

interface InitialData {
  title?: string
  date?: Date
  endDate?: Date
  tags?: Tag[]
  description?: string
  estimatedDuration?: number
  priority?: 'low' | 'medium' | 'high'
}

type ScheduleMode = 'defer' | 'schedule'

interface UseEssentialInspectorFormProps {
  initialData?: InitialData
  isEditMode?: boolean
  onSave: (data: EssentialInspectorFormData) => Promise<void>
  onClose: () => void
}

// 時刻を15分単位で切り上げるヘルパー関数
const roundToNextQuarterHour = (date?: Date): Date => {
  const now = date || new Date()
  const minutes = now.getMinutes()
  let roundedMinutes: number

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

  const result = new Date(now)
  if (roundedMinutes === 60) {
    result.setHours(result.getHours() + 1)
    result.setMinutes(0, 0, 0)
  } else {
    result.setMinutes(roundedMinutes, 0, 0)
  }

  return result
}

export const useEssentialInspectorForm = ({
  initialData,
  isEditMode = false,
  onSave,
  onClose
}: UseEssentialInspectorFormProps) => {
  // スケジュールモード状態
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(() => {
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
  })

  // メインフィールド状態
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(() => {
    if (initialData?.date) return initialData.date
    if (scheduleMode === 'schedule') {
      return roundToNextQuarterHour()
    }
    return new Date()
  })

  const [endDate, setEndDate] = useState(() => {
    if (initialData?.endDate) {
      return initialData.endDate
    }

    const startTime = initialData?.date ? new Date(initialData.date) : roundToNextQuarterHour()
    const defaultEnd = new Date(startTime)
    defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000)
    return defaultEnd
  })

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
  const prevInitialDataRef = useRef<typeof initialData | null>(null)

  // バリデーション
  const isValid = title.trim().length > 0

  // initialDataが変更された時の更新処理
  useEffect(() => {
    if (initialData) {
      const prev = prevInitialDataRef.current
      const hasChanged = !prev ||
        prev.title !== initialData.title ||
        prev.date?.getTime() !== initialData.date?.getTime() ||
        prev.endDate?.getTime() !== initialData.endDate?.getTime()

      if (hasChanged) {
        if (initialData.title !== undefined) {
          setTitle(initialData.title)
        }
        if (initialData.date) {
          setDate(initialData.date)
        }
        if (initialData.endDate) {
          setEndDate(initialData.endDate)
        } else if (initialData.date) {
          const newEndDate = new Date(initialData.date)
          newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000)
          setEndDate(newEndDate)
        }
        if (initialData.tags) {
          setTags(initialData.tags)
        }
        if (initialData.description) {
          setMemo(initialData.description)
          setShowMemo(true)
        }
        if (initialData.estimatedDuration) {
          setEstimatedDuration(initialData.estimatedDuration)
        }
        if (initialData.priority) {
          setTaskPriority(initialData.priority)
        }

        if (initialData.date) {
          setScheduleMode('schedule')
        } else {
          setScheduleMode('defer')
        }

        prevInitialDataRef.current = initialData
      }
    }
  }, [initialData])

  // スケジュールモード変更ハンドラー
  const handleScheduleModeChange = useCallback((newMode: ScheduleMode) => {
    setScheduleMode(newMode)

    if (!initialData && typeof window !== 'undefined') {
      localStorage.setItem('boxlog-create-mode', newMode)
    }

    if (newMode === 'schedule') {
      const rounded = roundToNextQuarterHour()
      setDate(rounded)
      const newEndDate = new Date(rounded)
      newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000)
      setEndDate(newEndDate)
    }
  }, [initialData])

  // 保存ハンドラー
  const handleSave = useCallback(async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      const saveData: EssentialInspectorFormData = {
        title: title.trim(),
        tags,
        estimatedDuration,
        priority: taskPriority,
        status: scheduleMode === 'defer' ? 'backlog' : 'scheduled'
      }

      if (scheduleMode === 'schedule') {
        saveData.date = date
        saveData.endDate = endDate
      }

      if (memo.trim()) {
        saveData.description = memo.trim()
      }

      await onSave(saveData)

      setShowSuccess(true)
      setTimeout(() => {
        onClose()
      }, 800)

    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, onSave, title, date, endDate, tags, onClose, scheduleMode, estimatedDuration, taskPriority, memo])

  // スマート抽出ハンドラー
  const handleSmartExtract = useCallback((extracted: {
    title: string
    date?: Date
    tags: string[]
  }) => {
    setTitle(extracted.title)
    if (extracted.date) {
      setDate(extracted.date)
    }

    const newTags = extracted.tags
      .filter(tagName => !tags.some(tag => tag.name === tagName))
      .map(tagName => ({
        id: Date.now().toString() + Math.random(),
        name: tagName,
        color: generateTagColor(tagName)
      }))

    if (newTags.length > 0) {
      setTags(prev => [...prev, ...newTags])
    }
  }, [tags])

  return {
    // 状態
    scheduleMode,
    title,
    date,
    endDate,
    tags,
    estimatedDuration,
    taskPriority,
    isSubmitting,
    error,
    showSuccess,
    fastInputMode,
    showMemo,
    memo,
    reminder,
    priority,
    isValid,

    // セッター
    setTitle,
    setDate,
    setEndDate,
    setTags,
    setEstimatedDuration,
    setTaskPriority,
    setFastInputMode,
    setShowMemo,
    setMemo,
    setReminder,
    setPriority,

    // ハンドラー
    handleScheduleModeChange,
    handleSave,
    handleSmartExtract
  }
}