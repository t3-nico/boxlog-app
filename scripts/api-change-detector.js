#!/usr/bin/env node

/**
 * API Breaking Change Detection System
 *
 * Analyzes API routes and schemas to detect potential breaking changes
 * before they reach production
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

// Configuration
const CONFIG = {
  // API routes directory
  apiDir: 'src/app/api',
  // Schema directory
  schemaDir: 'api-schema',
  // Cache file for API signatures
  cacheFile: '.api-changes-cache.json',
  // Breaking change patterns
  breakingPatterns: [
    /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g,
    /NextRequest/g,
    /NextResponse/g,
    /\.json\(\)/g,
    /request\.url/g,
    /searchParams/g,
  ]
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
 * Get all API route files
 */
function getApiRoutes() {
  const routes = []

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scanDirectory(fullPath)
      } else if (item === 'route.ts' || item === 'route.js') {
        routes.push(fullPath)
      }
    }
  }

  if (fs.existsSync(CONFIG.apiDir)) {
    scanDirectory(CONFIG.apiDir)
  }

  return routes
}

/**
 * Generate signature for API route file
 */
function generateApiSignature(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Extract key components for signature
    const httpMethods = extractHttpMethods(content)
    const parameters = extractParameters(content)
    const responseStructure = extractResponseStructure(content)
    const validationRules = extractValidationRules(content)

    const signature = {
      file: filePath,
      httpMethods,
      parameters,
      responseStructure,
      validationRules,
      contentHash: crypto.createHash('sha256').update(content).digest('hex').slice(0, 8)
    }

    return signature
  } catch (error) {
    console.warn(`⚠️  Could not process ${filePath}: ${error.message}`)
    return null
  }
}

/**
 * Extract HTTP method exports
 */
function extractHttpMethods(content) {
  const methods = []
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/g
  let match

  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1])
  }

  return methods.sort()
}

/**
 * Extract request parameters from code
 */
