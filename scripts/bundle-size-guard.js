#!/usr/bin/env node

/**
 * Bundle Size Guard for Pre-commit Hook
 *
 * Lightweight bundle size regression detection for pre-commit
 * Integrates with BoxLog's existing bundle monitoring system
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  // Baseline file for comparison
  baselineFile: 'config/bundle-baseline.json',

  // Regression thresholds
  warningThreshold: 0.1, // 10% increase shows warning
  errorThreshold: 0.2, // 20% increase blocks commit

  // Size limits (fallback if no baseline)
  fallbackLimits: {
    maxTotalJS: 800 * 1024, // 800KB
    maxTotalCSS: 150 * 1024, // 150KB
    maxTotal: 1000 * 1024, // 1MB
  },
}

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function hasSignificantChanges() {
  try {
    // Check if there are any JS/TS/CSS changes that could affect bundle size
    const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((file) => file.length > 0)

    const bundleRelevantFiles = changedFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return (
        ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'].includes(ext) ||
        file.includes('package.json') ||
        file.includes('next.config') ||
        file.includes('tailwind.config')
      )
    })

    return bundleRelevantFiles.length > 0
  } catch (error) {
    // If we can't determine, assume changes might affect bundle
    return true
  }
}

function loadBaseline() {
  const baselinePath = path.join(process.cwd(), CONFIG.baselineFile)

  if (!fs.existsSync(baselinePath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  } catch (error) {
    console.warn(`⚠️  Could not load baseline: ${error.message}`)
    return null
  }
}

function getCurrentBundleSize() {
  const buildManifestPath = path.join(process.cwd(), '.next/build-manifest.json')

  if (!fs.existsSync(buildManifestPath)) {
    return null // No build exists
  }

  try {
    // Get basic bundle info from .next directory
    const nextDir = path.join(process.cwd(), '.next')
    const staticDir = path.join(nextDir, 'static')

    if (!fs.existsSync(staticDir)) {
      return null
    }

    let totalJS = 0
    let totalCSS = 0

    // Recursively calculate bundle sizes
    function calculateDirSize(dir, extension) {
      if (!fs.existsSync(dir)) return 0

      let size = 0
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          size += calculateDirSize(filePath, extension)
        } else if (file.endsWith(extension)) {
          size += stat.size
        }
      }

      return size
    }

    totalJS = calculateDirSize(staticDir, '.js')
    totalCSS = calculateDirSize(staticDir, '.css')

    return {
      totalJS,
      totalCSS,
      total: totalJS + totalCSS,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.warn(`⚠️  Could not calculate current bundle size: ${error.message}`)
    return null
  }
}

function compareWithBaseline(current, baseline) {
  const results = {
    warnings: [],
    errors: [],
    improvements: [],
  }

  // Compare total JS
  if (baseline.totalJS) {
    const jsChange = (current.totalJS - baseline.totalJS) / baseline.totalJS
    if (jsChange > CONFIG.errorThreshold) {
      results.errors.push({
        type: 'JavaScript',
        current: current.totalJS,
        baseline: baseline.totalJS,
        change: jsChange,
        formatted: {
          current: formatSize(current.totalJS),
          baseline: formatSize(baseline.totalJS),
          change: `+${(jsChange * 100).toFixed(1)}%`,
        },
      })
    } else if (jsChange > CONFIG.warningThreshold) {
      results.warnings.push({
        type: 'JavaScript',
        current: current.totalJS,
        baseline: baseline.totalJS,
        change: jsChange,
        formatted: {
          current: formatSize(current.totalJS),
          baseline: formatSize(baseline.totalJS),
          change: `+${(jsChange * 100).toFixed(1)}%`,
        },
      })
    } else if (jsChange < -0.05) {
      // 5% improvement
      results.improvements.push({
        type: 'JavaScript',
        change: jsChange,
        formatted: {
          current: formatSize(current.totalJS),
          baseline: formatSize(baseline.totalJS),
          change: `${(jsChange * 100).toFixed(1)}%`,
        },
      })
    }
  }

  // Compare total CSS
  if (baseline.totalCSS) {
    const cssChange = (current.totalCSS - baseline.totalCSS) / baseline.totalCSS
    if (cssChange > CONFIG.errorThreshold) {
      results.errors.push({
        type: 'CSS',
        current: current.totalCSS,
        baseline: baseline.totalCSS,
        change: cssChange,
        formatted: {
          current: formatSize(current.totalCSS),
          baseline: formatSize(baseline.totalCSS),
          change: `+${(cssChange * 100).toFixed(1)}%`,
        },
      })
    } else if (cssChange > CONFIG.warningThreshold) {
      results.warnings.push({
        type: 'CSS',
        current: current.totalCSS,
        baseline: baseline.totalCSS,
        change: cssChange,
        formatted: {
          current: formatSize(current.totalCSS),
          baseline: formatSize(baseline.totalCSS),
          change: `+${(cssChange * 100).toFixed(1)}%`,
        },
      })
    }
  }

  return results
}

function checkFallbackLimits(current) {
  const violations = []

  if (current.totalJS > CONFIG.fallbackLimits.maxTotalJS) {
    violations.push({
      type: 'JavaScript',
      current: formatSize(current.totalJS),
      limit: formatSize(CONFIG.fallbackLimits.maxTotalJS),
    })
  }

  if (current.totalCSS > CONFIG.fallbackLimits.maxTotalCSS) {
    violations.push({
      type: 'CSS',
      current: formatSize(current.totalCSS),
      limit: formatSize(CONFIG.fallbackLimits.maxTotalCSS),
    })
  }

  if (current.total > CONFIG.fallbackLimits.maxTotal) {
    violations.push({
      type: 'Total Bundle',
      current: formatSize(current.total),
      limit: formatSize(CONFIG.fallbackLimits.maxTotal),
    })
  }

  return violations
}

function createOrUpdateBaseline(current) {
  const baselinePath = path.join(process.cwd(), CONFIG.baselineFile)
  const configDir = path.dirname(baselinePath)

  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  const baseline = {
    ...current,
    createdAt: new Date().toISOString(),
    version: require('../package.json').version || '0.0.0',
  }

  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2))
  console.log(`✅ Bundle baseline saved to ${CONFIG.baselineFile}`)
  console.log(
    `📊 Baseline: ${formatSize(current.total)} (JS: ${formatSize(current.totalJS)}, CSS: ${formatSize(current.totalCSS)})`
  )
}

function main() {
  const args = process.argv.slice(2)
  const isCreatingBaseline = args.includes('--create-baseline')
  const isUpdatingBaseline = args.includes('--update-baseline')

  if (isCreatingBaseline || isUpdatingBaseline) {
    console.log('📦 Creating bundle baseline...')
    const current = getCurrentBundleSize()

    if (!current) {
      console.error('❌ No build found. Run "npm run build" first.')
      process.exit(1)
    }

    createOrUpdateBaseline(current)
    return
  }

  console.log('📦 Checking bundle size...')

  // Skip if no relevant changes
  if (!hasSignificantChanges()) {
    console.log('⏭️  No bundle-affecting changes detected, skipping bundle check')
    return
  }

  // Check if build exists
  const current = getCurrentBundleSize()
  if (!current) {
    console.log('⏭️  No build found, run "npm run build" to enable bundle size checking')
    return
  }

  const baseline = loadBaseline()

  if (baseline) {
    // Compare with baseline
    const comparison = compareWithBaseline(current, baseline)

    // Show improvements
    if (comparison.improvements.length > 0) {
      console.log(`\n${colors.green}🎉 Bundle size improvements:${colors.reset}`)
      comparison.improvements.forEach((item) => {
        console.log(`   📦 ${item.type}: ${item.formatted.current} (${item.formatted.change})`)
      })
    }

    // Show warnings
    if (comparison.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  Bundle size warnings:${colors.reset}`)
      comparison.warnings.forEach((item) => {
        console.log(
          `   📦 ${item.type}: ${item.formatted.current} (${item.formatted.change}) - was ${item.formatted.baseline}`
        )
      })
    }

    // Show errors (blocking)
    if (comparison.errors.length > 0) {
      console.error(`\n${colors.red}❌ Bundle size regression detected:${colors.reset}`)
      comparison.errors.forEach((item) => {
        console.error(
          `   📦 ${item.type}: ${item.formatted.current} (${item.formatted.change}) - was ${item.formatted.baseline}`
        )
      })

      console.error(`\n${colors.yellow}💡 Solutions:${colors.reset}`)
      console.error(`   • Review recent changes for unnecessary dependencies`)
      console.error(`   • Use dynamic imports for non-critical code`)
      console.error(`   • Check for duplicate dependencies`)
      console.error(`   • Consider code splitting strategies`)
      console.error(`   • Update baseline if increase is intentional: npm run bundle:update-baseline`)

      process.exit(1)
    }

    if (comparison.warnings.length === 0 && comparison.errors.length === 0 && comparison.improvements.length === 0) {
      console.log('✅ Bundle size within acceptable range')
    }
  } else {
    // No baseline, check against fallback limits
    const violations = checkFallbackLimits(current)

    if (violations.length > 0) {
      console.error(`\n${colors.red}❌ Bundle size exceeds limits:${colors.reset}`)
      violations.forEach((violation) => {
        console.error(`   📦 ${violation.type}: ${violation.current} exceeds ${violation.limit} limit`)
      })

      console.error(`\n${colors.yellow}💡 Solutions:${colors.reset}`)
      console.error(`   • Enable bundle baseline: npm run bundle:create-baseline`)
      console.error(`   • Optimize bundle size before committing`)

      process.exit(1)
    } else {
      console.log(
        `✅ Bundle size within limits (JS: ${formatSize(current.totalJS)}, CSS: ${formatSize(current.totalCSS)})`
      )
    }
  }

  console.log(
    `📊 Current bundle: ${formatSize(current.total)} (JS: ${formatSize(current.totalJS)}, CSS: ${formatSize(current.totalCSS)})`
  )
}

// Run the script
if (require.main === module) {
  main()
}
