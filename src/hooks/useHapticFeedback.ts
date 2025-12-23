'use client'

import { useCallback, useMemo } from 'react'

/**
 * Haptic Feedback（触覚フィードバック）フック
 *
 * Web Vibration APIを使用してモバイルデバイスで触覚フィードバックを提供
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 * @see https://developer.apple.com/design/human-interface-guidelines/playing-haptics
 *
 * @example
 * ```tsx
 * const { tap, success, error } = useHapticFeedback()
 *
 * <Button onClick={() => { tap(); handleClick() }}>タップ</Button>
 * ```
 */
export function useHapticFeedback() {
  /**
   * Vibration APIが利用可能かチェック
   */
  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return 'vibrate' in navigator
  }, [])

  /**
   * 軽いタップフィードバック（ボタンクリック等）
   * 10ms - Apple HIG推奨の「Light」相当
   */
  const tap = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(10)
    }
  }, [isSupported])

  /**
   * 成功フィードバック（完了、保存成功等）
   * パターン: 50ms振動 → 30ms休止 → 50ms振動
   */
  const success = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([50, 30, 50])
    }
  }, [isSupported])

  /**
   * エラー/警告フィードバック（バリデーションエラー等）
   * パターン: 100ms振動 → 50ms休止 → 100ms振動
   */
  const error = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([100, 50, 100])
    }
  }, [isSupported])

  /**
   * 選択変更フィードバック（トグル、スイッチ等）
   * 15ms - Apple HIG推奨の「Medium」相当
   */
  const selection = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(15)
    }
  }, [isSupported])

  /**
   * 重いインパクトフィードバック（ドラッグ&ドロップ完了等）
   * 30ms - Apple HIG推奨の「Heavy」相当
   */
  const impact = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(30)
    }
  }, [isSupported])

  return {
    isSupported,
    tap,
    success,
    error,
    selection,
    impact,
  }
}
