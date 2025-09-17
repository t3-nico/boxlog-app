#!/usr/bin/env node

/**
 * BoxLog Bundle Size Monitor
 *
 * バンドルサイズの監視と制限チェックを行うスクリプト
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 📏 バンドルサイズ制限設定
const BUNDLE_LIMITS = {
  // JavaScriptバンドル制限
  maxTotalJS: 800 * 1024, // 800KB - メインJSバンドル合計
  maxInitialJS: 500 * 1024, // 500KB - 初期読み込みJS
  maxChunkJS: 250 * 1024, // 250KB - 個別チャンク

  // CSSバンドル制限
  maxTotalCSS: 150 * 1024, // 150KB - CSS合計
  maxInitialCSS: 100 * 1024, // 100KB - 初期読み込みCSS

  // 総合制限
  maxTotal: 1000 * 1024, // 1MB - 全バンドル合計

  // 警告レベル（80%で警告）
  warningThreshold: 0.8,
}

// 🎨 出力用カラー
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

/**
 * サイズを人間が読みやすい形式に変換
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * パーセンテージを計算
 */
function getPercentage(current, max) {
  return ((current / max) * 100).toFixed(1)
}

/**
 * サイズチェック結果の表示
 */
function displaySizeCheck(name, current, limit, _isError = false) {
  const percentage = getPercentage(current, limit)
  const isWarning = current > limit * BUNDLE_LIMITS.warningThreshold
  const isOverLimit = current > limit

  let color = colors.green
  let status = '✅'

  if (isOverLimit) {
    color = colors.red
    status = '❌'
  } else if (isWarning) {
    color = colors.yellow
    status = '⚠️'
  }

  console.log(
    `${status} ${colors.bold}${name}${colors.reset}: ` +
      `${color}${formatSize(current)}${colors.reset} / ${formatSize(limit)} ` +
      `(${color}${percentage}%${colors.reset})`
  )

  return isOverLimit
}

/**
 * 初期読み込みJSファイルの処理
 */
function processInitialJSFiles(buildManifest, stats) {
  const initialFiles = buildManifest.pages['/'] || []
  for (const file of initialFiles) {
    if (file.endsWith('.js')) {
      const filePath = path.join('.next', 'static', file)
      if (fs.existsSync(filePath)) {
        const { size } = fs.statSync(filePath)
        stats.initialJS += size
        stats.totalJS += size
      }
    }
  }
  return initialFiles
}

/**
 * 全チャンクファイルの処理
 */
function processChunkFiles(buildManifest, initialFiles, stats) {
  for (const [page, files] of Object.entries(buildManifest.pages)) {
    for (const file of files) {
      if (file.endsWith('.js') && !initialFiles.includes(file)) {
        const filePath = path.join('.next', 'static', file)
        if (fs.existsSync(filePath)) {
          const { size } = fs.statSync(filePath)
          stats.totalJS += size
          stats.chunks.push({ file, size, page })
        }
      }
    }
  }
}

/**
 * CSSファイルの処理
 */
function processCSSFiles(stats) {
  const staticDir = path.join('.next', 'static', 'css')
  if (fs.existsSync(staticDir)) {
    const cssFiles = fs.readdirSync(staticDir).filter((f) => f.endsWith('.css'))
    for (const file of cssFiles) {
      const filePath = path.join(staticDir, file)
      const { size } = fs.statSync(filePath)
      stats.totalCSS += size

      // app.css や globals.css を初期読み込みとして扱う
      if (file.includes('app') || file.includes('global')) {
        stats.initialCSS += size
      }

      stats.cssFiles.push({ file, size })
    }
  }
}

/**
 * Next.jsビルド統計の解析
 */
function analyzeBuildStats() {
  const buildManifestPath = path.join('.next', 'build-manifest.json')

  const stats = {
    totalJS: 0,
    initialJS: 0,
    totalCSS: 0,
    initialCSS: 0,
    chunks: [],
    cssFiles: [],
  }

  try {
    // Build manifestの読み込み
    if (fs.existsSync(buildManifestPath)) {
      const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'))

      // 初期読み込みJSファイル
      const initialFiles = processInitialJSFiles(buildManifest, stats)

      // 全チャンクファイル
      processChunkFiles(buildManifest, initialFiles, stats)
    }

    // CSS ファイルの解析
    processCSSFiles(stats)
  } catch (error) {
    console.warn(`${colors.yellow}⚠️ ビルド統計の読み込みに失敗しました: ${error.message}${colors.reset}`)
  }

  return stats
}

/**
 * 大きなチャンクの詳細表示
 */
