import { useState, useRef, useEffect, useCallback } from 'react'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialEditFormData {
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
  title: string
  date?: Date
  endDate?: Date
  tags: Tag[]
  description?: string
  estimatedDuration?: number
  priority?: 'low' | 'medium' | 'high'
}

type ScheduleMode = 'defer' | 'schedule'

interface UseEssentialEditFormProps {
  initialData: InitialData
  isOpen: boolean
  onSave: (data: EssentialEditFormData) => Promise<void>
  onClose: () => void
}

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

export const useEssentialEditForm = ({
  initialData,
  isOpen,
  onSave,
  onClose
}: UseEssentialEditFormProps) => {
  // スケジュールモード状態
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(() => {
    return initialData?.date ? 'schedule' : 'defer'
  })

  // メインフィールド状態
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || new Date())
  const [endDate, setEndDate] = useState(() => {
    if (initialData?.endDate) {
      return initialData.endDate
    }
    const startTime = initialData?.date || new Date()
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

  // 追加オプション状態
  const [showMemo, setShowMemo] = useState(!!initialData?.description)
  const [memo, setMemo] = useState(initialData?.description || '')
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
        setTitle(initialData.title)
        if (initialData.date) {
          setDate(initialData.date)
          setScheduleMode('schedule')
        } else {
          setScheduleMode('defer')
        }
        if (initialData.endDate) {
          setEndDate(initialData.endDate)
        } else if (initialData.date) {
          const newEndDate = new Date(initialData.date)
          newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000)
          setEndDate(newEndDate)
        }
        setTags(initialData.tags)
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

        prevInitialDataRef.current = initialData
      }
    }
  }, [initialData])

  // フォームリセット（モーダルが閉じられた時）
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setShowSuccess(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // スケジュールモード変更ハンドラー
  const handleScheduleModeChange = useCallback((newMode: ScheduleMode) => {
    setScheduleMode(newMode)
  }, [])

  // 保存ハンドラー
  const handleSave = useCallback(async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      const saveData: EssentialEditFormData = {
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