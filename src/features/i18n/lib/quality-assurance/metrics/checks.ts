/**
 * 品質チェック関数
 */

/**
 * 正確性チェック
 */
export function checkAccuracy(originalText: string, translatedText: string, language: string): number {
  // 基本的な正確性チェック
  let score = 100

  // 空文字チェック
  if (!translatedText || translatedText.trim() === '') {
    return 0
  }

  // 長さの大幅な違いチェック（言語特性を考慮）
  const lengthRatio = translatedText.length / originalText.length
  const expectedRatio = language === 'ja' ? { min: 0.4, max: 1.5 } : { min: 0.7, max: 1.4 }

  if (lengthRatio < expectedRatio.min || lengthRatio > expectedRatio.max) {
    score -= 15
  }

  // プレースホルダーの保持チェック
  const originalPlaceholders = originalText.match(/\{\{[^}]+\}\}/g) || []
  const translatedPlaceholders = translatedText.match(/\{\{[^}]+\}\}/g) || []

  if (originalPlaceholders.length !== translatedPlaceholders.length) {
    score -= 25
  }

  // HTMLタグの保持チェック
  const originalTags = originalText.match(/<[^>]+>/g) || []
  const translatedTags = translatedText.match(/<[^>]+>/g) || []

  if (originalTags.length !== translatedTags.length) {
    score -= 20
  }

  return Math.max(0, score)
}

/**
 * 流暢性チェック
 */
export function checkFluency(translatedText: string, language: string): number {
  let score = 100

  // 基本的な文法・流暢性チェック
  if (language === 'ja') {
    // 日本語特有のチェック
    // 不自然な敬語使用
    if (/です。.*ですます調/.test(translatedText)) {
      score -= 10
    }

    // 語尾の統一性
    const sentences = translatedText.split(/[。！？]/)
    const politeEndings = sentences.filter((s) => /です$|ます$|でした$|ました$/.test(s.trim()))
    const casualEndings = sentences.filter((s) => /だ$|である$|する$/.test(s.trim()))

    if (politeEndings.length > 0 && casualEndings.length > 0) {
      score -= 15
    }
  }

  // 繰り返し表現のチェック
  const words = translatedText.split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length

  if (repetitionRatio < 0.7) {
    score -= 10
  }

  // 極端に短い・長い文のチェック
  const sentences = translatedText.split(/[.。！？!?]/)
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length

  if (avgLength < 10 || avgLength > 200) {
    score -= 10
  }

  return Math.max(0, score)
}

/**
 * 一貫性チェック
 */
export function checkConsistency(
  translatedText: string,
  language: string,
  context: Record<string, unknown> | undefined,
  getTerminologyGlossary: (lang: string) => Record<string, string>,
  detectWritingStyle: (text: string) => string
): number {
  let score = 100

  // 用語の一貫性チェック（簡易版）
  const terms = getTerminologyGlossary(language)

  for (const [originalTerm, expectedTranslation] of Object.entries(terms)) {
    if (translatedText.includes(originalTerm) && !translatedText.includes(expectedTranslation)) {
      score -= 15
    }
  }

  // 文体の一貫性（既存の評価と照合）
  if (context && context.existingStyle) {
    const currentStyle = detectWritingStyle(translatedText)
    if (currentStyle !== context.existingStyle) {
      score -= 20
    }
  }

  return Math.max(0, score)
}

/**
 * 完全性チェック
 */
export function checkCompleteness(originalText: string, translatedText: string): number {
  if (!translatedText || translatedText.trim() === '') {
    return 0
  }

  // 重要な要素の保持チェック
  let score = 100

  // URLの保持
  const originalUrls = originalText.match(/https?:\/\/[^\s]+/g) || []
  const translatedUrls = translatedText.match(/https?:\/\/[^\s]+/g) || []
  if (originalUrls.length !== translatedUrls.length) {
    score -= 20
  }

  // メールアドレスの保持
  const originalEmails = originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  const translatedEmails = translatedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  if (originalEmails.length !== translatedEmails.length) {
    score -= 15
  }

  return Math.max(0, score)
}

/**
 * 文化的適応性チェック
 */
export function checkCulturalAdaptation(translatedText: string, language: string): number {
  let score = 100

  if (language === 'ja') {
    // 日本語の文化的適応チェック
    // 過度に直訳的な表現
    const directTranslationPatterns = [
      /私たち\s*は/, // 不要な主語
      /することができます$/, // 冗長な可能表現
      /を持っています$/, // 英語的な所有表現
    ]

    for (const pattern of directTranslationPatterns) {
      if (pattern.test(translatedText)) {
        score -= 8
      }
    }

    // 適切な敬語レベルの使用
    const businessContext = /設定|機能|サービス|アカウント/.test(translatedText)
    if (businessContext && !/です|ます/.test(translatedText)) {
      score -= 15
    }
  }

  return Math.max(0, score)
}

/**
 * 技術的正確性チェック
 */
export function checkTechnicalAccuracy(originalText: string, translatedText: string): number {
  let score = 100

  // 技術用語の翻訳チェック
  const technicalTerms = {
    API: 'API', // そのまま
    database: 'データベース',
    authentication: '認証',
    dashboard: 'ダッシュボード',
    settings: '設定',
  }

  for (const [original, expected] of Object.entries(technicalTerms)) {
    if (originalText.toLowerCase().includes(original.toLowerCase())) {
      if (!translatedText.includes(expected)) {
        score -= 20
      }
    }
  }

  return Math.max(0, score)
}
