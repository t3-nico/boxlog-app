import { useEffect, useState } from 'react'

/**
 * メディアクエリの状態を監視するフック
 *
 * @param query - メディアクエリ文字列（例: '(min-width: 1024px)'）
 * @returns メディアクエリがマッチしているかどうか
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // SSR対応：window未定義の場合はfalseを返す
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // 初期値設定
    setMatches(mediaQuery.matches)

    // メディアクエリ変更時のリスナー
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // リスナー登録
    mediaQuery.addEventListener('change', handleChange)

    // クリーンアップ
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
