#!/usr/bin/env node
/**
 * 🔧 BoxLog API Version Manager
 *
 * APIバージョニングシステムの管理・テストスクリプト
 * - バージョン管理操作
 * - エンドポイントテスト
 * - 統計情報確認
 * - API健康チェック
 */

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')

/**
 * 🎨 カラー出力設定
 */
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
}

/**
 * 📝 ログ出力ヘルパー
 */
const logger = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🔧 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.white}   ${msg}${colors.reset}`),
}

/**
 * 🌐 API設定
 */
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  versions: ['1.0', '2.0'],
  endpoints: ['/api/v1/health', '/api/v2/health', '/api/v1/system', '/api/version-test'],
}

/**
 * 🏥 API Health Check実行
 */
async function checkApiHealth(baseUrl = API_CONFIG.baseUrl) {
  logger.header('API Health Check Starting...')

  const results = []

  for (const endpoint of API_CONFIG.endpoints) {
    try {
      const result = await makeRequest('GET', `${baseUrl}${endpoint}`)
      results.push({
        endpoint,
        status: 'success',
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        data: result.data,
      })

      logger.success(`${endpoint} - ${result.statusCode} (${result.responseTime}ms)`)
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        error: error.message,
      })

      logger.error(`${endpoint} - ${error.message}`)
    }
  }

  return results
}

/**
 * 🔍 バージョニングテスト実行
 */
async function testVersioning(baseUrl = API_CONFIG.baseUrl) {
  logger.header('API Versioning Test Starting...')

  const testCases = [
    // URLベースバージョニング
    { url: '/api/v1/version-test', description: 'URL-based v1.0' },
    { url: '/api/v2/version-test', description: 'URL-based v2.0 (if supported)' },

    // ヘッダーベースバージョニング
    {
      url: '/api/version-test',
      headers: { 'API-Version': '1.0' },
      description: 'Header-based v1.0',
    },
    {
      url: '/api/version-test',
      headers: { 'API-Version': '2.0' },
      description: 'Header-based v2.0',
    },

    // デフォルト動作
    { url: '/api/version-test', description: 'Default version' },
  ]

  const results = []

  for (const testCase of testCases) {
    try {
      logger.info(`Testing: ${testCase.description}`)

      const result = await makeRequest('GET', `${baseUrl}${testCase.url}`, testCase.headers)
      results.push({
        ...testCase,
        status: 'success',
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        versionInfo: result.data && 'version' in result.data ? result.data.version : {},
      })

      const resultData = result.data || {}
      const versionInfo = 'version' in resultData ? resultData.version : {}
      const actual = 'actual' in versionInfo ? versionInfo.actual : 'unknown'
      const source = 'source' in versionInfo ? versionInfo.source : 'unknown'
      const status = 'status' in versionInfo ? versionInfo.status : 'unknown'

      logger.data(`Version: ${actual} (${source})`)
      logger.data(`Status: ${status}`)
    } catch (error) {
      results.push({
        ...testCase,
        status: 'error',
        error: error.message,
      })

      logger.error(`Failed: ${error.message}`)
    }
  }

  return results
}

/**
 * 📊 API統計情報取得
 */
async function getApiStats(baseUrl = API_CONFIG.baseUrl) {
  logger.header('API Statistics Retrieval...')

  try {
    const result = await makeRequest('GET', `${baseUrl}/api/v1/system`)
    const resultData = result.data || {}
    const stats = 'statistics' in resultData ? resultData.statistics : {}

    logger.success('API Statistics Retrieved')
    const totalRequests = 'totalRequests' in stats ? stats.totalRequests : 0
    const endpoints = 'endpoints' in stats && Array.isArray(stats.endpoints) ? stats.endpoints : []
    logger.data(`Total Requests: ${totalRequests}`)
    logger.data(`Active Endpoints: ${endpoints.length}`)

    if (endpoints.length > 0) {
      logger.info('Endpoint Details:')
      endpoints.forEach((endpoint) => {
        if (endpoint && typeof endpoint === 'object') {
          const endpointPath = 'path' in endpoint ? endpoint.path : 'unknown'
          const requestCount = 'requestCount' in endpoint ? endpoint.requestCount : 0
          const errorCount = 'errorCount' in endpoint ? endpoint.errorCount : 0
          const avgResponseTime = 'averageResponseTime' in endpoint ? endpoint.averageResponseTime : 0
          const lastRequest = 'lastRequest' in endpoint ? endpoint.lastRequest : 'unknown'

          logger.data(`  ${endpointPath}:`)
          logger.data(`    Requests: ${requestCount}`)
          logger.data(`    Errors: ${errorCount}`)
          logger.data(`    Avg Response: ${avgResponseTime}ms`)
          logger.data(`    Last Request: ${lastRequest}`)
        }
      })
    }

    return stats
  } catch (error) {
    logger.error(`Stats retrieval failed: ${error.message}`)
    return null
  }
}

/**
 * 🔄 CORS テスト
 */
async function testCors(baseUrl = API_CONFIG.baseUrl) {
  logger.header('CORS Configuration Test...')

  try {
    const result = await makeRequest('OPTIONS', `${baseUrl}/api/v1/health`, {
      Origin: 'https://example.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'API-Version,Content-Type',
    })

    logger.success(`CORS preflight successful - ${result.statusCode}`)

    const headers = result.headers || {}
    const allowOrigin = 'access-control-allow-origin' in headers ? headers['access-control-allow-origin'] : null
    const allowMethods = 'access-control-allow-methods' in headers ? headers['access-control-allow-methods'] : null
    const allowHeaders = 'access-control-allow-headers' in headers ? headers['access-control-allow-headers'] : null

    if (allowOrigin) {
      logger.data(`Allow Origin: ${allowOrigin}`)
    }
    if (allowMethods) {
      logger.data(`Allow Methods: ${allowMethods}`)
    }
    if (allowHeaders) {
      logger.data(`Allow Headers: ${allowHeaders}`)
    }

    return { status: 'success', headers: result.headers }
  } catch (error) {
    logger.error(`CORS test failed: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

