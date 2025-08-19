/**
 * 現在時刻を管理するフック
 */

import { useState, useEffect } from 'react'

export interface UseCurrentTimeOptions {
  updateInterval?: number // 更新間隔（ミリ秒）
  enabled?: boolean // 更新を有効にするか
}

export function useCurrentTime(options: UseCurrentTimeOptions = {}) {
  const { updateInterval = 60000, enabled = true } = options // デフォルト1分間隔
  
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    if (!enabled) return
    
    // 初回更新
    setCurrentTime(new Date())
    
    // 定期更新
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, updateInterval)
    
    return () => clearInterval(interval)
  }, [updateInterval, enabled])
  
  return currentTime
}