#!/usr/bin/env node

/**
 * jsx-no-leaked-render エラーの一括修正スクリプト
 * Issue #213 対応
 */

const { execSync: _execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI色コード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}🔧 ${msg}${colors.reset}\n`),
}

class JsxLeakedRenderFixer {
  constructor() {
    this.rootDir = process.cwd()
    this.srcDir = path.join(this.rootDir, 'src')
    this.fixes = []
  }

  async run() {
    log.title('jsx-no-leaked-render エラー一括修正')

    console.log('🎯 修正パターン:')
    console.log('  - {value && <Component />} → {value != null && <Component />}')
    console.log('  - {count && <div />} → {count > 0 && <div />}')
    console.log('  - {boolean && <span />} → {boolean === true && <span />}')
    console.log('  - {array.length && <List />} → {array.length > 0 && <List />}\n')

    await this.fixLeakedRenderErrors()
    this.printFixSummary()
  }

  async fixLeakedRenderErrors() {
    log.title('JSX Leaked Render パターンの修正')

    const tsxFiles = this.getAllTsxFiles()

    tsxFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8')
      let updatedContent = content
      let hasChanges = false
      const relativePath = path.relative(this.rootDir, filePath)

      // 修正パターン1: object && <Component /> → object != null && <Component />
      const objectPattern = /\{([a-zA-Z_][a-zA-Z0-9_.]*)\s*&&\s*\(/g
      updatedContent = updatedContent.replace(objectPattern, (match, variable) => {
        // 数値っぽい変数名は除外（別パターンで処理）
        if (
          variable.includes('count') ||
          variable.includes('length') ||
          variable.includes('size') ||
          variable.includes('total')
        ) {
          return match
        }
        // boolean系変数は === true で修正
        if (
          variable.includes('is') ||
          variable.includes('has') ||
          variable.includes('can') ||
          variable.includes('should') ||
          variable.includes('loading')
        ) {
          hasChanges = true
          return `{${variable} === true && (`
        }
        // その他オブジェクトは != null で修正
        hasChanges = true
        return `{${variable} != null && (`
      })

      // 修正パターン2: count/length系 → > 0 で修正
      const countPattern = /\{([a-zA-Z_][a-zA-Z0-9_.]*(?:count|length|size|total))\s*&&\s*\(/gi
      updatedContent = updatedContent.replace(countPattern, (match, variable) => {
        hasChanges = true
        return `{${variable} > 0 && (`
      })

      // 修正パターン3: array.length && → array.length > 0 &&
      const arrayLengthPattern = /\{([a-zA-Z_][a-zA-Z0-9_.]*\.length)\s*&&\s*\(/g
      updatedContent = updatedContent.replace(arrayLengthPattern, (match, expression) => {
        hasChanges = true
        return `{${expression} > 0 && (`
      })

      // 修正パターン4: boolean系変数は === true に
      const booleanPattern =
        /\{(is[A-Z][a-zA-Z]*|has[A-Z][a-zA-Z]*|can[A-Z][a-zA-Z]*|should[A-Z][a-zA-Z]*|loading|visible|open|active|enabled|disabled)\s*&&\s*\(/g
      updatedContent = updatedContent.replace(booleanPattern, (match, variable) => {
        hasChanges = true
        return `{${variable} === true && (`
      })

      // 修正パターン5: 数値リテラル && → > 0 &&
      const numberPattern = /\{(\d+)\s*&&\s*\(/g
      updatedContent = updatedContent.replace(numberPattern, (match, number) => {
        hasChanges = true
        return `{${number} > 0 && (`
      })

      if (hasChanges) {
        fs.writeFileSync(filePath, updatedContent)
        log.success(`JSX修正: ${relativePath}`)
        this.fixes.push(`JSX Leaked Render修正: ${relativePath}`)
      }
    })
  }

  // ヘルパーメソッド
  getAllTsxFiles() {
    const files = []
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return
      const items = fs.readdirSync(dir)
      items.forEach((item) => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath)
        }
      })
    }
    walkDir(this.srcDir)
    return files
  }

  printFixSummary() {
    console.log('\n' + '='.repeat(60))
    console.log(`${colors.bold}${colors.green}🔧 jsx-no-leaked-render 修正完了サマリー${colors.reset}`)
    console.log('='.repeat(60))

    if (this.fixes.length > 0) {
      console.log(`${colors.green}✅ 修正ファイル: ${this.fixes.length}個${colors.reset}`)
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix}`)
      })
    } else {
      console.log(`${colors.blue}ℹ️  修正が必要なファイルはありませんでした${colors.reset}`)
    }

    console.log(`\n💡 次のステップ:`)
    console.log('  - npm run lint で修正確認')
    console.log('  - npm run dev で動作確認')
    console.log('  - git add & commit で変更をコミット\n')
  }
}

// メイン実行
if (require.main === module) {
  const fixer = new JsxLeakedRenderFixer()
  fixer.run().catch(console.error)
}

module.exports = { JsxLeakedRenderFixer }
