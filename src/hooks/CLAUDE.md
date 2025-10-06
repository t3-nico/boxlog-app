# hooks/ - カスタムフック実装ルール

BoxLogカスタムReact Hooks実装ガイドライン。

## 🎯 カスタムフック基本ルール

### 命名規則
```tsx
// ✅ 正しい命名（use始まり）
useTaskFilter
useAuth
useLocalStorage

// ❌ 間違った命名
taskFilter  // useなし
TaskFilter  // 大文字始まり
```

### ファイル配置
```tsx
// 機能専用フック
src/features/tasks/hooks/useTaskFilter.ts

// 共通フック
src/hooks/useLocalStorage.ts
src/hooks/useDebounce.ts
```

---

## 📋 カスタムフック種別

### 1. ステート管理フック
```tsx
// hooks/useToggle.ts
import { useState, useCallback } from 'react'

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}
```

### 2. 副作用管理フック
```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

### 3. データフェッチフック
```tsx
// hooks/useFetch.ts
import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useFetch = <T,>(url: string): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}
```

### 4. フォーム管理フック
```tsx
// hooks/useForm.ts
import { useState, ChangeEvent, FormEvent } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  validate?: (values: T) => Partial<Record<keyof T, string>>
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit }
}
```

---

## 🔧 高度なパターン

### Compound Component Pattern
```tsx
// hooks/useDisclosure.ts
import { useState, useCallback } from 'react'

export const useDisclosure = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, open, close, toggle }
}

// 使用例
const Modal = () => {
  const { isOpen, open, close } = useDisclosure()

  return (
    <>
      <button onClick={open}>開く</button>
      {isOpen && <dialog onClose={close}>...</dialog>}
    </>
  )
}
```

### Custom Context Hook
```tsx
// hooks/useTheme.ts
import { useContext } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext'

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
```

---

## 🧪 テスト

### カスタムフックのテスト
```tsx
// hooks/useToggle.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  it('should initialize with false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)
  })

  it('should set true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })
})
```

---

## 📋 ベストプラクティス

### 1. 依存配列の適切な管理
```tsx
// ✅ 推奨：必要な依存のみ
useEffect(() => {
  fetchData(userId)
}, [userId])

// ❌ 避ける：不要な依存
useEffect(() => {
  fetchData(userId)
}, [userId, fetchData])  // fetchDataは不要
```

### 2. メモ化の活用
```tsx
import { useMemo, useCallback } from 'react'

export const useExpensiveCalculation = (data: number[]) => {
  const result = useMemo(() => {
    return data.reduce((sum, n) => sum + n, 0)
  }, [data])

  const calculate = useCallback(() => {
    return result * 2
  }, [result])

  return { result, calculate }
}
```

### 3. クリーンアップ関数
```tsx
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent)

  // クリーンアップ
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

---

## 🔗 関連ドキュメント

- **テスト戦略**: [`../../tests/CLAUDE.md`](../../tests/CLAUDE.md)
- **機能開発**: [`../features/CLAUDE.md`](../features/CLAUDE.md)
- **共通処理**: [`../lib/CLAUDE.md`](../lib/CLAUDE.md)

---

**📖 最終更新**: 2025-09-30