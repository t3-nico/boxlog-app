#!/usr/bin/env node

/**
 * ドキュメント・コード整合性監査システム
 *
 * Dayoptの26個のドキュメントと実際のコードの整合性をチェック
 * Issue #79の実装
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI色コード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.cyan}🔍 ${msg}${colors.reset}\n`),
}

class DocsConsistencyChecker {
  constructor() {
    this.rootDir = process.cwd()
    this.docsDir = path.join(this.rootDir, 'docs')
    this.srcDir = path.join(this.rootDir, 'src')
    this.results = {
      total: 0,
      passed: 0,
      warnings: 0,
      errors: 0,
      details: [],
    }
  }

  // メイン実行
  async run() {
    log.title('Dayopt ドキュメント・コード整合性監査システム')

    console.log(`📊 監査対象:`)
    console.log(`  - ドキュメント: ${this.countMarkdownFiles()} MDファイル`)
    console.log(`  - ソースコード: ${this.countSourceFiles()} TSX/TSファイル`)
    console.log(`  - 設定ファイル: package.json, .eslint/, tailwind.config.ts など\n`)

    // 各チェック項目を実行
    await this.checkESLintDocumentation()
    await this.checkThemeSystemDocumentation()
    await this.checkPackageJsonConsistency()
    await this.checkBrokenLinks()
    await this.checkTodoConsistency()
    await this.checkMetadataCoverage()

    this.printSummary()
  }

  // ESLintドキュメントの整合性チェック
  async checkESLintDocumentation() {
    log.title('ESLint設定とドキュメントの整合性チェック')

    // ESLint設定ファイルの存在確認
    const eslintConfigPath = path.join(this.rootDir, 'eslint.config.mjs')
    const eslintDocPath = path.join(this.docsDir, 'development/ESLINT_HYBRID_APPROACH.md')

    if (fs.existsSync(eslintConfigPath)) {
      this.addResult('success', 'ESLint設定', 'eslint.config.mjs が存在')
    } else {
      this.addResult('error', 'ESLint設定', 'eslint.config.mjs が見つかりません')
    }

    if (fs.existsSync(eslintDocPath)) {
      this.addResult('success', 'ESLintドキュメント', 'ESLINT_HYBRID_APPROACH.md が存在')
    } else {
      this.addResult('warning', 'ESLintドキュメント', 'ESLINT_HYBRID_APPROACH.md が見つかりません')
    }
  }

  // Theme系ドキュメントの整合性チェック
  async checkThemeSystemDocumentation() {
    log.title('Theme Systemの整合性（デザインシステムはStorybookに移行済み）')

    const tokensDir = path.join(this.srcDir, 'styles/tokens')

    // セマンティックトークンディレクトリの確認
    if (fs.existsSync(tokensDir)) {
      const tokenFiles = fs.readdirSync(tokensDir).filter((file) => file.endsWith('.css'))
      log.info(`セマンティックトークン: ${tokenFiles.join(', ')}`)
      this.addResult('success', 'Theme System', `src/styles/tokens に ${tokenFiles.length} 個のトークンファイル`)
    } else {
      this.addResult('warning', 'Theme System', 'src/styles/tokens ディレクトリが存在しません')
    }

    // Storybookのトークンドキュメント確認
    const storybookTokensDir = path.join(this.srcDir, 'stories/tokens')
    if (fs.existsSync(storybookTokensDir)) {
      const tokenStories = fs.readdirSync(storybookTokensDir).filter((file) => file.endsWith('.stories.tsx'))
      this.addResult('success', 'Design System', `Storybook Tokens に ${tokenStories.length} 個のStory`)
    } else {
      this.addResult('warning', 'Design System', 'src/stories/tokens ディレクトリが存在しません')
    }
  }

  // package.json記載内容とドキュメントの整合性
  async checkPackageJsonConsistency() {
    log.title('package.jsonとドキュメントの整合性')

    const packagePath = path.join(this.rootDir, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    // READMEで言及されているスクリプトが存在するか
    const readmePath = path.join(this.docsDir, 'README.md')
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8')

      // スクリプト例の抽出（npm run xxx形式）
      const scriptMatches = readmeContent.match(/npm run (\w+)/g) || []
      const mentionedScripts = [...new Set(scriptMatches.map((match) => match.replace('npm run ', '')))]

      mentionedScripts.forEach((script) => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.addResult('success', 'README', `npm run ${script}: 記載済み・実装済み`)
        } else {
          this.addResult('error', 'README', `npm run ${script}: READMEで言及されているが存在しない`)
        }
      })
    }

    // 主要依存関係の確認
    const importantDeps = ['next', 'react', 'typescript', 'tailwindcss', 'eslint']
    importantDeps.forEach((dep) => {
      const inDependencies = packageJson.dependencies && packageJson.dependencies[dep]
      const inDevDependencies = packageJson.devDependencies && packageJson.devDependencies[dep]

      if (inDependencies || inDevDependencies) {
        this.addResult('success', 'Dependencies', `${dep}: インストール済み`)
      } else {
        this.addResult('warning', 'Dependencies', `${dep}: 未インストール（必要に応じて）`)
      }
    })
  }

  // 壊れたリンクのチェック
  async checkBrokenLinks() {
    log.title('Markdownファイル内リンク切れチェック')

    const markdownFiles = this.getAllMarkdownFiles()
    // アーカイブディレクトリは履歴保存用のため、リンクチェックから除外
    const activeFiles = markdownFiles.filter((f) => !f.includes('/archive/'))
    let totalLinks = 0
    let brokenLinks = 0

    log.info(`チェック対象: ${activeFiles.length}ファイル (アーカイブ除外: ${markdownFiles.length - activeFiles.length}ファイル)`)

    activeFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = path.relative(this.rootDir, filePath)

      // Markdownリンクを抽出 [text](path)
      const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []

      linkMatches.forEach((linkMatch) => {
        totalLinks++
        const urlMatch = linkMatch.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (urlMatch) {
          const linkUrl = urlMatch[2]

          // 内部リンク（相対パス）のチェック
          if (!linkUrl.startsWith('http') && !linkUrl.startsWith('mailto:') && !linkUrl.startsWith('#')) {
            const linkPath = path.resolve(path.dirname(filePath), linkUrl)
            if (!fs.existsSync(linkPath)) {
              this.addResult('error', 'リンク切れ', `${relativePath}: ${linkUrl} が見つからない`)
              brokenLinks++
            }
          }
        }
      })
    })

    log.info(`総リンク数: ${totalLinks}, 壊れたリンク: ${brokenLinks}`)
  }

  // TODO/NOTEの一貫性チェック
  async checkTodoConsistency() {
    log.title('TODO/NOTEコメントとドキュメントの整合性')

    try {
      // コード内のTODOを検索
      const todoOutput = execSync(
        'grep -r "TODO\\|FIXME\\|NOTE\\|XXX" src/ --include="*.ts" --include="*.tsx" || true',
        { encoding: 'utf8' }
      )
      const todoLines = todoOutput.split('\n').filter((line) => line.trim())

      log.info(`コード内TODO/NOTE: ${todoLines.length}件`)

      // TODO_REPORT.mdとの整合性
      const todoReportPath = path.join(this.docsDir, 'TODO_REPORT.md')
      if (fs.existsSync(todoReportPath)) {
        const reportContent = fs.readFileSync(todoReportPath, 'utf8')
        const reportTodoCount = (reportContent.match(/- \[ \]/g) || []).length

        log.info(`TODO_REPORT.mdのTODO: ${reportTodoCount}件`)

        if (Math.abs(todoLines.length - reportTodoCount) < 10) {
          this.addResult('success', 'TODO管理', 'コードとドキュメントのTODO数がほぼ一致')
        } else {
          this.addResult(
            'warning',
            'TODO管理',
            `TODO数に差異: コード${todoLines.length}件 vs ドキュメント${reportTodoCount}件`
          )
        }
      } else {
        this.addResult('warning', 'TODO管理', 'TODO_REPORT.md が見つかりません')
      }
    } catch {
      this.addResult('warning', 'TODO検索', 'TODO検索でエラーが発生しました')
    }
  }

  // メタデータカバレッジチェック
  async checkMetadataCoverage() {
    log.title('ドキュメントメタデータカバレッジ')

    const markdownFiles = this.getAllMarkdownFiles()
    const activeFiles = markdownFiles.filter((f) => !f.includes('/archive/'))

    // 特殊ファイルを除外 (CLAUDE.md, テンプレート, リリースノート, CREDITS)
    const targetFiles = activeFiles.filter((f) => {
      const basename = path.basename(f)
      return !basename.includes('CLAUDE.md') &&
             !f.includes('/session-templates/') &&
             !basename.includes('RELEASE_NOTES_') &&
             !basename.includes('CREDITS.md')
    })

    let withMetadata = 0
    targetFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8')
      if (content.includes('種類') || content.includes('最終更新')) {
        withMetadata++
      }
    })

    const coverage = ((withMetadata / targetFiles.length) * 100).toFixed(1)
    log.info(`メタデータ付きドキュメント: ${withMetadata}/${targetFiles.length} (${coverage}%)`)

    if (parseFloat(coverage) >= 80) {
      this.addResult('success', 'メタデータ', `カバレッジ ${coverage}% (目標: 80%以上)`)
    } else if (parseFloat(coverage) >= 60) {
      this.addResult('warning', 'メタデータ', `カバレッジ ${coverage}% (目標: 80%以上)`)
    } else {
      this.addResult('error', 'メタデータ', `カバレッジ ${coverage}% (目標: 80%以上)`)
    }
  }

  // ヘルパーメソッド
  countMarkdownFiles() {
    return this.getAllMarkdownFiles().length
  }

  countSourceFiles() {
    try {
      const output = execSync('find src/ -name "*.tsx" -o -name "*.ts" | wc -l', { encoding: 'utf8' })
      return parseInt(output.trim())
    } catch {
      return 0
    }
  }

  getAllMarkdownFiles() {
    const files = []
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return
      const items = fs.readdirSync(dir)
      items.forEach((item) => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (item.endsWith('.md')) {
          files.push(fullPath)
        }
      })
    }
    walkDir(this.docsDir)
    return files
  }

  addResult(type, category, message) {
    this.results.details.push({ type, category, message })
    this.results.total++

    switch (type) {
      case 'success':
        this.results.passed++
        log.success(`${category}: ${message}`)
        break
      case 'warning':
        this.results.warnings++
        log.warning(`${category}: ${message}`)
        break
      case 'error':
        this.results.errors++
        log.error(`${category}: ${message}`)
        break
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log(`${colors.bold}${colors.cyan}📊 整合性監査結果サマリー${colors.reset}`)
    console.log('='.repeat(60))

    console.log(`${colors.green}✅ 成功: ${this.results.passed}/${this.results.total}${colors.reset}`)
    console.log(`${colors.yellow}⚠️  警告: ${this.results.warnings}/${this.results.total}${colors.reset}`)
    console.log(`${colors.red}❌ エラー: ${this.results.errors}/${this.results.total}${colors.reset}`)

    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1)
    console.log(`\n📈 整合性スコア: ${successRate}%`)

    if (this.results.errors > 0) {
      console.log(`\n${colors.red}${colors.bold}🚨 修正が必要な問題があります${colors.reset}`)
    } else if (this.results.warnings > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  改善の余地があります${colors.reset}`)
    } else {
      console.log(`\n${colors.green}${colors.bold}🎉 全てのチェックが通過しました！${colors.reset}`)
    }

    console.log('\n💡 今後の改善提案:')
    if (this.results.errors > 0) console.log('  - エラー項目の修正')
    if (this.results.warnings > 5) console.log('  - ドキュメント更新の自動化検討')
    console.log('  - 定期的な整合性チェックの自動実行')
    console.log('  - CI/CDパイプラインへの統合\n')
  }
}

// メイン実行
if (require.main === module) {
  const checker = new DocsConsistencyChecker()
  checker.run().catch(console.error)
}

module.exports = { DocsConsistencyChecker }
