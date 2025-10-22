#!/usr/bin/env tsx
/**
 * License Information Generator
 *
 * OSS依存関係のライセンス情報を自動生成
 *
 * 実行方法:
 * ```bash
 * npm run generate-licenses
 * ```
 *
 * 生成物:
 * 1. public/oss-credits.json - Web表示用JSON
 * 2. public/THIRD_PARTY_NOTICES.txt - Apache-2.0 NOTICEファイル集約
 *
 * @see Issue #545 - 第三者ライセンス表記整備 Phase 2
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
// @ts-expect-error - license-checker has no type definitions
import licenseChecker from 'license-checker'

/**
 * ライセンス情報の型定義
 */
interface LicenseInfo {
  licenses: string
  repository?: string
  licenseFile?: string
  publisher?: string
  email?: string
  url?: string
  copyright?: string
}

/**
 * 公開用クレジット情報の型定義
 */
interface CreditInfo {
  name: string
  version: string
  license: string
  repository?: string
  publisher?: string
  copyright?: string
}

/**
 * メイン処理
 */
async function generateLicenses(): Promise<void> {
  console.log('📄 License Information Generator')
  console.log('='.repeat(50))

  try {
    // 1. license-checkerで依存関係を収集
    console.log('\n📦 Collecting dependency licenses...')
    const packages = await collectLicenses()
    console.log(`   ✅ Found ${Object.keys(packages).length} packages`)

    // 2. Apache-2.0のNOTICEファイルを抽出
    console.log('\n📋 Extracting Apache-2.0 NOTICE files...')
    const notices = extractNotices(packages)
    console.log(`   ✅ Found ${notices.length} NOTICE files`)

    // 3. JSON形式で公開用データを生成
    console.log('\n🔧 Generating oss-credits.json...')
    const credits = generateCredits(packages)
    const outputDir = join(process.cwd(), 'public')
    const jsonPath = join(outputDir, 'oss-credits.json')

    // ディレクトリが存在しない場合は作成
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    writeFileSync(jsonPath, JSON.stringify(credits, null, 2), 'utf-8')
    console.log(`   ✅ Created: ${jsonPath}`)

    // 4. THIRD_PARTY_NOTICES.txt を生成
    console.log('\n📝 Generating THIRD_PARTY_NOTICES.txt...')
    const noticesPath = join(outputDir, 'THIRD_PARTY_NOTICES.txt')
    const noticesContent = generateNoticesFile(notices)
    writeFileSync(noticesPath, noticesContent, 'utf-8')
    console.log(`   ✅ Created: ${noticesPath}`)

    // 5. 統計情報を表示
    console.log('\n📊 License Statistics:')
    const licenseStats = calculateLicenseStats(packages)
    Object.entries(licenseStats)
      .sort(([, a], [, b]) => b - a)
      .forEach(([license, count]) => {
        console.log(`   ${license}: ${count} packages`)
      })

    console.log('\n✅ License information generated successfully!')
    console.log('='.repeat(50))
  } catch (error) {
    console.error('\n❌ Error generating licenses:', error)
    process.exit(1)
  }
}

/**
 * license-checkerで依存関係のライセンス情報を収集
 */
async function collectLicenses(): Promise<Record<string, LicenseInfo>> {
  return new Promise((resolve, reject) => {
    licenseChecker.init(
      {
        start: process.cwd(),
        production: true, // productionのみ
        json: true,
      },
      (err: Error | null, packages: Record<string, LicenseInfo>) => {
        if (err) {
          reject(err)
        } else {
          resolve(packages)
        }
      }
    )
  })
}

/**
 * Apache-2.0のNOTICEファイルを抽出
 */
function extractNotices(packages: Record<string, LicenseInfo>): string[] {
  const notices: string[] = []

  Object.entries(packages).forEach(([name, info]) => {
    if (info.licenses.includes('Apache-2.0') && info.licenseFile) {
      const licenseDir = dirname(info.licenseFile)
      const noticeFile = join(licenseDir, 'NOTICE')

      if (existsSync(noticeFile)) {
        try {
          const noticeContent = readFileSync(noticeFile, 'utf-8')
          notices.push(`\n${'='.repeat(80)}\n${name}\n${'='.repeat(80)}\n\n${noticeContent}`)
        } catch (error) {
          console.warn(`   ⚠️  Failed to read NOTICE for ${name}:`, error)
        }
      }
    }
  })

  return notices
}

/**
 * 公開用のクレジット情報を生成
 */
function generateCredits(packages: Record<string, LicenseInfo>): CreditInfo[] {
  return Object.entries(packages)
    .map(([nameWithVersion, info]) => {
      // "package@version" の形式から name と version を分離
      const lastAtIndex = nameWithVersion.lastIndexOf('@')
      const name = nameWithVersion.substring(0, lastAtIndex)
      const version = nameWithVersion.substring(lastAtIndex + 1)

      return {
        name,
        version,
        license: info.licenses,
        repository: info.repository,
        publisher: info.publisher,
        copyright: info.copyright,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name)) // アルファベット順にソート
}

/**
 * THIRD_PARTY_NOTICES.txt ファイルの内容を生成
 */
function generateNoticesFile(notices: string[]): string {
  const header = `BoxLog - Third Party Notices

This file contains notices for third-party software components included in this project.

Apache License 2.0 - NOTICE Files
${'-'.repeat(80)}

The following components are licensed under the Apache License 2.0 and include
NOTICE files that must be preserved according to the license terms.

`

  const footer = `
${'-'.repeat(80)}

For a complete list of all third-party software and their licenses,
please visit: /legal/oss-credits

Generated: ${new Date().toISOString()}
`

  if (notices.length === 0) {
    return header + '\n(No Apache-2.0 packages with NOTICE files found)\n' + footer
  }

  return header + notices.join('\n\n') + footer
}

/**
 * ライセンスごとの統計を計算
 */
function calculateLicenseStats(packages: Record<string, LicenseInfo>): Record<string, number> {
  const stats: Record<string, number> = {}

  Object.values(packages).forEach((info) => {
    const license = info.licenses
    stats[license] = (stats[license] || 0) + 1
  })

  return stats
}

// 実行
generateLicenses().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
