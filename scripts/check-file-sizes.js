#!/usr/bin/env node

/**
 * File Size Checker for Pre-commit Hook
 *
 * Prevents committing files larger than specified threshold
 * Compatible with BoxLog's BigTech-standard pre-commit system
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  // Default file size limit: 1MB
  maxFileSize: 1024 * 1024, // 1MB in bytes

  // Files to always skip (regardless of size)
  skipPatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    'out/',
    'coverage/',
    '.turbo/',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '*.min.js',
    '*.min.css',
    '.git/',
    '.vscode/',
    '.idea/',
  ],

  // Extensions to allow larger files (with warning)
  allowedLargeExtensions: ['.pdf', '.mp4', '.mov', '.zip', '.tar.gz', '.dmg'],

  // Warning threshold (smaller than max, but show warning)
  warningSize: 512 * 1024, // 512KB
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)}${units[unitIndex]}`
}

function shouldSkipFile(filePath) {
  return CONFIG.skipPatterns.some((pattern) => {
    if (pattern.endsWith('/')) {
      return filePath.includes(pattern)
    }
    return filePath.includes(pattern) || filePath.endsWith(pattern.substring(1))
  })
}

function isAllowedLargeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return CONFIG.allowedLargeExtensions.includes(ext)
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    return output
      .trim()
      .split('\n')
      .filter((file) => file.length > 0)
  } catch (error) {
    console.error('❌ Failed to get staged files:', error.message)
    process.exit(1)
  }
}

function checkFileSize(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null // File might be deleted
    }

    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    console.warn(`⚠️  Could not check size of ${filePath}: ${error.message}`)
    return null
  }
}

function main() {
  console.log('🔍 Running pre-commit checks...')
  console.log('📏 Checking file sizes...')

  const stagedFiles = getStagedFiles()
  const violations = []
  const warnings = []
  let checkedFiles = 0
  let skippedFiles = 0

  for (const filePath of stagedFiles) {
    // Skip certain file patterns
    if (shouldSkipFile(filePath)) {
      console.log(`⏭️  Skipping ${filePath} (dependency/generated file)`)
      skippedFiles++
      continue
    }

    const fileSize = checkFileSize(filePath)
    if (fileSize === null) continue

    checkedFiles++

    // Check if file exceeds maximum size
    if (fileSize > CONFIG.maxFileSize) {
      if (isAllowedLargeFile(filePath)) {
        warnings.push({
          file: filePath,
          size: fileSize,
          formatted: formatFileSize(fileSize),
          type: 'large-allowed',
        })
      } else {
        violations.push({
          file: filePath,
          size: fileSize,
          formatted: formatFileSize(fileSize),
          limit: formatFileSize(CONFIG.maxFileSize),
        })
      }
    }
    // Check if file exceeds warning threshold
    else if (fileSize > CONFIG.warningSize) {
      warnings.push({
        file: filePath,
        size: fileSize,
        formatted: formatFileSize(fileSize),
        type: 'warning',
      })
    }
  }

  // Report results
  if (violations.length === 0 && warnings.length === 0) {
    console.log('✅ All files are within size limit')
  }

  // Show warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  File size warnings:')
    warnings.forEach((warning) => {
      if (warning.type === 'large-allowed') {
        console.log(`   📄 ${warning.file} (${warning.formatted}) - Large file allowed by extension`)
      } else {
        console.log(`   📄 ${warning.file} (${warning.formatted}) - Consider optimization`)
      }
    })
  }

  // Show violations (blocking)
  if (violations.length > 0) {
    console.error('\n❌ Files exceed size limit:')
    violations.forEach((violation) => {
      console.error(`   📄 ${violation.file} (${violation.formatted}) exceeds ${violation.limit} limit`)
    })

    console.error(`\n💡 Solutions:`)
    console.error(`   • Move large files to appropriate storage (S3, CDN, etc.)`)
    console.error(`   • Add to .gitignore if it's a build artifact`)
    console.error(`   • Use Git LFS for large binary files`)
    console.error(`   • Compress images/assets before committing`)
    console.error(`   • Split large files into smaller chunks`)

    process.exit(1)
  }

  if (checkedFiles > 0) {
    console.log(`📊 Checked ${checkedFiles} files, skipped ${skippedFiles} files`)
  }
}

// Run the script
if (require.main === module) {
  main()
}
