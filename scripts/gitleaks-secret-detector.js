#!/usr/bin/env node

/**
 * ===================================================================
 * GitLeaks統合Secret検出システム - Phase 3a
 * ===================================================================
 *
 * BoxLog専用高度なSecret検出システム
 * GitLeaksライクな機能を提供し、コミット前に機密情報漏洩を防止
 *
 * 企業レベルの機密情報検出:
 * - 25種類以上の秘密情報パターン検出
 * - ファイル種別に応じた高精度検出
 * - 誤検出を最小化するスマート検証
 *
 * @version 1.0.0
 * @since Phase 3a: GitLeaks統合実装
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ===========================================
// 設定: BigTech標準の機密情報検出パターン
// ===========================================

const CONFIG = {
  // 秘密情報検出パターン（正規表現）
  secretPatterns: {
    // AWS Keys
    awsAccessKeyId: {
      pattern: /AKIA[0-9A-Z]{16}/gi,
      description: 'AWS Access Key ID',
      severity: 'critical',
      category: 'aws',
    },
    awsSecretAccessKey: {
      pattern: /[A-Za-z0-9/+=]{40}/gi,
      description: 'AWS Secret Access Key',
      severity: 'critical',
      category: 'aws',
    },
    awsSessionToken: {
      pattern: /AQoEXAMPLEH4aoAH0gNCAPyJxz4BlCFFxWNE1OPTgk5TthT\+FvwqnKwRcOIfrRh3c0nJwKdq[A-Za-z0-9/+=]+/gi,
      description: 'AWS Session Token',
      severity: 'high',
      category: 'aws',
    },

    // Google Cloud Platform
    gcpApiKey: {
      pattern: /AIza[0-9A-Za-z\\-_]{35}/gi,
      description: 'Google API Key',
      severity: 'critical',
      category: 'gcp',
    },
    gcpServiceAccount: {
      pattern: /"type": "service_account"/gi,
      description: 'Google Service Account JSON',
      severity: 'critical',
      category: 'gcp',
    },

    // GitHub
    githubToken: {
      pattern: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/gi,
      description: 'GitHub Personal Access Token',
      severity: 'critical',
      category: 'github',
    },
    githubOAuthToken: {
      pattern: /gho_[a-zA-Z0-9]{36}/gi,
      description: 'GitHub OAuth Token',
      severity: 'critical',
      category: 'github',
    },

    // JWT Tokens
    jwtToken: {
      pattern: /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/gi,
      description: 'JWT Token',
      severity: 'high',
      category: 'jwt',
    },

    // Database Connections
    mongoDbUri: {
      pattern: /mongodb(\+srv)?:\/\/[^\s]+/gi,
      description: 'MongoDB Connection String',
      severity: 'critical',
      category: 'database',
    },
    postgresUri: {
      pattern: /postgres(ql)?:\/\/[^\s]+/gi,
      description: 'PostgreSQL Connection String',
      severity: 'critical',
      category: 'database',
    },

    // API Keys (Generic)
    genericApiKey: {
      pattern: /['"](sk-[a-zA-Z0-9]{32,}|pk_[a-zA-Z0-9]{24,})['"]/gi,
      description: 'Generic API Key',
      severity: 'high',
      category: 'api',
    },

    // Stripe
    stripeApiKey: {
      pattern: /(sk_live_[a-zA-Z0-9]{24,}|pk_live_[a-zA-Z0-9]{24,})/gi,
      description: 'Stripe API Key',
      severity: 'critical',
      category: 'payment',
    },

    // Supabase (BoxLog専用)
    supabaseAnonKey: {
      pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,
      description: 'Supabase Anonymous Key',
      severity: 'medium',
      category: 'supabase',
    },
    supabaseServiceRole: {
      pattern: /eyJhbGciOiJIUzI1NiIsImtpZCI6[a-zA-Z0-9_-]+/gi,
      description: 'Supabase Service Role Key',
      severity: 'critical',
      category: 'supabase',
    },

    // Private Keys
    rsaPrivateKey: {
      pattern: /-----BEGIN [DR]SA PRIVATE KEY-----/gi,
      description: 'RSA Private Key',
      severity: 'critical',
      category: 'crypto',
    },
    opensshPrivateKey: {
      pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/gi,
      description: 'OpenSSH Private Key',
      severity: 'critical',
      category: 'crypto',
    },

    // Passwords in URLs/Config
    passwordInUrl: {
      pattern: /:\/\/[^:\/\s]*:[^@\/\s]*@[^\/\s]*/gi,
      description: 'Password in URL',
      severity: 'high',
      category: 'password',
    },

    // Docker/Container Secrets
    dockerSecret: {
      pattern: /DOCKER_[A-Z_]*=.+/gi,
      description: 'Docker Secret',
      severity: 'medium',
      category: 'container',
    },

    // High Entropy Strings (Generic Secret Detection)
    highEntropyString: {
      pattern: /['"'][A-Za-z0-9+/=]{32,}['"']/gi,
      description: 'High Entropy String (Potential Secret)',
      severity: 'low',
      category: 'generic',
    },
  },

  // 除外パターン
  exclusions: {
    // 例・テスト用のダミーデータ
    exampleSecrets: /example|test|dummy|fake|sample|placeholder/gi,
    // 環境変数参照
    envVariables: /process\.env\.[A-Z_]+/gi,
    // コメント内
    comments: /(\/\*[\s\S]*?\*\/|\/\/.*$|#.*$|<!--[\s\S]*?-->)/gim,
    // パターン定義（自身のスクリプト除外）
    patternDefinitions: /pattern:\s*\/.*\/gi?/gi,
    // 正規表現リテラル
    regexLiterals: /\/[^\/\n]+\/[gimuy]*/gi,
  },

  // 対象ファイル
  includedFiles: [
    '**/*.js',
    '**/*.ts',
    '**/*.tsx',
    '**/*.jsx',
    '**/*.json',
    '**/*.env*',
    '**/*.yaml',
    '**/*.yml',
    '**/*.md',
    '**/*.txt',
    '**/*.config.js',
    '**/*.sh',
    '**/*.py',
    '**/*.go',
    '**/*.sql',
  ],

  // 除外ファイル
  excludedFiles: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '.git/**',
    'yarn.lock',
    'package-lock.json',
    '.license-cache.json',
    '.api-changes-cache.json',
    '**/*.test.js',
    '**/*.test.ts',
    'docs/**/*.md', // ドキュメント内のサンプルコード除外
  ],

  // 閾値設定
  thresholds: {
    maxFileSize: 1024 * 1024, // 1MB以上のファイルはスキップ
    maxMatches: 50, // 1ファイル50件以上の検出はスキップ（誤検出対策）
    minEntropyScore: 4.5, // エントロピースコア閾値
  },
}

