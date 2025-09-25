#!/usr/bin/env node

/**
 * Performance Regression Test System
 *
 * Comprehensive performance monitoring and regression detection
 * Integrates with bundle monitoring and extends to build performance
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  // Performance metrics cache
  cacheFile: '.performance-cache.json',

  // Baseline file for historical comparison
  baselineFile: 'config/performance-baseline.json',

  // Regression thresholds
  thresholds: {
    buildTime: {
      warning: 1.2, // 20% increase shows warning
      error: 1.5, // 50% increase blocks commit
    },
    bundleSize: {
      warning: 1.1, // 10% increase shows warning
      error: 1.2, // 20% increase blocks commit
    },
    typecheck: {
      warning: 1.3, // 30% increase shows warning
      error: 2.0, // 100% increase blocks commit
    },
    lint: {
      warning: 1.5, // 50% increase shows warning
      error: 2.0, // 100% increase blocks commit
    },
  },

  // Fallback limits (when no baseline exists)
  fallbackLimits: {
    maxBuildTime: 120000, // 2 minutes
    maxTypecheckTime: 30000, // 30 seconds
    maxLintTime: 15000, // 15 seconds
    maxBundleSize: 50 * 1024 * 1024, // 50MB (development build includes source maps)
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

/**
 * Format time in milliseconds to human readable
 */
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

/**
 * Format bytes to human readable
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Check if performance-relevant files have changed
 */
function hasPerformanceRelevantChanges() {
  try {
    const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((file) => file.length > 0)

    const relevantFiles = changedFiles.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return (
        ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'].includes(ext) ||
        file.includes('package.json') ||
        file.includes('next.config') ||
        file.includes('tailwind.config') ||
        file.includes('tsconfig.json') ||
        file.includes('.eslintrc') ||
        file.includes('eslint')
      )
    })

    return relevantFiles.length > 0
  } catch (error) {
    // If we can't determine, assume changes might affect performance
    return true
  }
}

/**
 * Measure build performance
 */
function measureBuildPerformance() {
  console.log('⏱️  Measuring build performance...')

  const metrics = {}

  try {
    // Get bundle size (only if build already exists)
    const bundleStats = getBundleStats()
    if (bundleStats) {
      metrics.bundleSize = bundleStats.total
      metrics.bundleJS = bundleStats.totalJS
      metrics.bundleCSS = bundleStats.totalCSS
      console.log('📊 Using existing build for bundle analysis')
    } else {
      console.log('⚠️  No build found - bundle metrics unavailable')
    }

    // Measure simple type check (lightweight)
    const typecheckStart = Date.now()
    try {
      execSync('tsc --noEmit --incremental', { stdio: 'pipe' })
      metrics.typecheckTime = Date.now() - typecheckStart
    } catch (error) {
      console.warn('⚠️  TypeScript check failed, skipping metric')
    }

    metrics.timestamp = new Date().toISOString()

    return metrics
  } catch (error) {
    console.warn(`⚠️  Performance measurement failed: ${error.message}`)
    return null
  }
}

/**
 * Get bundle statistics
 */
function getBundleStats() {
  const nextDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(nextDir, 'static')

  if (!fs.existsSync(staticDir)) {
    return null
  }

  try {
    let totalJS = 0
    let totalCSS = 0

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
    }
  } catch (error) {
    console.warn(`⚠️  Could not get bundle stats: ${error.message}`)
    return null
  }
}

/**
 * Load cached baseline
 */
function loadBaseline() {
  const baselinePath = path.join(process.cwd(), CONFIG.baselineFile)

  if (!fs.existsSync(baselinePath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  } catch (error) {
    console.warn(`⚠️  Could not load performance baseline: ${error.message}`)
    return null
  }
}

/**
 * Save current metrics as baseline
 */
function saveBaseline(metrics) {
  const baselinePath = path.join(process.cwd(), CONFIG.baselineFile)
  const configDir = path.dirname(baselinePath)

  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  const baseline = {
    ...metrics,
    createdAt: new Date().toISOString(),
    version: require('../package.json').version || '0.0.0',
  }

  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2))
  console.log(`✅ Performance baseline saved to ${CONFIG.baselineFile}`)
}

/**
 * Compare current metrics with baseline
 */
function compareWithBaseline(current, baseline) {
  const results = {
    warnings: [],
    errors: [],
    improvements: [],
  }

  const metrics = [
    { key: 'typecheckTime', name: 'TypeScript Check', formatter: formatTime, threshold: CONFIG.thresholds.typecheck },
    { key: 'bundleSize', name: 'Bundle Size', formatter: formatSize, threshold: CONFIG.thresholds.bundleSize },
  ]

  metrics.forEach((metric) => {
    if (!current[metric.key] || !baseline[metric.key]) return

    const ratio = current[metric.key] / baseline[metric.key]
    const changePercent = ((ratio - 1) * 100).toFixed(1)

    if (ratio > metric.threshold.error) {
      results.errors.push({
        type: metric.name,
        current: current[metric.key],
        baseline: baseline[metric.key],
        ratio,
        formatted: {
          current: metric.formatter(current[metric.key]),
          baseline: metric.formatter(baseline[metric.key]),
          change: `+${changePercent}%`,
        },
      })
    } else if (ratio > metric.threshold.warning) {
      results.warnings.push({
        type: metric.name,
        current: current[metric.key],
        baseline: baseline[metric.key],
        ratio,
        formatted: {
          current: metric.formatter(current[metric.key]),
          baseline: metric.formatter(baseline[metric.key]),
          change: `+${changePercent}%`,
        },
      })
    } else if (ratio < 0.9) {
      // 10% improvement
      results.improvements.push({
        type: metric.name,
        ratio,
        formatted: {
          current: metric.formatter(current[metric.key]),
          baseline: metric.formatter(baseline[metric.key]),
          change: `${changePercent}%`,
        },
      })
    }
  })

  return results
}

