import { Fragment } from 'react'

/**
 * 検索語句をハイライトするためのユーティリティ
 */

interface HighlightMatch {
  start: number
  end: number
}

/**
 * テキスト内の検索語句のマッチ位置を取得
 */
export function findMatches(text: string, query: string): HighlightMatch[] {
  if (!query.trim() || !text) return []

  const matches: HighlightMatch[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  let startIndex = 0
  while (true) {
    const index = lowerText.indexOf(lowerQuery, startIndex)
    if (index === -1) break
    matches.push({ start: index, end: index + query.length })
    startIndex = index + 1
  }

  return matches
}

/**
 * 検索語句をハイライトしたReact要素を返す
 */
export function HighlightedText({
  text,
  query,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5',
}: {
  text: string
  query: string
  className?: string
  highlightClassName?: string
}) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>
  }

  const matches = findMatches(text, query)

  if (matches.length === 0) {
    return <span className={className}>{text}</span>
  }

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  matches.forEach((match, i) => {
    // マッチ前のテキスト
    if (match.start > lastIndex) {
      parts.push(
        <Fragment key={`text-${i}`}>
          {text.slice(lastIndex, match.start)}
        </Fragment>
      )
    }

    // ハイライト部分
    parts.push(
      <mark key={`match-${i}`} className={highlightClassName}>
        {text.slice(match.start, match.end)}
      </mark>
    )

    lastIndex = match.end
  })

  // 最後のマッチ後のテキスト
  if (lastIndex < text.length) {
    parts.push(<Fragment key="text-end">{text.slice(lastIndex)}</Fragment>)
  }

  return <span className={className}>{parts}</span>
}
