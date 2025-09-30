import { useCallback, useState } from 'react'

/**
 * トグル状態を管理するカスタムフック
 * @param initialValue - 初期値（デフォルト: false）
 * @returns トグル状態と操作関数
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return { value, toggle, setTrue, setFalse, setValue }
}
