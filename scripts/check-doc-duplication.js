#!/usr/bin/env node

/**
 * ドキュメント重複チェックスクリプト
 * 階層型ドキュメント構造の重複率を測定
 */

const fs = require('fs')
const path = require('path')

// チェック対象ドキュメント
const DOCUMENTS = [
  'CLAUDE.md',
  'src/CLAUDE.md',
  'src/README.md',
  'src/components/CLAUDE.md',
  'src/features/CLAUDE.md',
  'src/config/theme/CLAUDE.md',
  'src/lib/CLAUDE.md',
  'src/hooks/CLAUDE.md',
  'src/lib/business-rules/CLAUDE.md',
  'tests/CLAUDE.md',
  'tests/README.md',
  'docs/CLAUDE.md',
  '.github/CLAUDE.md',
  '.github/README.md',
]

// 重複判定の閾値（連続する単語数）
const THRESHOLD = 10

/**
 * ファイルを単語配列に変換
 */
function tokenize(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    // コードブロックとURLを除外
    const cleaned = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')

    // 単語に分割（日本語対応）
    const words = cleaned.match(/[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || []
    return words.map(w => w.toLowerCase())
  } catch (error) {
    return []
  }
}

/**
 * 2つのファイル間の重複を検出
 */
function findDuplicates(tokens1, tokens2, threshold) {
  const duplicates = []

  for (let i = 0; i < tokens1.length - threshold; i++) {
    const sequence = tokens1.slice(i, i + threshold).join(' ')

    for (let j = 0; j < tokens2.length - threshold; j++) {
      const compareSequence = tokens2.slice(j, j + threshold).join(' ')

      if (sequence === compareSequence) {
        duplicates.push({
          sequence,
          length: threshold,
          position1: i,
          position2: j,
        })
      }
    }
  }

  return duplicates
}

/**
 * メイン処理
 */
function main() {
  console.log('=== ドキュメント重複チェック開始 ===\n')

  const allTokens = {}
  const totalTokens = {}

  // 全ドキュメントをトークン化
  DOCUMENTS.forEach(doc => {
    const fullPath = path.join(process.cwd(), doc)
    if (fs.existsSync(fullPath)) {
      allTokens[doc] = tokenize(fullPath)
      totalTokens[doc] = allTokens[doc].length
      console.log(`✓ ${doc}: ${totalTokens[doc]}トークン`)
    }
  })

  console.log('\n=== 重複検出 ===\n')

  let totalDuplicates = 0
  const results = []

  // ペアごとに重複をチェック
  const docs = Object.keys(allTokens)
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const doc1 = docs[i]
      const doc2 = docs[j]

      const duplicates = findDuplicates(
        allTokens[doc1],
        allTokens[doc2],
        THRESHOLD
      )

      if (duplicates.length > 0) {
        const duplicateTokens = duplicates.length * THRESHOLD
        totalDuplicates += duplicateTokens

        results.push({
          doc1,
          doc2,
          count: duplicates.length,
          tokens: duplicateTokens,
        })

        console.log(`⚠️  ${doc1} ⇔ ${doc2}`)
        console.log(`   重複箇所: ${duplicates.length}件`)
        console.log(`   重複トークン数: ${duplicateTokens}`)
        console.log('')
      }
    }
  }

  // 統計情報
  const totalAllTokens = Object.values(totalTokens).reduce((sum, n) => sum + n, 0)
  const duplicationRate = ((totalDuplicates / totalAllTokens) * 100).toFixed(2)

  console.log('=== サマリー ===\n')
  console.log(`総トークン数: ${totalAllTokens}`)
  console.log(`重複トークン数: ${totalDuplicates}`)
  console.log(`重複率: ${duplicationRate}%`)
  console.log(`目標: 5%以下`)

  if (parseFloat(duplicationRate) <= 5) {
    console.log('\n✅ 重複率目標達成！')
    process.exit(0)
  } else {
    console.log('\n⚠️  重複率が目標を超えています')
    process.exit(1)
  }
}

main()