/**
 * Check against fallback limits
 */
function checkFallbackLimits(metrics) {
  const violations = []

  const checks = [
    {
      key: 'typecheckTime',
      name: 'TypeScript Check',
      limit: CONFIG.fallbackLimits.maxTypecheckTime,
      formatter: formatTime,
    },
    { key: 'bundleSize', name: 'Bundle Size', limit: CONFIG.fallbackLimits.maxBundleSize, formatter: formatSize },
  ]

  checks.forEach((check) => {
    if (metrics[check.key] && metrics[check.key] > check.limit) {
      violations.push({
        type: check.name,
        current: check.formatter(metrics[check.key]),
        limit: check.formatter(check.limit),
      })
    }
  })

  return violations
}

/**
 * Display performance results
 */
function displayResults(current, comparison, violations) {
  console.log(`${colors.cyan}📊 Performance Analysis:${colors.reset}`)

  if (current.typecheckTime) console.log(`   🔍 TypeScript Check: ${formatTime(current.typecheckTime)}`)
  if (current.bundleSize) console.log(`   📦 Bundle Size: ${formatSize(current.bundleSize)}`)

  // Show improvements
  if (comparison && comparison.improvements.length > 0) {
    console.log(`\n${colors.green}🎉 Performance improvements:${colors.reset}`)
    comparison.improvements.forEach((item) => {
      console.log(`   ⚡ ${item.type}: ${item.formatted.current} (${item.formatted.change})`)
    })
  }

  // Show warnings
  if (comparison && comparison.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Performance warnings:${colors.reset}`)
    comparison.warnings.forEach((item) => {
      console.log(
        `   ⚠️  ${item.type}: ${item.formatted.current} (${item.formatted.change}) - was ${item.formatted.baseline}`
      )
    })
  }

  // Show errors
  const hasErrors = (comparison && comparison.errors.length > 0) || violations.length > 0

  if (comparison && comparison.errors.length > 0) {
    console.error(`\n${colors.red}❌ Performance regression detected:${colors.reset}`)
    comparison.errors.forEach((item) => {
      console.error(
        `   📉 ${item.type}: ${item.formatted.current} (${item.formatted.change}) - was ${item.formatted.baseline}`
      )
    })
  }

  if (violations.length > 0) {
    console.error(`\n${colors.red}❌ Performance limits exceeded:${colors.reset}`)
    violations.forEach((violation) => {
      console.error(`   📊 ${violation.type}: ${violation.current} exceeds ${violation.limit} limit`)
    })
  }

  if (hasErrors) {
    console.error(`\n${colors.yellow}💡 Optimization suggestions:${colors.reset}`)
    console.error(`   • Review recent changes for performance impact`)
    console.error(`   • Check for new large dependencies`)
    console.error(`   • Consider code splitting for large components`)
    console.error(`   • Optimize imports and eliminate dead code`)
    console.error(`   • Use production builds for accurate measurements`)
    console.error(`   • Update baseline if regression is intentional: --update-baseline`)

    return false
  }

  return true
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2)
  const forceCheck = args.includes('--force')
  const createBaseline = args.includes('--create-baseline')
  const updateBaseline = args.includes('--update-baseline')

  console.log('⚡ Checking performance regression...')

  if (createBaseline || updateBaseline) {
    console.log('📊 Creating performance baseline...')
    const metrics = measureBuildPerformance()

    if (!metrics) {
      console.error('❌ Could not measure performance metrics')
      process.exit(1)
    }

    saveBaseline(metrics)
    return
  }

  // Skip if no relevant changes (unless forced)
  if (!forceCheck && !hasPerformanceRelevantChanges()) {
    console.log('⏭️  No performance-affecting changes detected, skipping regression test')
    console.log('💡 Use --force flag to run regression test anyway')
    return
  }

  // Measure current performance
  const currentMetrics = measureBuildPerformance()

  if (!currentMetrics) {
    console.error('❌ Could not measure current performance')
    process.exit(1)
  }

  // Load baseline for comparison
  const baseline = loadBaseline()
  let comparison = null
  let violations = []

  if (baseline) {
    comparison = compareWithBaseline(currentMetrics, baseline)
  } else {
    violations = checkFallbackLimits(currentMetrics)
  }

  // Display results and check if performance is acceptable
  const isAcceptable = displayResults(currentMetrics, comparison, violations)

  if (!isAcceptable) {
    console.log(`\n${colors.red}❌ Performance regression detected - Please review before committing${colors.reset}`)
    process.exit(1)
  }

  console.log(`\n${colors.green}✅ Performance regression check passed${colors.reset}`)
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  measureBuildPerformance,
  compareWithBaseline,
  checkFallbackLimits,
}
