#!/usr/bin/env node

/**
 * License Compliance Checker for Pre-commit Hook
 *
 * Scans dependencies for license compliance and prevents
 * commits with incompatible or risky licenses
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  // Allowed licenses (permissive and compatible)
  allowedLicenses: [
    'MIT',
    'Apache-2.0',
    'ISC',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'CC0-1.0',
    'BlueOak-1.0.0',
    '0BSD',
    'Python-2.0',
    'UNLICENSED', // For internal packages
    'CC-BY-4.0',
    'CC-BY-3.0',
  ],

  // Warning licenses (review required)
  warningLicenses: [
    'MPL-2.0', // Mozilla Public License
    '(MPL-2.0 OR Apache-2.0)',
    '(AFL-2.1 OR BSD-3-Clause)',
    '(WTFPL OR MIT)',
    '(MIT AND CC-BY-3.0)',
    '(MIT OR CC0-1.0)',
  ],

  // Prohibited licenses (block commit)
  prohibitedLicenses: [
    'GPL-2.0',
    'GPL-3.0',
    'LGPL-2.1',
    'LGPL-3.0',
    'AGPL-3.0',
    'EUPL-1.1',
    'EUPL-1.2',
    'CDDL-1.0',
    'EPL-1.0',
    'EPL-2.0',
  ],

  // Cache file for performance
  cacheFile: '.license-cache.json',
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

function hasPackageJsonChanges() {
  try {
    const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter((file) => file.length > 0)

    return changedFiles.some(
      (file) =>
        file === 'package.json' || file === 'package-lock.json' || file === 'yarn.lock' || file === 'pnpm-lock.yaml'
    )
  } catch (error) {
    // If we can't determine, assume changes might affect licenses
    return true
  }
}

function loadCache() {
  const cachePath = path.join(process.cwd(), CONFIG.cacheFile)

  if (!fs.existsSync(cachePath)) {
    return null
  }

  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    const packageJsonStat = fs.statSync('package.json')

    // Check if cache is still valid (package.json not modified)
    if (cache.timestamp && new Date(cache.timestamp) >= packageJsonStat.mtime) {
      return cache.licenses
    }
  } catch (error) {
    console.warn(`⚠️  Could not load license cache: ${error.message}`)
  }

  return null
}

function saveCache(licenses) {
  const cachePath = path.join(process.cwd(), CONFIG.cacheFile)

  try {
    const cache = {
      licenses,
      timestamp: new Date().toISOString(),
    }

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.warn(`⚠️  Could not save license cache: ${error.message}`)
  }
}

function getLicenses() {
  // Check cache first
  const cached = loadCache()
  if (cached) {
    return cached
  }

  try {
    console.log('🔍 Scanning dependency licenses...')

    const output = execSync('npx license-checker --json --production', {
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const licenseData = JSON.parse(output)
    const licenses = {}

    // Process license data
    Object.entries(licenseData).forEach(([packageName, info]) => {
      const license = info.licenses || 'UNKNOWN'

      if (!licenses[license]) {
        licenses[license] = []
      }

      licenses[license].push({
        name: packageName,
        version: info.version,
        repository: info.repository,
        publisher: info.publisher,
      })
    })

    // Save to cache
    saveCache(licenses)

    return licenses
  } catch (error) {
    console.error(`❌ Failed to scan licenses: ${error.message}`)
    process.exit(1)
  }
}

function categorizeLicenses(licenses) {
  const result = {
    allowed: {},
    warnings: {},
    prohibited: {},
    unknown: {},
  }

  Object.entries(licenses).forEach(([license, packages]) => {
    if (CONFIG.allowedLicenses.includes(license)) {
      result.allowed[license] = packages
    } else if (CONFIG.warningLicenses.includes(license)) {
      result.warnings[license] = packages
    } else if (CONFIG.prohibitedLicenses.includes(license)) {
      result.prohibited[license] = packages
    } else {
      result.unknown[license] = packages
    }
  })

  return result
}

function displayResults(categorized) {
  const allowedCount = Object.values(categorized.allowed).reduce((sum, packages) => sum + packages.length, 0)
  const warningCount = Object.values(categorized.warnings).reduce((sum, packages) => sum + packages.length, 0)
  const prohibitedCount = Object.values(categorized.prohibited).reduce((sum, packages) => sum + packages.length, 0)
  const unknownCount = Object.values(categorized.unknown).reduce((sum, packages) => sum + packages.length, 0)

  console.log(`📊 License Summary:`)
  console.log(`   ✅ Allowed: ${allowedCount} packages`)
  if (warningCount > 0) {
    console.log(`   ⚠️  Warnings: ${warningCount} packages`)
  }
  if (prohibitedCount > 0) {
    console.log(`   ❌ Prohibited: ${prohibitedCount} packages`)
  }
  if (unknownCount > 0) {
    console.log(`   ❓ Unknown: ${unknownCount} packages`)
  }

  // Show warnings in detail
  if (Object.keys(categorized.warnings).length > 0) {
    console.log(`\n${colors.yellow}⚠️  License warnings (review recommended):${colors.reset}`)
    Object.entries(categorized.warnings).forEach(([license, packages]) => {
      console.log(`   📜 ${license}:`)
      packages.slice(0, 3).forEach((pkg) => {
        console.log(`      • ${pkg.name}@${pkg.version}`)
      })
      if (packages.length > 3) {
        console.log(`      • ... and ${packages.length - 3} more`)
      }
    })
  }

  // Show prohibited licenses (blocking)
  if (Object.keys(categorized.prohibited).length > 0) {
    console.error(`\n${colors.red}❌ Prohibited licenses detected:${colors.reset}`)
    Object.entries(categorized.prohibited).forEach(([license, packages]) => {
      console.error(`   📜 ${license}:`)
      packages.forEach((pkg) => {
        console.error(`      • ${pkg.name}@${pkg.version}`)
      })
    })

    console.error(`\n${colors.yellow}💡 Solutions:${colors.reset}`)
    console.error(`   • Find alternative packages with compatible licenses`)
    console.error(`   • Contact package maintainers about license compatibility`)
    console.error(`   • Consider if the package is essential for your project`)
    console.error(`   • Review if dual licensing options are available`)

    return false
  }

  // Show unknown licenses (blocking)
  if (Object.keys(categorized.unknown).length > 0) {
    console.error(`\n${colors.red}❌ Unknown licenses detected:${colors.reset}`)
    Object.entries(categorized.unknown).forEach(([license, packages]) => {
      console.error(`   📜 ${license}:`)
      packages.slice(0, 5).forEach((pkg) => {
        console.error(`      • ${pkg.name}@${pkg.version}`)
      })
      if (packages.length > 5) {
        console.error(`      • ... and ${packages.length - 5} more`)
      }
    })

    console.error(`\n${colors.yellow}💡 Solutions:${colors.reset}`)
    console.error(`   • Review package documentation for license information`)
    console.error(`   • Add license to allowedLicenses if compatible`)
    console.error(`   • Contact package maintainers for license clarification`)
    console.error(`   • Consider alternative packages with clear licenses`)

    return false
  }

  return true
}

function main() {
  console.log('📜 Checking license compliance...')

  // Skip if no dependency changes
  if (!hasPackageJsonChanges()) {
    console.log('⏭️  No dependency changes detected, skipping license check')
    return
  }

  // Get current licenses
  const licenses = getLicenses()

  // Categorize licenses
  const categorized = categorizeLicenses(licenses)

  // Display results and check compliance
  const isCompliant = displayResults(categorized)

  if (!isCompliant) {
    process.exit(1)
  }

  console.log(`✅ License compliance check passed`)
}

// Run the script
if (require.main === module) {
  main()
}
