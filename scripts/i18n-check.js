#!/usr/bin/env node

/**
 * i18n キー検証スクリプト
 *
 * en/ja 間の翻訳キーの差分を検出します。
 *
 * 使用方法:
 *   node scripts/i18n-check.js
 *   npm run i18n:check
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MESSAGES_DIR = join(__dirname, '..', 'messages')
const LOCALES = ['en', 'ja']
const BASE_LOCALE = 'en'

/**
 * JSONオブジェクトからすべてのキーパスを抽出
 * @param {object} obj
 * @param {string} prefix
 * @returns {string[]}
 */
function extractKeys(obj, prefix = '') {
  const keys = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

/**
 * 特定ロケールのすべての翻訳キーを取得
 * @param {string} locale
 * @returns {Promise<Map<string, string[]>>}
 */
async function getKeysForLocale(locale) {
  const localeDir = join(MESSAGES_DIR, locale)
  const files = await readdir(localeDir)
  const keysByFile = new Map()

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const filePath = join(localeDir, file)
    const content = await readFile(filePath, 'utf-8')
    const json = JSON.parse(content)
    const keys = extractKeys(json)

    keysByFile.set(file, keys)
  }

  return keysByFile
}

/**
 * 2つのセットの差分を取得
 * @param {Set<string>} setA
 * @param {Set<string>} setB
 * @returns {string[]}
 */
function difference(setA, setB) {
  return [...setA].filter(x => !setB.has(x))
}

async function main() {
  console.log('🔍 i18n キー検証を開始...\n')

  const keysByLocale = new Map()

  // 各ロケールのキーを収集
  for (const locale of LOCALES) {
    keysByLocale.set(locale, await getKeysForLocale(locale))
  }

  const baseKeys = keysByLocale.get(BASE_LOCALE)
  let hasErrors = false
  let totalMissing = 0
  let totalExtra = 0

  // ファイル単位で比較
  for (const [file, enKeys] of baseKeys) {
    const enSet = new Set(enKeys)

    for (const locale of LOCALES) {
      if (locale === BASE_LOCALE) continue

      const localeKeys = keysByLocale.get(locale)
      const targetKeys = localeKeys.get(file)

      if (!targetKeys) {
        console.log(`❌ ${locale}/${file} が存在しません`)
        hasErrors = true
        continue
      }

      const targetSet = new Set(targetKeys)
      const missing = difference(enSet, targetSet)
      const extra = difference(targetSet, enSet)

      if (missing.length > 0) {
        console.log(`\n📁 ${file}`)
        console.log(`  ❌ ${locale} に不足しているキー (${missing.length}件):`)
        missing.forEach(key => console.log(`     - ${key}`))
        hasErrors = true
        totalMissing += missing.length
      }

      if (extra.length > 0) {
        console.log(`\n📁 ${file}`)
        console.log(`  ⚠️  ${locale} にのみ存在するキー (${extra.length}件):`)
        extra.forEach(key => console.log(`     - ${key}`))
        totalExtra += extra.length
      }
    }
  }

  // ja にあって en にないファイルをチェック
  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) continue

    const localeKeys = keysByLocale.get(locale)
    for (const file of localeKeys.keys()) {
      if (!baseKeys.has(file)) {
        console.log(`\n⚠️  ${locale}/${file} は ${BASE_LOCALE} に存在しません`)
        totalExtra++
      }
    }
  }

  // サマリー
  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.log(`\n❌ 検証失敗: ${totalMissing} 件の不足キー`)
    if (totalExtra > 0) {
      console.log(`⚠️  ${totalExtra} 件の余分なキー/ファイル`)
    }
    process.exit(1)
  } else if (totalExtra > 0) {
    console.log(`\n⚠️  警告: ${totalExtra} 件の余分なキー/ファイル`)
    console.log('✅ 必須キーはすべて存在します')
  } else {
    console.log('\n✅ すべての翻訳キーが一致しています')
  }
}

main().catch(err => {
  console.error('エラー:', err)
  process.exit(1)
})