function extractParameters(content) {
  const parameters = []

  // Query parameters
  const searchParamsRegex = /searchParams\.get\(['"`]([^'"`]+)['"`]\)/g
  let match
  while ((match = searchParamsRegex.exec(content)) !== null) {
    parameters.push({ type: 'query', name: match[1] })
  }

  // Body parameters
  const bodyParamsRegex = /const\s*\{\s*([^}]+)\s*\}\s*=\s*body/g
  match = bodyParamsRegex.exec(content)
  if (match) {
    const bodyParams = match[1]
      .split(',')
      .map(param => param.trim().split(/[=\s]/)[0])
      .filter(param => param.length > 0)

    bodyParams.forEach(param => {
      parameters.push({ type: 'body', name: param })
    })
  }

  return parameters
}

/**
 * Extract response structure patterns
 */
function extractResponseStructure(content) {
  const responses = []

  // NextResponse.json patterns
  const responseRegex = /NextResponse\.json\(\s*\{([^}]+)\}/g
  let match

  while ((match = responseRegex.exec(content)) !== null) {
    const responseKeys = match[1]
      .split(',')
      .map(key => key.trim().split(':')[0].trim())
      .filter(key => key.length > 0)

    responses.push({ keys: responseKeys })
  }

  return responses
}

/**
 * Extract validation rules
 */
function extractValidationRules(content) {
  const validations = []

  // Required field validations
  const requiredRegex = /if\s*\(\s*!([a-zA-Z_][a-zA-Z0-9_]*)/g
  let match

  while ((match = requiredRegex.exec(content)) !== null) {
    validations.push({ type: 'required', field: match[1] })
  }

  // Type validations
  const typeRegex = /typeof\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[!=]=\s*['"`]([^'"`]+)['"`]/g
  while ((match = typeRegex.exec(content)) !== null) {
    validations.push({ type: 'typeof', field: match[1], expectedType: match[2] })
  }

  return validations
}

/**
 * Load cached signatures
 */
function loadCache() {
  const cachePath = path.join(process.cwd(), CONFIG.cacheFile)

  if (!fs.existsSync(cachePath)) {
    return {}
  }

  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  } catch (error) {
    console.warn(`⚠️  Could not load API cache: ${error.message}`)
    return {}
  }
}

/**
 * Save signatures to cache
 */
function saveCache(signatures) {
  const cachePath = path.join(process.cwd(), CONFIG.cacheFile)

  try {
    const cache = {
      signatures,
      timestamp: new Date().toISOString(),
    }

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.warn(`⚠️  Could not save API cache: ${error.message}`)
  }
}

/**
 * Compare signatures for breaking changes
 */
function detectBreakingChanges(oldSignatures, newSignatures) {
  const changes = {
    breaking: [],
    additions: [],
    modifications: []
  }

  // Check for removed or modified APIs
  Object.entries(oldSignatures).forEach(([filePath, oldSig]) => {
    const newSig = newSignatures[filePath]

    if (!newSig) {
      changes.breaking.push({
        type: 'REMOVED_API',
        file: filePath,
        description: 'API endpoint removed'
      })
      return
    }

    // Check HTTP methods
    const removedMethods = oldSig.httpMethods.filter(method => !newSig.httpMethods.includes(method))
    removedMethods.forEach(method => {
      changes.breaking.push({
        type: 'REMOVED_METHOD',
        file: filePath,
        description: `HTTP ${method} method removed`,
        detail: method
      })
    })

    // Check required parameters
    const oldRequired = oldSig.parameters.filter(p => p.type === 'query' || p.type === 'body')
    const newRequired = newSig.parameters.filter(p => p.type === 'query' || p.type === 'body')

    oldRequired.forEach(oldParam => {
      const stillExists = newRequired.some(newParam =>
        newParam.name === oldParam.name && newParam.type === oldParam.type
      )

      if (!stillExists) {
        changes.breaking.push({
          type: 'REMOVED_PARAMETER',
          file: filePath,
          description: `Required parameter '${oldParam.name}' (${oldParam.type}) removed`,
          detail: oldParam
        })
      }
    })

    // Check response structure changes
    if (oldSig.responseStructure.length > 0 && newSig.responseStructure.length > 0) {
      oldSig.responseStructure.forEach((oldResp, index) => {
        const newResp = newSig.responseStructure[index]
        if (newResp) {
          const removedKeys = oldResp.keys.filter(key => !newResp.keys.includes(key))
          removedKeys.forEach(key => {
            changes.breaking.push({
              type: 'REMOVED_RESPONSE_KEY',
              file: filePath,
              description: `Response key '${key}' removed`,
              detail: key
            })
          })
        }
      })
    }

    // Check validation changes
    oldSig.validationRules.forEach(oldRule => {
      const stillExists = newSig.validationRules.some(newRule =>
        newRule.type === oldRule.type && newRule.field === oldRule.field
      )

      if (!stillExists && oldRule.type === 'required') {
        changes.modifications.push({
          type: 'RELAXED_VALIDATION',
          file: filePath,
          description: `Required validation for '${oldRule.field}' removed`,
          detail: oldRule
        })
      }
    })

    // Check for content hash changes (general modifications)
    if (oldSig.contentHash !== newSig.contentHash) {
      changes.modifications.push({
        type: 'CONTENT_MODIFIED',
        file: filePath,
        description: 'API implementation modified',
        detail: { oldHash: oldSig.contentHash, newHash: newSig.contentHash }
      })
    }
  })

  // Check for new APIs (additions)
  Object.entries(newSignatures).forEach(([filePath, newSig]) => {
    if (!oldSignatures[filePath]) {
      changes.additions.push({
        type: 'NEW_API',
        file: filePath,
        description: 'New API endpoint added',
        methods: newSig.httpMethods
      })
    }
  })

  return changes
}

/**
 * Display change analysis results
 */
function displayResults(changes) {
  const breakingCount = changes.breaking.length
  const additionCount = changes.additions.length
  const modificationCount = changes.modifications.length

  console.log(`${colors.cyan}📊 API Change Analysis:${colors.reset}`)
  console.log(`   🚨 Breaking Changes: ${breakingCount}`)
  console.log(`   ➕ New APIs: ${additionCount}`)
  console.log(`   📝 Modifications: ${modificationCount}`)

  if (breakingCount > 0) {
    console.log(`\n${colors.red}🚨 BREAKING CHANGES DETECTED:${colors.reset}`)
    changes.breaking.forEach((change, index) => {
      console.log(`\n${index + 1}. ${colors.red}${change.type}${colors.reset}`)
      console.log(`   📁 File: ${change.file}`)
      console.log(`   📄 Description: ${change.description}`)
      if (change.detail) {
        console.log(`   🔍 Detail: ${JSON.stringify(change.detail, null, 2).replace(/\n/g, '\n       ')}`)
      }
    })

    console.log(`\n${colors.yellow}💡 Recommended Actions:${colors.reset}`)
    console.log(`   • Review breaking changes with API consumers`)
    console.log(`   • Consider API versioning (v1, v2) for major changes`)
    console.log(`   • Update API documentation`)
    console.log(`   • Implement backward compatibility where possible`)
    console.log(`   • Coordinate with frontend/mobile teams`)

    return false
  }

  if (additionCount > 0) {
    console.log(`\n${colors.green}➕ New APIs Added:${colors.reset}`)
    changes.additions.forEach(change => {
      console.log(`   📁 ${change.file}`)
      console.log(`   🔧 Methods: ${change.methods.join(', ')}`)
    })
  }

  if (modificationCount > 0) {
    console.log(`\n${colors.blue}📝 API Modifications:${colors.reset}`)
    changes.modifications.slice(0, 5).forEach(change => {
      console.log(`   📁 ${path.basename(change.file)} - ${change.description}`)
    })
    if (modificationCount > 5) {
      console.log(`   📄 ... and ${modificationCount - 5} more modifications`)
    }
  }

  return true
}

/**
 * Check if API files have changed
 */
function hasApiChanges() {
  try {
    const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(file => file.length > 0)

    return changedFiles.some(file =>
      file.includes('/api/') &&
      (file.endsWith('.ts') || file.endsWith('.js'))
    )
  } catch (error) {
    // If we can't determine, assume API changes might exist
    return true
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking for API breaking changes...')

  // Check for force flag
  const forceCheck = process.argv.includes('--force')

  // Skip if no API changes (unless forced)
  if (!forceCheck && !hasApiChanges()) {
    console.log('⏭️  No API changes detected, skipping analysis')
    console.log('💡 Use --force flag to run analysis anyway')
    return
  }

  // Get current API routes
  const routes = getApiRoutes()

  if (routes.length === 0) {
    console.log('ℹ️  No API routes found')
    return
  }

  console.log(`📁 Found ${routes.length} API route(s)`)

  // Generate current signatures
  const currentSignatures = {}
  routes.forEach(route => {
    const signature = generateApiSignature(route)
    if (signature) {
      currentSignatures[route] = signature
    }
  })

  // Load cached signatures
  const cache = loadCache()
  const previousSignatures = cache.signatures || {}

  // Detect breaking changes
  const changes = detectBreakingChanges(previousSignatures, currentSignatures)

  // Display results
  const isCompatible = displayResults(changes)

  // Save current signatures
  saveCache(currentSignatures)

  if (!isCompatible) {
    console.log(`\n${colors.red}❌ Breaking changes detected - Please review before committing${colors.reset}`)
    process.exit(1)
  }

  console.log(`\n${colors.green}✅ API compatibility check passed${colors.reset}`)
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  generateApiSignature,
  detectBreakingChanges,
  getApiRoutes
}