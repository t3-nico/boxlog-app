import { useMemo } from 'react'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface UseSmartTagSuggestionsProps {
  inputValue: string
  selectedTags: Tag[]
  contextualSuggestions?: string[]
  trendingTags: Tag[]
}

/**
 * スマート提案ロジックを提供するフック
 * - 入力値に基づく提案
 * - コンテキストベースの提案（会議、レポート等）
 * - 時間ベースの提案（残業等）
 * - 曜日ベースの提案（週末準備等）
 */
export const useSmartTagSuggestions = ({
  inputValue,
  selectedTags,
  contextualSuggestions = [],
  trendingTags,
}: UseSmartTagSuggestionsProps) => {
  const suggestions = useMemo(() => {
    // 入力値がない場合は提案なし
    if (inputValue.trim().length === 0) {
      return []
    }

    // # を除去した入力値
    const cleanInput = inputValue.startsWith('#') ? inputValue.slice(1) : inputValue
    const suggestions: Tag[] = []

    // 1. 入力値に基づくトレンドタグのフィルタリング
    const matchingTrending = trendingTags.filter((tag) => tag.name.toLowerCase().includes(cleanInput.toLowerCase()))
    suggestions.push(...matchingTrending)

    // 2. コンテキストベースの提案
    contextualSuggestions.forEach((contextWord) => {
      if (contextWord.includes('会議') && !suggestions.some((t) => t.name === '会議')) {
        suggestions.push({ id: 'ctx-1', name: '会議', color: '#8b5cf6' })
      }
      if (contextWord.includes('レポート') && !suggestions.some((t) => t.name === 'レポート')) {
        suggestions.push({ id: 'ctx-2', name: 'レポート', color: '#ef4444' })
      }
    })

    // 3. 時間ベースの提案（17時以降は「残業」を提案）
    const hour = new Date().getHours()
    if (hour >= 17 && !suggestions.some((t) => t.name === '残業')) {
      suggestions.push({ id: 'time-1', name: '残業', color: '#f97316' })
    }

    // 4. 曜日ベースの提案（金曜日は「週末準備」を提案）
    const day = new Date().getDay()
    if (day === 5 && !suggestions.some((t) => t.name === '週末準備')) {
      suggestions.push({ id: 'day-1', name: '週末準備', color: '#06b6d4' })
    }

    // 既に選択済みのタグを除外し、最大8件に制限
    return suggestions.filter((tag) => !selectedTags.some((selected) => selected.name === tag.name)).slice(0, 8)
  }, [inputValue, selectedTags, contextualSuggestions, trendingTags])

  return { suggestions }
}
