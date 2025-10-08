import { useCallback, useState } from 'react'

interface SmartExtraction {
  title: string
  date?: Date
  tags: string[]
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'
}

export function useSmartInput() {
  const [isProcessing, setIsProcessing] = useState(false)

  const extractSmartData = useCallback((input: string): SmartExtraction => {
    setIsProcessing(true)

    try {
      let cleanTitle = input
      const result: SmartExtraction = {
        title: '',
        tags: [],
      }

      // タグの抽出
      const tagMatches = input.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || []
      result.tags = tagMatches.map((tag) => tag.slice(1))
      cleanTitle = cleanTitle.replace(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '').trim()

      // 日付・時間の抽出
      const datePatterns = [
        { pattern: /明日|tomorrow/i, offset: 1 },
        { pattern: /明後日|day after tomorrow/i, offset: 2 },
        { pattern: /来週|next week/i, offset: 7 },
        { pattern: /今度の(月|火|水|木|金|土|日)曜?日?/i, handler: extractWeekday },
      ]

      for (const { pattern, offset, handler } of datePatterns) {
        if (pattern.test(input)) {
          if (offset) {
            const date = new Date()
            date.setDate(date.getDate() + offset)
            result.date = date
          } else if (handler) {
            result.date = handler(input)
          }
          break
        }
      }

      // 時間の抽出
      const timeMatch = input.match(/(\d{1,2}):?(\d{0,2})\s*(時|じ|am|pm)?/i)
      if (timeMatch && result.date) {
        const hours = parseInt(timeMatch[1])
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
        result.date.setHours(hours, minutes)
      } else if (timeMatch) {
        // 日付が設定されていない場合は今日に設定
        result.date = new Date()
        const hours = parseInt(timeMatch[1])
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
        result.date.setHours(hours, minutes)
      }

      // 優先度の推測
      const urgentKeywords = ['緊急', '急ぎ', 'urgent', '至急', '重要']
      const importantKeywords = ['大事', 'important', '必須', '重要']

      if (urgentKeywords.some((keyword) => input.toLowerCase().includes(keyword.toLowerCase()))) {
        result.priority = 'urgent'
      } else if (importantKeywords.some((keyword) => input.toLowerCase().includes(keyword.toLowerCase()))) {
        result.priority = 'important'
      }

      // タイトルのクリーンアップ
      result.title = cleanTitle || input

      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // 曜日からの日付計算
  function extractWeekday(input: string): Date {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const match = input.match(/今度の(月|火|水|木|金|土|日)/)

    if (match) {
      const targetDay = weekdays.indexOf(match[1])
      const today = new Date()
      const currentDay = today.getDay()
      const daysUntilTarget = targetDay === currentDay ? 7 : (targetDay - currentDay + 7) % 7

      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysUntilTarget)
      return targetDate
    }

    return new Date()
  }

  // よく使うパターンの提案
  const getSuggestions = useCallback((input: string): string[] => {
    const suggestions: string[] = []

    // 時間ベースの提案
    const hour = new Date().getHours()
    if (hour >= 9 && hour < 12) {
      suggestions.push('午前中に完了')
    } else if (hour >= 13 && hour < 17) {
      suggestions.push('今日中に完了')
    } else if (hour >= 17) {
      suggestions.push('明日の朝一番に')
    }

    // 曜日ベースの提案
    const day = new Date().getDay()
    if (day === 1) {
      // 月曜日
      suggestions.push('今週中に #週次タスク')
    } else if (day === 5) {
      // 金曜日
      suggestions.push('週末に #個人')
    }

    // 入力内容ベースの提案
    if (input.includes('会議') || input.includes('ミーティング')) {
      suggestions.push('#会議 #議事録')
    }

    if (input.includes('レポート') || input.includes('報告')) {
      suggestions.push('#レポート #文書作成')
    }

    if (input.includes('買い物') || input.includes('購入')) {
      suggestions.push('#買い物 #個人')
    }

    return suggestions.slice(0, 3) // 最大3つまで
  }, [])

  return {
    extractSmartData,
    getSuggestions,
    isProcessing,
  }
}
