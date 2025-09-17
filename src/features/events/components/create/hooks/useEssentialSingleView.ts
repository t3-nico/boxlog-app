import { useCallback, useEffect } from 'react'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface UseEssentialSingleViewProps {
  isOpen: boolean
  isValid: boolean
  isEditMode: boolean
  scheduleMode: string
  title: string
  date: Date
  endDate: Date
  tags: Tag[]
  memo: string
  estimatedDuration: number
  taskPriority: string
  fastInputMode: boolean
  onSave: (data: any) => Promise<void>
  onClose: () => void
  formActions: {
    setTitle: (title: string) => void
    setTags: (tags: Tag[]) => void
    setMemo: (memo: string) => void
    setShowMemo: (show: boolean) => void
    setEstimatedDuration: (duration: number) => void
    setTaskPriority: (priority: string) => void
    setShowSuccess: (show: boolean) => void
    setDate: (date: Date) => void
    setFastInputMode: (mode: boolean) => void
    setIsSubmitting: (submitting: boolean) => void
    setError: (error: string | null) => void
    resetForm: () => void
  }
}

export const useEssentialSingleView = ({
  isOpen,
  isValid,
  isEditMode,
  scheduleMode,
  title,
  date,
  endDate,
  tags,
  memo,
  estimatedDuration,
  taskPriority,
  fastInputMode,
  onSave,
  onClose,
  formActions
}: UseEssentialSingleViewProps) => {

  const {
    setTitle,
    setTags,
    setMemo,
    setShowMemo,
    setEstimatedDuration,
    setTaskPriority,
    setShowSuccess,
    setDate,
    setFastInputMode,
    setIsSubmitting,
    setError,
    resetForm
  } = formActions

  // モーダルキャンセル時の処理
  const handleCancel = useCallback(() => {
    window.dispatchEvent(new CustomEvent('calendar-drag-cancel'))
    resetForm()
    onClose()
  }, [resetForm, onClose])

  // 高速入力モード処理
  const handleQuickInputReset = useCallback(() => {
    setTitle('')
    setTags([])
    setMemo('')
    setShowMemo(false)
    setEstimatedDuration(30)
    setTaskPriority('medium')

    setTimeout(() => {
      const titleInput = document.querySelector('input[placeholder*="イベント"], input[placeholder*="title"]') as HTMLInputElement
      if (titleInput) {
        titleInput.focus()
      }
    }, 100)
  }, [setTitle, setTags, setMemo, setShowMemo, setEstimatedDuration, setTaskPriority])

  // 通常モード処理
  const handleNormalModeSuccess = useCallback(() => {
    setShowSuccess(true)
    setTimeout(() => {
      onClose()
      setShowSuccess(false)
      setTitle('')
      setDate(new Date())
      setTags([])
      setFastInputMode(false)
    }, 1500)
  }, [setShowSuccess, onClose, setTitle, setDate, setTags, setFastInputMode])

  // データ整形処理
  const prepareSaveData = useCallback(() => {
    const saveData: any = {
      title,
      tags,
      description: memo || undefined
    }

    if (scheduleMode === 'schedule') {
      saveData.date = date
      saveData.endDate = endDate
      saveData.status = 'scheduled'
    } else {
      saveData.date = null
      saveData.endDate = null
      saveData.estimatedDuration = estimatedDuration
      saveData.priority = taskPriority
      saveData.status = 'backlog'
    }

    return saveData
  }, [title, tags, memo, scheduleMode, date, endDate, estimatedDuration, taskPriority])

  // 保存処理
  const handleSave = useCallback(async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      const saveData = prepareSaveData()
      await onSave(saveData)

      const isQuickInput = scheduleMode === 'defer' && !isEditMode

      if (isQuickInput && fastInputMode) {
        handleQuickInputReset()
      } else {
        handleNormalModeSuccess()
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isValid,
    setIsSubmitting,
    setError,
    prepareSaveData,
    onSave,
    scheduleMode,
    isEditMode,
    fastInputMode,
    handleQuickInputReset,
    handleNormalModeSuccess
  ])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        handleCancel()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (isValid) {
          e.preventDefault()
          if (scheduleMode === 'defer' && !isEditMode) {
            setFastInputMode(true)
          }
          handleSave()
        }
        return
      }

      if (e.key === 'Enter' && scheduleMode === 'defer') {
        if (isValid) {
          e.preventDefault()
          handleSave()
        }
        return
      }

      // その他のキーボードショートカット...
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isValid, scheduleMode, isEditMode, handleCancel, handleSave, setFastInputMode])

  return {
    handleSave,
    handleCancel
  }
}