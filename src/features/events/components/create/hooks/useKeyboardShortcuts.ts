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
  // 入力フィールドかどうかをチェック
  const isInputField = () => {
    const activeTag = document.activeElement?.tagName
    return activeTag === 'INPUT' || activeTag === 'TEXTAREA'
  }

  // モードを切り替えるヘルパー
  const toggleScheduleMode = () => {
    const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
    handleScheduleModeChange(newMode)
  }

  // Enterキー処理
  const handleEnterKey = (e: KeyboardEvent) => {
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
  }

  // 数字キー処理
  const handleNumberKey = (e: KeyboardEvent) => {
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
  }

  // モード切り替えキー処理
  const handleToggleKey = (e: KeyboardEvent) => {
    const isToggleKey = (e.key === 'Tab' || e.key === ' ') && !isInputField()
    
    if (isToggleKey) {
      e.preventDefault()
      toggleScheduleMode()
      return true
    }
    
    return false
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 各キーハンドラーで順次処理
      if (handleEnterKey(e)) return
      if (handleNumberKey(e)) return
      if (handleToggleKey(e)) return
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isValid, handleSave, scheduleMode, handleScheduleModeChange, isEditMode, setFastInputMode])
}