/**
 * 📁 テストレポート生成
 */
function generateTestReport(results) {
  const timestamp = new Date().toISOString()
  const reportData = {
    timestamp,
    results,
    summary: {
      totalTests: results.length,
      passed: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
    },
  }

  const reportPath = path.join(__dirname, '..', 'logs', `api-version-test-${Date.now()}.json`)

  // logsディレクトリの作成
  const logsDir = path.dirname(reportPath)
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2))

  logger.success(`Test report saved: ${reportPath}`)
  return reportPath
}

/**
 * 🌐 HTTP リクエストヘルパー
 */
function makeRequest(method, url, headers = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'BoxLog-API-Version-Manager/1.0',
        ...headers,
      },
      timeout: API_CONFIG.timeout,
    }

    const client = isHttps ? https : http
    const req = client.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        const responseTime = Date.now() - startTime

        try {
          const parsedData = data ? JSON.parse(data) : {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            responseTime,
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: { raw: data },
            responseTime,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timeout after ${API_CONFIG.timeout}ms`))
    })

    req.end()
  })
}

/**
 * 🎯 メイン実行関数
 */
async function main() {
  const argv = process.argv || []
  const command = argv.length > 2 ? argv[2] : undefined
  const baseUrl = (argv.length > 3 ? argv[3] : null) || API_CONFIG.baseUrl

  logger.header(`BoxLog API Version Manager`)
  logger.info(`Base URL: ${baseUrl}`)
  logger.info(`Command: ${command || 'full-test'}`)
  console.log()

  try {
    switch (command) {
      case 'health':
        await checkApiHealth(baseUrl)
        break

      case 'version':
        await testVersioning(baseUrl)
        break

      case 'stats':
        await getApiStats(baseUrl)
        break

      case 'cors':
        await testCors(baseUrl)
        break

      case 'full-test':
      default:
        // 全テスト実行
        const allResults = []

        logger.header('Running Complete API Version Test Suite')

        const healthResults = await checkApiHealth(baseUrl)
        allResults.push(...healthResults.map((r) => ({ ...r, testType: 'health' })))

        console.log()
        const versionResults = await testVersioning(baseUrl)
        allResults.push(...versionResults.map((r) => ({ ...r, testType: 'versioning' })))

        console.log()
        const statsResult = await getApiStats(baseUrl)
        if (statsResult) {
          allResults.push({ testType: 'stats', status: 'success', data: statsResult })
        }

        console.log()
        const corsResult = await testCors(baseUrl)
        allResults.push({ testType: 'cors', ...corsResult })

        // レポート生成
        console.log()
        generateTestReport(allResults)

        // サマリー出力
        console.log()
        logger.header('Test Summary')
        const summary = {
          total: allResults.length,
          passed: allResults.filter((r) => r.status === 'success').length,
          failed: allResults.filter((r) => r.status === 'error').length,
        }

        logger.info(`Total Tests: ${summary.total}`)
        logger.success(`Passed: ${summary.passed}`)
        if (summary.failed > 0) {
          logger.error(`Failed: ${summary.failed}`)
        }
        break
    }
  } catch (error) {
    logger.error(`Script execution failed: ${error.message}`)
    process.exit(1)
  }
}

// スクリプト実行
if (require.main === module) {
  main()
}

module.exports = {
  checkApiHealth,
  testVersioning,
  getApiStats,
  testCors,
  generateTestReport,
}
