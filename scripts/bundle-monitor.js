#!/usr/bin/env node
/**
 * Bundle Size Monitor
 *
 * Bundle sizeの変化を監視し、予算を超過した場合に警告を出すスクリプト
 */

const fs = require('fs')
const path = require('path')

// Bundle予算設定を読み込み
const BUDGET_FILE = path.join(process.cwd(), 'config/budget.json')
const _BUILD_MANIFEST = path.join(process.cwd(), '.next/build-manifest.json')
const _NEXT_MANIFEST = path.join(process.cwd(), '.next/static/chunks/_buildManifest.js')

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function loadBudget() {
  try {
    if (!fs.existsSync(BUDGET_FILE)) {
      log('❌ config/budget.json not found. Run "npm run bundle:check" first.', 'red')
      process.exit(1)
    }
    return JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
  } catch (error) {
    log(`❌ Error loading config/budget.json: ${error.message}`, 'red')
    process.exit(1)
  }
}

function getBundleSize() {
  const sizes = {}

  try {
    // Static chunk sizes
    const staticDir = path.join(process.cwd(), '.next/static/chunks')
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir)

      files.forEach((file) => {
        if (file.endsWith('.js')) {
          const filePath = path.join(staticDir, file)
          const stats = fs.statSync(filePath)
          sizes[`chunks/${file}`] = stats.size
        }
      })
    }

    // CSS sizes
    const cssDir = path.join(process.cwd(), '.next/static/css')
    if (fs.existsSync(cssDir)) {
      const files = fs.readdirSync(cssDir)

      files.forEach((file) => {
        if (file.endsWith('.css')) {
          const filePath = path.join(cssDir, file)
          const stats = fs.statSync(filePath)
          sizes[`css/${file}`] = stats.size
        }
      })
    }

    // Production build info
    const buildDir = path.join(process.cwd(), '.next/static')
    if (fs.existsSync(buildDir)) {
      // Find build folder (has dynamic name)
      const buildFolders = fs.readdirSync(buildDir).filter((folder) => {
        return (
          folder !== 'chunks' &&
          folder !== 'css' &&
          folder !== 'media' &&
          folder !== 'webpack' &&
          folder !== 'development' &&
          fs.statSync(path.join(buildDir, folder)).isDirectory()
        )
      })

      buildFolders.forEach((buildFolder) => {
        const buildPath = path.join(buildDir, buildFolder)
        try {
          const files = fs.readdirSync(buildPath)
          files.forEach((file) => {
            if (file.endsWith('.js')) {
              const filePath = path.join(buildPath, file)
              const stats = fs.statSync(filePath)
              sizes[`build/${file}`] = stats.size
            }
          })
        } catch (err) {
          // Ignore directory read errors
        }
      })
    }
  } catch (error) {
    log(`⚠️  Warning: Could not read build files: ${error.message}`, 'yellow')
  }

  // Debug logging (remove in production)
  if (process.env.DEBUG) {
    log(`\n🔍 Debug: Found ${Object.keys(sizes).length} files`, 'blue')
  }

  return sizes
}

function checkBudget() {
  log('🔍 Bundle Size Monitor', 'blue')
  log('========================', 'blue')

  const budget = loadBudget()
  const currentSizes = getBundleSize()

  let hasViolations = false
  let hasWarnings = false

  // 各予算項目をチェック
  budget.forEach((budgetItem) => {
    const { path: pathPattern, threshold, warning } = budgetItem

    log(`\n📊 Checking: ${pathPattern}`, 'bold')

    const thresholdBytes = parseSize(threshold)
    const warningBytes = parseSize(warning)

    // パスパターンにマッチするファイルを検索
    const matchingFiles = Object.keys(currentSizes).filter((filePath) => {
      const matches = matchesPattern(filePath, pathPattern)
      if (process.env.DEBUG && matches) {
        log(`  🎯 Pattern "${pathPattern}" matches file: ${filePath}`, 'blue')
      }
      return matches
    })

    if (matchingFiles.length === 0) {
      log(`  ✅ No files found for pattern ${pathPattern}`, 'green')
      return
    }

    matchingFiles.forEach((filePath) => {
      const fileSize = currentSizes[filePath]
      const formattedSize = formatBytes(fileSize)
      const formattedThreshold = formatBytes(thresholdBytes)
      const formattedWarning = formatBytes(warningBytes)

      if (fileSize > thresholdBytes) {
        log(`  ❌ ${filePath}: ${formattedSize} > ${formattedThreshold} (EXCEEDED)`, 'red')
        hasViolations = true
      } else if (fileSize > warningBytes) {
        log(`  ⚠️  ${filePath}: ${formattedSize} > ${formattedWarning} (WARNING)`, 'yellow')
        hasWarnings = true
      } else {
        log(`  ✅ ${filePath}: ${formattedSize} (OK)`, 'green')
      }
    })
  })

  // サマリー表示
  log('\n📋 Summary', 'blue')
  log('============', 'blue')

  if (hasViolations) {
    log('❌ Bundle size budget exceeded!', 'red')
    log('Consider:', 'yellow')
    log('  - Code splitting for large components', 'yellow')
    log('  - Tree shaking optimization', 'yellow')
    log('  - Removing unused dependencies', 'yellow')
    process.exit(1)
  } else if (hasWarnings) {
    log('⚠️  Bundle size warnings detected', 'yellow')
    log('Monitor these files for potential optimization', 'yellow')
  } else {
    log('✅ All bundle sizes within budget!', 'green')
  }
}

function parseSize(sizeStr) {
  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  }

  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([A-Z]+)$/i)
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`)
  }

  const [, size, unit] = match
  const unitMultiplier = units[unit.toUpperCase()]

  if (!unitMultiplier) {
    throw new Error(`Unknown unit: ${unit}`)
  }

  return Math.round(parseFloat(size) * unitMultiplier)
}

function matchesPattern(filePath, pattern) {
  // 簡易的なglob-likeパターンマッチング
  // . を \. に変換してからワイルドカードを処理
  const escapedPattern = pattern.replace(/\./g, '\\.')

  const regex = escapedPattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
    .replace(/\[([0-9]+-[0-9]+)\]/g, '[0-9]') // [0-9] range
    .replace(/\[([^\]]+)\]/g, '[$1]') // 他の文字クラス

  return new RegExp(`^${regex}$`).test(filePath)
}

// 実行
checkBudget()
