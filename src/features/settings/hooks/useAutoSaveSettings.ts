import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/lib/toast'

interface UseAutoSaveSettingsOptions<T> {
  initialValues: T
  onSave: (values: T) => Promise<void>
  debounceMs?: number
  successMessage?: string
  errorMessage?: string
}

// シンプルなdebounce実装
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debounced
}

export function useAutoSaveSettings<T>({
  initialValues,
  onSave,
  debounceMs = 1000, // 1秒後に自動保存
  successMessage = '設定を保存しました',
  errorMessage = '保存に失敗しました'
}: UseAutoSaveSettingsOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const { success, error } = useToast()
  const lastSavedValues = useRef<T>(initialValues)
  
  // デバウンスされた保存関数
  const debouncedSave = useRef(
    debounce(async (newValues: T) => {
      // 変更がない場合は保存しない
      if (JSON.stringify(newValues) === JSON.stringify(lastSavedValues.current)) {
        return
      }
      
      setIsSaving(true)
      
      try {
        await onSave(newValues)
        lastSavedValues.current = newValues
        
        // 成功トースト
        success(successMessage)
      } catch (error) {
        console.error('Failed to save settings:', error)
        
        // エラートースト
        error(
          errorMessage,
          error instanceof Error ? error.message : undefined
        )
      } finally {
        setIsSaving(false)
      }
    }, debounceMs)
  ).current
  
  // 値が変更されたら自動保存
  useEffect(() => {
    debouncedSave(values)
  }, [values, debouncedSave])
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])
  
  const updateValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const updateValues = useCallback((updates: Partial<T>) => {
    setValues(prev => ({ ...prev, ...updates }))
  }, [])
  
  return {
    values,
    updateValue,
    updateValues,
    isSaving,
  }
}