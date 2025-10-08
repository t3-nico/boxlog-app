import { useCallback, useEffect } from 'react'

type ScheduleMode = 'defer' | 'schedule'

interface UseKeyboardShortcutsProps {
  isValid: boolean
  scheduleMode: ScheduleMode
  isEditMode: boolean
  handleSave: () => void
  handleScheduleModeChange: (mode: ScheduleMode) => void
  setFastInputMode: (mode: boolean) => void
}

export const useKeyboardShortcuts = ({
  isValid,
  scheduleMode,
  isEditMode,
  handleSave,
  handleScheduleModeChange,
  setFastInputMode,
}: UseKeyboardShortcutsProps) => {
  // 入力フィールドかどうかをチェック
  const isInputField = () => {
    const activeTag = document.activeElement?.tagName
    return activeTag === 'INPUT' || activeTag === 'TEXTAREA'
  }

  // モードを切り替えるヘルパー
  const toggleScheduleMode = useCallback(() => {
    const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
    handleScheduleModeChange(newMode)
  }, [scheduleMode, handleScheduleModeChange])

  // Enterキー処理
  const handleEnterKey = useCallback(
    (e: KeyboardEvent) => {
      const isCmdEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter'
      const isSimpleEnter = e.key === 'Enter' && scheduleMode === 'defer'

      if (isCmdEnter || isSimpleEnter) {
        if (isValid) {
          e.preventDefault()

          // Cmd+Enterの高速入力モード有効化
          if (isCmdEnter && scheduleMode === 'defer' && !isEditMode) {
            setFastInputMode(true)
          }

          handleSave()
        }
        return true
      }

      return false
    },
    [scheduleMode, isValid, isEditMode, setFastInputMode, handleSave]
  )

  // 数字キー処理
  const handleNumberKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '1') {
        e.preventDefault()
        handleScheduleModeChange('defer')
        return true
      }

      if (e.key === '2') {
        e.preventDefault()
        handleScheduleModeChange('schedule')
        return true
      }

      return false
    },
    [handleScheduleModeChange]
  )

  // モード切り替えキー処理
  const handleToggleKey = useCallback(
    (e: KeyboardEvent) => {
      const isToggleKey = (e.key === 'Tab' || e.key === ' ') && !isInputField()

      if (isToggleKey) {
        e.preventDefault()
        toggleScheduleMode()
        return true
      }

      return false
    },
    [toggleScheduleMode]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 各キーハンドラーで順次処理
      if (handleEnterKey(e)) return
      if (handleNumberKey(e)) return
      if (handleToggleKey(e)) return
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isValid,
    handleSave,
    scheduleMode,
    handleScheduleModeChange,
    isEditMode,
    setFastInputMode,
    handleEnterKey,
    handleNumberKey,
    handleToggleKey,
  ])
}