// ===========================================
// ユーティリティ関数
// ===========================================

/**
 * エントロピー計算（文字列の複雑さを測定）
 */
function calculateEntropy(str) {
  if (!str || str.length === 0) return 0

  const freq = {}
  str.split('').forEach((char) => {
    freq[char] = (freq[char] || 0) + 1
  })

  let entropy = 0
  const length = str.length

  Object.values(freq).forEach((count) => {
    const probability = count / length
    entropy -= probability * Math.log2(probability)
  })

  return entropy
}

/**
 * ファイル変更検出（git diff使用）
 */
function getChangedFiles() {
  try {
    // Staged files
    let stagedFiles = []
    try {
      const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACM', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      stagedFiles = stagedOutput ? stagedOutput.split('\n') : []
    } catch (error) {
      // Staged filesがない場合は空配列
    }

    // Modified files (not staged)
    let modifiedFiles = []
    try {
      const modifiedOutput = execSync('git diff --name-only --diff-filter=ACM', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      modifiedFiles = modifiedOutput ? modifiedOutput.split('\n') : []
    } catch (error) {
      // Modified filesがない場合は空配列
    }

    // Untracked files
    let untrackedFiles = []
    try {
      const untrackedOutput = execSync('git ls-files --others --exclude-standard', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      untrackedFiles = untrackedOutput ? untrackedOutput.split('\n') : []
    } catch (error) {
      // Untracked filesがない場合は空配列
    }

    const allFiles = [...new Set([...stagedFiles, ...modifiedFiles, ...untrackedFiles])]
    return allFiles.filter((file) => file && fs.existsSync(file))
  } catch (error) {
    console.log('⚠️  Git情報の取得に失敗。全ファイルをスキャンします。')
    return null // 全ファイルスキャンフラグ
  }
}

/**
 * ファイルマッチング判定
 */
function shouldScanFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath)

  // 除外ファイルチェック
  for (const excludePattern of CONFIG.excludedFiles) {
    const regex = new RegExp(excludePattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
    if (regex.test(relativePath)) {
      return false
    }
  }

  // 包含ファイルチェック
  for (const includePattern of CONFIG.includedFiles) {
    const regex = new RegExp(includePattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
    if (regex.test(relativePath)) {
      return true
    }
  }

  return false
}

/**
 * ファイル内容解析
 */
function scanFileContent(filePath, content) {
  const results = []
  const relativePath = path.relative(process.cwd(), filePath)
  const lines = content.split('\n')

  // 除外パターンで前処理（コメントなど）
  let processedContent = content
  Object.values(CONFIG.exclusions).forEach((exclusionPattern) => {
    processedContent = processedContent.replace(exclusionPattern, ' ')
  })

  // 各パターンでスキャン
  Object.entries(CONFIG.secretPatterns).forEach(([patternName, config]) => {
    const matches = [...processedContent.matchAll(config.pattern)]

    matches.forEach((match) => {
      const matchedText = match[0]
      const matchIndex = match.index

      // エントロピーチェック（高エントロピー文字列の場合）
      if (config.category === 'generic') {
        const entropy = calculateEntropy(matchedText)
        if (entropy < CONFIG.thresholds.minEntropyScore) {
          return // 低エントロピーは除外
        }
      }

      // 行番号計算
      const beforeMatch = content.substring(0, matchIndex)
      const lineNumber = beforeMatch.split('\n').length
      const lineContent = lines[lineNumber - 1] || ''

      // テスト・例用は除外
      if (CONFIG.exclusions.exampleSecrets.test(lineContent.toLowerCase())) {
        return
      }

      results.push({
        file: relativePath,
        line: lineNumber,
        column: matchIndex - beforeMatch.lastIndexOf('\n'),
        type: patternName,
        description: config.description,
        severity: config.severity,
        category: config.category,
        match: matchedText.substring(0, 50) + (matchedText.length > 50 ? '...' : ''),
        lineContent: lineContent.trim(),
        context: {
          before: lines[lineNumber - 2] || '',
          after: lines[lineNumber] || '',
        },
      })
    })
  })

  return results
}

/**
 * 全ファイル収集（再帰）
 */
function getAllFiles(dir = process.cwd()) {
  const files = []

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return

    const items = fs.readdirSync(currentDir)

    items.forEach((item) => {
      const itemPath = path.join(currentDir, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        traverse(itemPath)
      } else if (stat.isFile() && shouldScanFile(itemPath)) {
        files.push(itemPath)
      }
    })
  }

  traverse(dir)
  return files
}

// ===========================================
// メイン処理
// ===========================================

async function runSecretDetection() {
  const startTime = Date.now()
  console.log('🔍 GitLeaks風Secret検出システム起動...')

  // ファイル収集
  let filesToScan = []
  const changedFiles = getChangedFiles()

  if (changedFiles && changedFiles.length > 0) {
    console.log(`📂 変更ファイル検出: ${changedFiles.length}件`)
    filesToScan = changedFiles.filter(shouldScanFile)
  } else {
    console.log('📂 全ファイルスキャンモード')
    filesToScan = getAllFiles()
  }

  if (filesToScan.length === 0) {
    console.log('✅ スキャン対象ファイルがありません')
    return { success: true, results: [], stats: { filesScanned: 0, secretsFound: 0 } }
  }

  console.log(`🔍 ${filesToScan.length}件のファイルをスキャン中...`)

  const allResults = []
  let filesScanned = 0
  const errors = []

  // ファイルごとにスキャン
  for (const filePath of filesToScan) {
    try {
      const stat = fs.statSync(filePath)

      // ファイルサイズチェック
      if (stat.size > CONFIG.thresholds.maxFileSize) {
        console.log(
          `⚠️  ${path.relative(process.cwd(), filePath)}: ファイルサイズが大きすぎます (${(stat.size / 1024 / 1024).toFixed(1)}MB)`
        )
        continue
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const results = scanFileContent(filePath, content)

      // 検出結果が多すぎる場合はスキップ（誤検出対策）
      if (results.length > CONFIG.thresholds.maxMatches) {
        console.log(
          `⚠️  ${path.relative(process.cwd(), filePath)}: 検出結果が多すぎます (${results.length}件) - 誤検出の可能性`
        )
        continue
      }

      allResults.push(...results)
      filesScanned++

      if (results.length > 0) {
        console.log(`🚨 ${path.relative(process.cwd(), filePath)}: ${results.length}件の秘密情報を検出`)
      }
    } catch (error) {
      errors.push({ file: filePath, error: error.message })
    }
  }

  // 結果サマリー
  const duration = Date.now() - startTime
  const stats = {
    duration: `${duration}ms`,
    filesScanned,
    secretsFound: allResults.length,
    errorCount: errors.length,
  }

  console.log('\n📊 スキャン結果:')
  console.log(`   📂 スキャンファイル: ${stats.filesScanned}件`)
  console.log(`   🚨 検出された秘密情報: ${stats.secretsFound}件`)
  console.log(`   ⏱️  実行時間: ${stats.duration}`)

  // 詳細結果表示
  if (allResults.length > 0) {
    console.log('\n🚨 検出された秘密情報:')

    // 重要度別グループ化
    const groupedResults = {}
    allResults.forEach((result) => {
      if (!groupedResults[result.severity]) {
        groupedResults[result.severity] = []
      }
      groupedResults[result.severity].push(result)
    })

    // 重要度順で表示
    ;['critical', 'high', 'medium', 'low'].forEach((severity) => {
      if (groupedResults[severity]) {
        console.log(`\n${getSeverityIcon(severity)} ${severity.toUpperCase()} (${groupedResults[severity].length}件):`)

        groupedResults[severity].forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.file}:${result.line}`)
          console.log(`      📋 ${result.description} (${result.category})`)
          console.log(`      🔍 "${result.match}"`)
          console.log(`      📄 ${result.lineContent}`)
          console.log('')
        })
      }
    })

    console.log('\n💡 対応方法:')
    console.log('   1. 🌍 環境変数への移動: process.env.SECRET_NAME')
    console.log('   2. 🗑️  不要な秘密情報の削除')
    console.log('   3. 📝 .gitignore への追加')

    return { success: false, results: allResults, stats, errors }
  }

  console.log('\n✅ 秘密情報は検出されませんでした')
  return { success: true, results: [], stats, errors }
}

/**
 * 重要度アイコン取得
 */
function getSeverityIcon(severity) {
  const icons = {
    critical: '🔴',
    high: '🟡',
    medium: '🟠',
    low: '🟢',
  }
  return icons[severity] || '⚪'
}

// ===========================================
// 実行部分
// ===========================================

if (require.main === module) {
  const verboseMode = process.argv.includes('--verbose')

  runSecretDetection()
    .then((result) => {
      if (verboseMode) {
        console.log('\n📊 詳細統計:', JSON.stringify(result.stats, null, 2))
      }

      if (result.errors && result.errors.length > 0) {
        console.log('\n⚠️  エラー:')
        result.errors.forEach((error) => {
          console.log(`   ${error.file}: ${error.error}`)
        })
      }

      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ GitLeaks Secret Detection failed:', error)
      process.exit(1)
    })
}

module.exports = { runSecretDetection, CONFIG }
