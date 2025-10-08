'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // SSRでは常にfalseを返す
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    // 初期値を設定
    setMatches(mediaQueryList.matches)

    // リスナーを設定
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // addEventListener/removeEventListenerを使用（より新しいAPI）
    mediaQueryList.addEventListener('change', handleChange)

    // クリーンアップ
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
