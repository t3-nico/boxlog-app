#!/usr/bin/env node

/**
 * PR品質レポート自動生成スクリプト
 *
 * BoxLogアプリケーションのPR時品質メトリクスを統合して
 * レポート形式で出力します。
 *
 * Usage:
 *   npm run pr:quality-report
 *   node scripts/pr-quality-report.js
 *   node scripts/pr-quality-report.js --format json
 *   node scripts/pr-quality-report.js --format markdown
 */

const { execSync } = require('child_process')
const fs = require('fs')

class PRQualityReporter {
  constructor(options = {}) {
    this.options = {
      format: options.format || 'console', // console, json, markdown
      outputFile: options.outputFile,
      verbose: options.verbose || false,
      ...options,
    }

    this.report = {
      timestamp: new Date().toISOString(),
      pr: {
        branch: this.getCurrentBranch(),
        commit: this.getCurrentCommit(),
        author: this.getCommitAuthor(),
      },
      quality: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0,
        score: 0,
      },
    }
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    } catch (error) {
      return 'unknown'
    }
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    } catch (error) {
      return 'unknown'
    }
  }

  getCommitAuthor() {
    try {
      return execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf8' }).trim()
    } catch (error) {
      return 'unknown'
    }
  }

  async runQualityChecks() {
    console.log('🔍 PR品質チェック実行中...\n')

    // 1. TypeScript型チェック
    await this.runTypeScriptCheck()

    // 2. ESLint品質チェック
    await this.runESLintCheck()

    // 3. テスト実行
    await this.runTestCheck()

    // 4. Bundle サイズチェック
    await this.runBundleCheck()

    // 5. アクセシビリティチェック
    await this.runAccessibilityCheck()

    // 6. セキュリティチェック
    await this.runSecurityCheck()

    // 7. ドキュメント整合性チェック
    await this.runDocumentationCheck()

    // 総合スコア計算
    this.calculateOverallScore()
  }

  async runTypeScriptCheck() {
    console.log('📝 TypeScript型チェック...')
    try {
      execSync('npm run typecheck', { stdio: 'pipe' })
      this.report.quality.typescript = {
        status: 'PASS',
        errors: 0,
        message: 'TypeScript型エラーなし',
      }
      this.report.summary.passed++
      console.log('✅ TypeScript: PASS\n')
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || ''
      const errorCount = (errorOutput.match(/error TS/g) || []).length

      this.report.quality.typescript = {
        status: 'FAIL',
        errors: errorCount,
        message: `TypeScript型エラー: ${errorCount}件`,
        details: this.options.verbose ? errorOutput : undefined,
      }
      this.report.summary.failed++
      console.log(`❌ TypeScript: FAIL (${errorCount}件のエラー)\n`)
    }
  }

  async runESLintCheck() {
    console.log('🔍 ESLint品質チェック...')
    try {
      const _output = execSync('npm run lint', { encoding: 'utf8' })
      this.report.quality.eslint = {
        status: 'PASS',
        warnings: 0,
        errors: 0,
        message: 'ESLint品質チェック通過',
      }
      this.report.summary.passed++
      console.log('✅ ESLint: PASS\n')
    } catch (error) {
      const _errorOutput = error.stdout?.toString() || ''
      const warningCount = (_errorOutput.match(/warning/g) || []).length
      const errorCount = (_errorOutput.match(/error/g) || []).length

      this.report.quality.eslint = {
        status: errorCount > 0 ? 'FAIL' : 'WARN',
        warnings: warningCount,
        errors: errorCount,
        message: `ESLint: ${errorCount}件のエラー, ${warningCount}件の警告`,
        details: this.options.verbose ? errorOutput : undefined,
      }

      if (errorCount > 0) {
        this.report.summary.failed++
        console.log(`❌ ESLint: FAIL (${errorCount}件のエラー)\n`)
      } else {
        this.report.summary.warnings++
        console.log(`⚠️ ESLint: 警告あり (${warningCount}件)\n`)
      }
    }
  }

  async runTestCheck() {
    console.log('🧪 テスト実行...')
    try {
      const output = execSync('npm run test:run', { encoding: 'utf8' })
      const testResults = this.parseTestOutput(output)

      this.report.quality.tests = {
        status: 'PASS',
        ...testResults,
        message: `全テスト通過: ${testResults.passed}件`,
      }
      this.report.summary.passed++
      console.log(`✅ テスト: PASS (${testResults.passed}件通過)\n`)
    } catch (error) {
      const errorOutput = error.stdout?.toString() || ''
      const testResults = this.parseTestOutput(errorOutput)

      this.report.quality.tests = {
        status: 'FAIL',
        ...testResults,
        message: `テスト失敗: ${testResults.failed}件`,
        details: this.options.verbose ? errorOutput : undefined,
      }
      this.report.summary.failed++
      console.log(`❌ テスト: FAIL (${testResults.failed}件失敗)\n`)
    }
  }

  parseTestOutput(output) {
    // Vitest出力形式をパース
    const passedMatch = output.match(/(\d+) passed/i)
    const failedMatch = output.match(/(\d+) failed/i)
    const totalMatch = output.match(/Tests?\s+(\d+)/i)

    return {
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
    }
  }

  async runBundleCheck() {
    console.log('📦 Bundle サイズチェック...')
    try {
      execSync('npm run bundle:check', { stdio: 'pipe' })
      this.report.quality.bundle = {
        status: 'PASS',
        message: 'Bundle サイズ基準内',
      }
      this.report.summary.passed++
      console.log('✅ Bundle: PASS\n')
    } catch (error) {
      this.report.quality.bundle = {
        status: 'FAIL',
        message: 'Bundle サイズ基準超過',
        details: this.options.verbose ? error.message : undefined,
      }
      this.report.summary.failed++
      console.log('❌ Bundle: FAIL\n')
    }
  }

  async runAccessibilityCheck() {
    console.log('♿ アクセシビリティチェック...')
    try {
      execSync('npm run a11y:check', { stdio: 'pipe' })
      this.report.quality.accessibility = {
        status: 'PASS',
        message: 'アクセシビリティチェック通過',
      }
      this.report.summary.passed++
      console.log('✅ アクセシビリティ: PASS\n')
    } catch (error) {
      this.report.quality.accessibility = {
        status: 'FAIL',
        message: 'アクセシビリティ違反あり',
        details: this.options.verbose ? error.message : undefined,
      }
      this.report.summary.failed++
      console.log('❌ アクセシビリティ: FAIL\n')
    }
  }

  async runSecurityCheck() {
    console.log('🔒 セキュリティチェック...')
    try {
      execSync('npm run secrets:check', { stdio: 'pipe' })
      this.report.quality.security = {
        status: 'PASS',
        message: 'セキュリティチェック通過',
      }
      this.report.summary.passed++
      console.log('✅ セキュリティ: PASS\n')
    } catch (error) {
      this.report.quality.security = {
        status: 'FAIL',
        message: 'セキュリティ問題検出',
        details: this.options.verbose ? error.message : undefined,
      }
      this.report.summary.failed++
      console.log('❌ セキュリティ: FAIL\n')
    }
  }

  async runDocumentationCheck() {
    console.log('📚 ドキュメント整合性チェック...')
    try {
      execSync('npm run docs:check', { stdio: 'pipe' })
      this.report.quality.documentation = {
        status: 'PASS',
        message: 'ドキュメント整合性OK',
      }
      this.report.summary.passed++
      console.log('✅ ドキュメント: PASS\n')
    } catch (error) {
      this.report.quality.documentation = {
        status: 'WARN',
        message: 'ドキュメント整合性に問題',
        details: this.options.verbose ? error.message : undefined,
      }
      this.report.summary.warnings++
      console.log('⚠️ ドキュメント: 警告\n')
    }
  }

  calculateOverallScore() {
    const total = this.report.summary.passed + this.report.summary.failed + this.report.summary.warnings
    if (total === 0) {
      this.report.summary.score = 0
      return
    }

    // スコア計算：PASS=100点、WARN=50点、FAIL=0点
    const totalScore = this.report.summary.passed * 100 + this.report.summary.warnings * 50
    this.report.summary.score = Math.round((totalScore / (total * 100)) * 100)
  }

  generateReport() {
    switch (this.options.format) {
      case 'json':
        return this.generateJSONReport()
      case 'markdown':
        return this.generateMarkdownReport()
      default:
        return this.generateConsoleReport()
    }
  }

  generateConsoleReport() {
    const { summary } = this.report
    const status = summary.failed > 0 ? '❌ FAIL' : summary.warnings > 0 ? '⚠️ WARNING' : '✅ PASS'

    console.log('=' * 50)
    console.log('📊 PR品質レポート')
    console.log('=' * 50)
    console.log(`🌿 ブランチ: ${this.report.pr.branch}`)
    console.log(`📝 コミット: ${this.report.pr.commit}`)
    console.log(`👤 作成者: ${this.report.pr.author}`)
    console.log(`⏰ 実行日時: ${this.report.timestamp}`)
    console.log()
    console.log(`🎯 総合判定: ${status}`)
    console.log(`📊 品質スコア: ${summary.score}%`)
    console.log()
    console.log('📋 詳細結果:')
    console.log(`  ✅ 通過: ${summary.passed}項目`)
    console.log(`  ⚠️ 警告: ${summary.warnings}項目`)
    console.log(`  ❌ 失敗: ${summary.failed}項目`)
    console.log()

    if (summary.failed > 0) {
      console.log('🚨 修正が必要な項目:')
      Object.entries(this.report.quality).forEach(([key, result]) => {
        if (result.status === 'FAIL') {
          console.log(`  ❌ ${key}: ${result.message}`)
        }
      })
    }

    return this.report
  }

  generateJSONReport() {
    return JSON.stringify(this.report, null, 2)
  }

  generateMarkdownReport() {
    const { summary, pr, quality } = this.report
    const status = summary.failed > 0 ? '❌ FAIL' : summary.warnings > 0 ? '⚠️ WARNING' : '✅ PASS'

    let markdown = `# PR品質レポート

## 📊 概要
- **判定**: ${status}
- **品質スコア**: ${summary.score}%
- **ブランチ**: \`${pr.branch}\`
- **コミット**: \`${pr.commit}\`
- **作成者**: ${pr.author}
- **実行日時**: ${pr.timestamp}

## 📋 結果サマリー
| 結果 | 項目数 |
|------|--------|
| ✅ 通過 | ${summary.passed} |
| ⚠️ 警告 | ${summary.warnings} |
| ❌ 失敗 | ${summary.failed} |

## 🔍 詳細結果

`

    Object.entries(quality).forEach(([key, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌'
      markdown += `### ${icon} ${key.charAt(0).toUpperCase() + key.slice(1)}
- **ステータス**: ${result.status}
- **メッセージ**: ${result.message}

`
    })

    if (summary.failed > 0) {
      markdown += `## 🚨 修正必要項目

`
      Object.entries(quality).forEach(([key, result]) => {
        if (result.status === 'FAIL') {
          markdown += `- **${key}**: ${result.message}\n`
        }
      })
    }

    return markdown
  }

  async saveReport(content) {
    if (this.options.outputFile) {
      fs.writeFileSync(this.options.outputFile, content)
      console.log(`📄 レポートを保存しました: ${this.options.outputFile}`)
    }
  }

  async run() {
    try {
      await this.runQualityChecks()
      const report = this.generateReport()

      if (this.options.format === 'json' || this.options.format === 'markdown') {
        console.log(report)
        await this.saveReport(report)
      }

      // 失敗がある場合は非ゼロ終了
      if (this.report.summary.failed > 0) {
        process.exit(1)
      }

      return this.report
    } catch (error) {
      console.error('❌ PR品質チェック実行エラー:', error.message)
      process.exit(1)
    }
  }
}

// CLI実行
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}

  // コマンドライン引数パース
  args.forEach((arg, index) => {
    if (arg === '--format' && args[index + 1]) {
      options.format = args[index + 1]
    }
    if (arg === '--output' && args[index + 1]) {
      options.outputFile = args[index + 1]
    }
    if (arg === '--verbose') {
      options.verbose = true
    }
  })

  const reporter = new PRQualityReporter(options)
  reporter.run().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { PRQualityReporter }
