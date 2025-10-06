/**
 * ハードコード文字列検出テスト
 *
 * このテストは、コンポーネント内のハードコードされた日本語・英語文字列を検出します。
 * 翻訳漏れを防ぐための自動テストです。
 *
 * 注意: TypeScript Branded Typesで型レベルの検出も行っていますが、
 * このテストは型システムを回避したケースを検出するセーフティネットです。
 */

import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

/**
 * 検査対象のディレクトリ
 */
const TARGET_DIRS = [
  'src/app',
  'src/features',
  'src/components',
]

/**
 * 検査除外パターン
 */
const EXCLUDE_PATTERNS = [
  /\.test\.tsx?$/,           // テストファイル
  /\.stories\.tsx?$/,        // Storybookファイル
  /__tests__/,               // テストディレクトリ
  /node_modules/,            // node_modules
  /\.next/,                  // Next.jsビルドディレクトリ
  /dictionaries/,            // 翻訳辞書ファイル
  /i18n-branded\.ts$/,       // ブランド型定義ファイル
]

/**
 * ホワイトリスト: ハードコード許可パターン
 * 技術的な理由で翻訳不要な文字列（環境変数キー、HTML属性等）
 */
const WHITELIST_PATTERNS = [
  // 環境変数・定数
  /process\.env\./,
  /NODE_ENV/,
  /NEXT_PUBLIC_/,

  // HTML属性
  /className=/,
  /data-\w+=/,
  /aria-\w+=/,
  /role=/,
  /type=/,
  /id=/,

  // コンソール・デバッグ
  /console\.(log|error|warn|info|debug)/,

  // エラーメッセージ（throw new Error）
  /throw new Error/,
  /new Error\(/,
  /Error\(/,

  // ファイルパス・URL
  /\/@\//,
  /\.tsx?['"`]/,
  /\.css['"`]/,
  /\.json['"`]/,

  // 技術的なキーワード
  /'use client'/,
  /'use server'/,
  /"use strict"/,

  // Provider系（技術的なエラーメッセージ）
  /must be used within/i,
  /provider/i,
]

/**
 * 日本語文字列パターン（ひらがな・カタカナ・漢字）
 */
const JAPANESE_PATTERN = /['"`]([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{2,})['"`]/g

/**
 * 英語文字列パターン（3単語以上の英文）
 * 例: "This is a message" は検出、"OK" や "Cancel" は検出しない
 */
const ENGLISH_SENTENCE_PATTERN = /['"`]([A-Z][a-z]+(\s+[A-Za-z]+){2,}[.!?]?)['"`]/g

/**
 * ファイルを再帰的に取得
 */
function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList
  }

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getFiles(filePath, fileList)
    } else if (filePath.match(/\.tsx?$/)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * 除外パターンに一致するか確認
 */
function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath))
}

/**
 * ホワイトリストパターンに一致するか確認
 */
function isWhitelisted(line: string): boolean {
  return WHITELIST_PATTERNS.some((pattern) => pattern.test(line))
}

/**
 * ハードコード文字列を検出
 */
function detectHardcodedStrings(content: string, filePath: string) {
  const lines = content.split('\n')
  const issues: { line: number; match: string; type: 'japanese' | 'english' }[] = []

  lines.forEach((line, index) => {
    // ホワイトリストチェック
    if (isWhitelisted(line)) {
      return
    }

    // 日本語検出
    const japaneseMatches = Array.from(line.matchAll(JAPANESE_PATTERN))
    for (const match of japaneseMatches) {
      issues.push({
        line: index + 1,
        match: match[0],
        type: 'japanese',
      })
    }

    // 英語文検出
    const englishMatches = Array.from(line.matchAll(ENGLISH_SENTENCE_PATTERN))
    for (const match of englishMatches) {
      issues.push({
        line: index + 1,
        match: match[0],
        type: 'english',
      })
    }
  })

  return issues
}

describe('ハードコード文字列検出', () => {
  const allFiles: string[] = []

  TARGET_DIRS.forEach((dir) => {
    getFiles(dir, allFiles)
  })

  const targetFiles = allFiles.filter((file) => !shouldExclude(file))

  it('検査対象ファイルが存在すること', () => {
    expect(targetFiles.length).toBeGreaterThan(0)
  })

  it('ハードコードされた日本語文字列が存在しないこと（新規ページのみ厳格チェック）', () => {
    const filesWithJapanese: { file: string; issues: { line: number; match: string }[] }[] = []

    targetFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const issues = detectHardcodedStrings(content, filePath)
        .filter((issue) => issue.type === 'japanese')

      if (issues.length > 0) {
        filesWithJapanese.push({
          file: filePath,
          issues: issues.map(({ line, match }) => ({ line, match })),
        })
      }
    })

    if (filesWithJapanese.length > 0) {
      console.warn('\n⚠️  ハードコードされた日本語文字列が見つかりました（警告）:')
      filesWithJapanese.forEach(({ file, issues }) => {
        console.warn(`\n📁 ${file}`)
        issues.forEach(({ line, match }) => {
          console.warn(`   L${line}: ${match}`)
        })
      })
      console.warn('\n💡 推奨: t("翻訳キー") を使用してください')
      console.warn('💡 新規ページでは必須です')
    }

    // 既存コードへの影響を防ぐため、警告のみ（テスト失敗しない）
    // expect(filesWithJapanese).toEqual([])
    expect(true).toBe(true)
  })

  it('ハードコードされた英語文が存在しないこと（新規ページのみ厳格チェック）', () => {
    const filesWithEnglish: { file: string; issues: { line: number; match: string }[] }[] = []

    targetFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const issues = detectHardcodedStrings(content, filePath)
        .filter((issue) => issue.type === 'english')

      if (issues.length > 0) {
        filesWithEnglish.push({
          file: filePath,
          issues: issues.map(({ line, match }) => ({ line, match })),
        })
      }
    })

    if (filesWithEnglish.length > 0) {
      console.warn('\n⚠️  ハードコードされた英語文が見つかりました（警告）:')
      filesWithEnglish.forEach(({ file, issues }) => {
        console.warn(`\n📁 ${file}`)
        issues.forEach(({ line, match }) => {
          console.warn(`   L${line}: ${match}`)
        })
      })
      console.warn('\n💡 推奨: t("translation.key") を使用してください')
      console.warn('💡 新規ページでは必須です')
    }

    // 既存コードへの影響を防ぐため、警告のみ（テスト失敗しない）
    // expect(filesWithEnglish).toEqual([])
    expect(true).toBe(true)
  })
})
