/**
 * 現在時刻を管理するフック
 */

import { useEffect, useState } from 'react'

export interface UseCurrentTimeOptions {
  updateInterval?: number // 更新間隔（ミリ秒）
  enabled?: boolean // 更新を有効にするか
}

export function useCurrentTime(options: UseCurrentTimeOptions = {}) {
  const { updateInterval = 60000, enabled = true } = options // デフォルト1分間隔

  // 遅延初期化で初期値を設定（useEffect内でのsetStateを回避）
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    if (!enabled) return

    if (process.env.NODE_ENV === 'development') {
      console.log('useCurrentTime initialized:', currentTime.toLocaleTimeString())
    }

    // 定期更新
    const interval = setInterval(() => {
      const newTime = new Date()

      setCurrentTime(newTime)
      if (process.env.NODE_ENV === 'development') {
        console.log('useCurrentTime updated:', newTime.toLocaleTimeString())
      }
    }, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval, enabled, currentTime])

  return currentTime
}
