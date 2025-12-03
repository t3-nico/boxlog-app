/**
 * ヘルパー関数
 */

/**
 * 用語集の取得
 */
export function getTerminologyGlossary(language: string): Record<string, string> {
  // 用語集（実際の実装では外部ファイルから読み込み）
  const glossaries = {
    ja: {
      dashboard: 'ダッシュボード',
      settings: '設定',
      profile: 'プロフィール',
      authentication: '認証',
      task: 'タスク',
      calendar: 'カレンダー',
    },
  }

  return glossaries[language as keyof typeof glossaries] || {}
}

/**
 * 文体の検出
 */
export function detectWritingStyle(text: string): string {
  // 簡易的な文体検出
  if (/です|ます/.test(text)) return 'polite'
  if (/だ|である/.test(text)) return 'casual'
  return 'neutral'
}

/**
 * 配列をキーでグループ化
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}
