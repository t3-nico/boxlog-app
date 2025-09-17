import { useEffect } from 'react'

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
  setFastInputMode
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter で高速入力モードを有効化
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

      // Enter で通常保存（後で決めるモードのみ）
      if (e.key === 'Enter' && scheduleMode === 'defer') {
        if (isValid) {
          e.preventDefault()
          handleSave()
        }
        return
      }

      // 数字キーでモード切り替え
      if (e.key === '1') {
        e.preventDefault()
        handleScheduleModeChange('defer')
        return
      }

      if (e.key === '2') {
        e.preventDefault()
        handleScheduleModeChange('schedule')
        return
      }

      // Tabキーでモード切り替え（タイトル入力時以外）
      if (e.key === 'Tab' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
        handleScheduleModeChange(newMode)
        return
      }

      // Spaceキーでモード切り替え（入力フィールド以外）
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
        handleScheduleModeChange(newMode)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isValid, handleSave, scheduleMode, handleScheduleModeChange, isEditMode, setFastInputMode])
}