function displayLargeChunks(chunks, cssFiles) {
  const largeJSChunks = chunks
    .filter((chunk) => chunk.size > BUNDLE_LIMITS.maxChunkJS * 0.5)
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)

  const largeCSSFiles = cssFiles
    .filter((css) => css.size > 50 * 1024) // 50KB以上
    .sort((a, b) => b.size - a.size)

  if (largeJSChunks.length > 0) {
    console.log(`\n${colors.blue}📦 大きなJavaScriptチャンク:${colors.reset}`)
    for (const chunk of largeJSChunks) {
      const isOverLimit = chunk.size > BUNDLE_LIMITS.maxChunkJS
      const color = isOverLimit ? colors.red : colors.yellow
      console.log(`  ${color}${formatSize(chunk.size)}${colors.reset} - ${chunk.file}`)
    }
  }

  if (largeCSSFiles.length > 0) {
    console.log(`\n${colors.blue}🎨 大きなCSSファイル:${colors.reset}`)
    for (const css of largeCSSFiles) {
      console.log(`  ${colors.cyan}${formatSize(css.size)}${colors.reset} - ${css.file}`)
    }
  }
}

/**
 * バンドル最適化の提案
 */
function suggestOptimizations(stats) {
  const suggestions = []

  if (stats.initialJS > BUNDLE_LIMITS.maxInitialJS * 0.8) {
    suggestions.push('🔧 動的インポート (React.lazy) でコードスプリッティングを検討')
  }

  if (stats.totalCSS > BUNDLE_LIMITS.maxTotalCSS * 0.8) {
    suggestions.push('🎨 未使用CSSの削除、CSS Purge設定の見直し')
  }

  const largeChunks = stats.chunks.filter((c) => c.size > BUNDLE_LIMITS.maxChunkJS)
  if (largeChunks.length > 0) {
    suggestions.push('📦 大きなチャンクのリファクタリング、外部ライブラリの見直し')
  }

  if (stats.totalJS > BUNDLE_LIMITS.maxTotalJS * 0.8) {
    suggestions.push('📊 Tree-shaking設定の確認、重複モジュールの排除')
  }

  if (suggestions.length > 0) {
    console.log(`\n${colors.magenta}💡 最適化の提案:${colors.reset}`)
    for (const suggestion of suggestions) {
      console.log(`  ${suggestion}`)
    }
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log(`${colors.bold}${colors.blue}🔍 BoxLog Bundle Size Monitor${colors.reset}\n`)

  let hasErrors = false

  try {
    // 1. ビルド実行
    console.log(`${colors.cyan}📦 Next.jsビルドを実行中...${colors.reset}`)
    execSync('ANALYZE=false npm run build:fallback', {
      stdio: process.env.VERBOSE ? 'inherit' : 'pipe',
      cwd: process.cwd(),
    })
    console.log(`${colors.green}✅ ビルド完了${colors.reset}\n`)

    // 2. バンドル統計の解析
    console.log(`${colors.cyan}📊 バンドル統計を解析中...${colors.reset}`)
    const stats = analyzeBuildStats()

    // 3. サイズチェック
    console.log(`\n${colors.bold}📏 バンドルサイズチェック:${colors.reset}`)

    const totalSize = stats.totalJS + stats.totalCSS

    hasErrors |= displaySizeCheck('総合サイズ', totalSize, BUNDLE_LIMITS.maxTotal)
    hasErrors |= displaySizeCheck('JavaScript合計', stats.totalJS, BUNDLE_LIMITS.maxTotalJS)
    hasErrors |= displaySizeCheck('初期読み込みJS', stats.initialJS, BUNDLE_LIMITS.maxInitialJS)
    hasErrors |= displaySizeCheck('CSS合計', stats.totalCSS, BUNDLE_LIMITS.maxTotalCSS)
    hasErrors |= displaySizeCheck('初期読み込みCSS', stats.initialCSS, BUNDLE_LIMITS.maxInitialCSS)

    // 4. 詳細情報の表示
    displayLargeChunks(stats.chunks, stats.cssFiles)

    // 5. 最適化提案
    suggestOptimizations(stats)

    // 6. 結果表示
    if (hasErrors) {
      console.log(`\n${colors.red}${colors.bold}❌ バンドルサイズが制限を超えています！${colors.reset}`)
      console.log(`${colors.yellow}詳細な分析には 'ANALYZE=true npm run build' を実行してください${colors.reset}`)
      process.exit(1)
    } else {
      console.log(`\n${colors.green}${colors.bold}✅ バンドルサイズチェック完了！${colors.reset}`)
    }
  } catch (error) {
    console.error(`${colors.red}❌ バンドルチェックでエラーが発生しました:${colors.reset}`)
    console.error(error.message)
    process.exit(1)
  }
}

// CLI引数の処理
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}BoxLog Bundle Size Monitor${colors.reset}

使用方法:
  node scripts/bundle-check.js [オプション]

オプション:
  --help, -h     このヘルプを表示
  --verbose, -v  詳細出力

環境変数:
  VERBOSE=true   詳細な出力を有効化
  ANALYZE=true   bundle-analyzerを有効化
    `)
    process.exit(0)
  }

  if (args.includes('--verbose') || args.includes('-v')) {
    process.env.VERBOSE = 'true'
  }

  main().catch(console.error)
}

module.exports = {
  analyzeBuildStats,
  formatSize,
  BUNDLE_LIMITS,
}
