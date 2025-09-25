#!/usr/bin/env node

/**
 * ===================================================================
 * 包括的品質監視システム - Phase 3c: 100%品質ゲートの完成
 * ===================================================================
 *
 * BoxLog総合品質管理システム
 * Phase 2 + Phase 3 (a,b,c) 全システム統合
 *
 * 企業レベル完全品質保証:
 * - Phase 2a: ライセンス検証システム
 * - Phase 2b: API変更検出システム
 * - Phase 2c: パフォーマンス回帰テスト
 * - Phase 3a: GitLeaks統合Secret検出システム
 * - Phase 3b: TypeScript超厳密モード監視
 * - Phase 3c: 包括的品質ゲート統合 (THIS)
 *
 * @version 1.0.0
 * @since Phase 3c: 包括的品質監視システム実装
 */

const { execSync } = require('child_process')
const fs = require('fs')

// 各品質システムのインポート
let licenseChecker, apiChangeDetector, performanceRegression
let secretDetector, typescriptStrictChecker

try {
  licenseChecker = require('./license-checker.js')
} catch (e) {
  console.log('⚠️  License checker not available')
}

try {
  apiChangeDetector = require('./api-change-detector.js')
} catch (e) {
  console.log('⚠️  API change detector not available')
}

try {
  performanceRegression = require('./performance-regression-test.js')
} catch (e) {
  console.log('⚠️  Performance regression tester not available')
}

try {
  secretDetector = require('./gitleaks-secret-detector.js')
} catch (e) {
  console.log('⚠️  Secret detector not available')
}

try {
  typescriptStrictChecker = require('./typescript-strict-mode-checker.js')
} catch (e) {
  console.log('⚠️  TypeScript strict checker not available')
}

// ===========================================
// 設定: 包括的品質ゲートシステム
// ===========================================

const CONFIG = {
  // 統合品質ゲート定義
  qualityGates: {
    enterprise: {
      name: 'Enterprise Quality Gate',
      description: '企業レベル最高品質基準',
      requirements: {
        // Phase 2 requirements
        license: { violations: 0, prohibited: 0 },
        api: { breakingChanges: 0, criticalChanges: 0 },
        performance: { regressions: 0, majorSlowdowns: 0 },

        // Phase 3 requirements
        secrets: { criticalSecrets: 0, highSecrets: 0 },
        typescript: { criticalErrors: 0, totalErrors: 100 },

        // Overall requirements
        overall: { failedSystems: 0, warningsAllowed: 3 },
      },
      blockingLevel: 'high', // Critical + High レベルでブロック
    },
    production: {
      name: 'Production Ready Gate',
      description: '本番リリース可能品質',
      requirements: {
        license: { violations: 0, prohibited: 0 },
        api: { breakingChanges: 0, criticalChanges: 1 },
        performance: { regressions: 0, majorSlowdowns: 1 },
        secrets: { criticalSecrets: 0, highSecrets: 2 },
        typescript: { criticalErrors: 10, totalErrors: 200 },
        overall: { failedSystems: 1, warningsAllowed: 5 },
      },
      blockingLevel: 'critical', // Critical レベルのみブロック
    },
    development: {
      name: 'Development Quality Gate',
      description: '開発環境品質基準',
      requirements: {
        license: { violations: 3, prohibited: 0 },
        api: { breakingChanges: 1, criticalChanges: 3 },
        performance: { regressions: 1, majorSlowdowns: 2 },
        secrets: { criticalSecrets: 0, highSecrets: 5 },
        typescript: { criticalErrors: 50, totalErrors: 500 },
        overall: { failedSystems: 2, warningsAllowed: 10 },
      },
      blockingLevel: 'none', // ブロックなし（警告のみ）
    },
  },

  // システム優先度
  systemPriorities: {
    secrets: 1, // 最高優先度: セキュリティ
    license: 2, // 法的コンプライアンス
    api: 3, // API安定性
    performance: 4, // パフォーマンス
    typescript: 5, // 型安全性
  },

  // 実行設定
  execution: {
    timeout: 300000, // 5分タイムアウト
    retries: 2, // 失敗時リトライ
    parallel: true, // 並列実行
    reportFile: '.quality-gate-report.json',
  },
}

// ===========================================
// 品質システム実行エンジン
// ===========================================

/**
 * 個別品質システム実行
 */
async function runQualitySystem(systemName, _runner, _config = {}) {
  const startTime = Date.now()
  console.log(`🔍 ${systemName} 実行中...`)

  try {
    let result

    // システム別実行ロジック
    switch (systemName) {
      case 'License Verification':
        result = await runLicenseCheck()
        break
      case 'API Change Detection':
        result = await runApiChangeDetection()
        break
      case 'Performance Regression':
        result = await runPerformanceRegression()
        break
      case 'Secret Detection':
        result = await runSecretDetection()
        break
      case 'TypeScript Strict Mode':
        result = await runTypeScriptStrictCheck()
        break
      default:
        throw new Error(`Unknown system: ${systemName}`)
    }

    const duration = Date.now() - startTime

    return {
      system: systemName,
      success: result.success,
      duration: `${duration}ms`,
      results: result,
      timestamp: new Date().toISOString(),
      priority: CONFIG.systemPriorities[systemName.toLowerCase().replace(/ .+/, '')] || 10,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    return {
      system: systemName,
      success: false,
      duration: `${duration}ms`,
      error: error.message,
      timestamp: new Date().toISOString(),
      priority: CONFIG.systemPriorities[systemName.toLowerCase().replace(/ .+/, '')] || 10,
    }
  }
}

/**
 * ライセンス検証実行
 */
async function runLicenseCheck() {
  if (!licenseChecker || !licenseChecker.runLicenseCheck) {
    console.log('📋 ライセンス検証をコマンド実行...')
    try {
      execSync('node scripts/license-checker.js', { stdio: 'pipe' })
      return { success: true, violations: 0, prohibited: 0 }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return await licenseChecker.runLicenseCheck()
}

/**
 * API変更検出実行
 */
async function runApiChangeDetection() {
  if (!apiChangeDetector || !apiChangeDetector.runApiChangeDetection) {
    console.log('🔄 API変更検出をコマンド実行...')
    try {
      execSync('node scripts/api-change-detector.js', { stdio: 'pipe' })
      return { success: true, changes: [], breakingChanges: 0 }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return await apiChangeDetector.runApiChangeDetection()
}

/**
 * パフォーマンス回帰テスト実行
 */
async function runPerformanceRegression() {
  if (!performanceRegression || !performanceRegression.runPerformanceCheck) {
    console.log('⚡ パフォーマンス回帰テストをコマンド実行...')
    try {
      execSync('node scripts/performance-regression-test.js', { stdio: 'pipe' })
      return { success: true, regressions: 0, improvements: [] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return await performanceRegression.runPerformanceCheck()
}

/**
 * Secret検出実行
 */
async function runSecretDetection() {
  if (!secretDetector || !secretDetector.runSecretDetection) {
    console.log('🔐 Secret検出をコマンド実行...')
    try {
      execSync('node scripts/gitleaks-secret-detector.js', { stdio: 'pipe' })
      return { success: true, results: [], stats: { secretsFound: 0 } }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return await secretDetector.runSecretDetection()
}

/**
 * TypeScript厳密チェック実行
 */
async function runTypeScriptStrictCheck() {
  if (!typescriptStrictChecker || !typescriptStrictChecker.runTypeScriptStrictCheck) {
    console.log('🔥 TypeScript厳密チェックをコマンド実行...')
    try {
      execSync('node scripts/typescript-strict-mode-checker.js', { stdio: 'pipe' })
      return { success: true, stats: { total: 0, bySeverity: { critical: 0 } } }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return await typescriptStrictChecker.runTypeScriptStrictCheck()
}

/**
 * 並列品質システム実行
 */
async function runAllQualitySystems() {
  const systems = [
    'License Verification',
    'API Change Detection',
    'Performance Regression',
    'Secret Detection',
    'TypeScript Strict Mode',
  ]

  console.log('🏗️  包括的品質チェック開始...')
  console.log(`📊 ${systems.length}システムを並列実行中...\n`)

  const startTime = Date.now()
  const results = []

  if (CONFIG.execution.parallel) {
    // 並列実行
    const promises = systems.map((system) => runQualitySystem(system))
    const parallelResults = await Promise.allSettled(promises)

    parallelResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          system: systems[index],
          success: false,
          error: result.reason?.message || 'Unknown error',
          duration: '0ms',
          timestamp: new Date().toISOString(),
        })
      }
    })
  } else {
    // 順次実行
    for (const system of systems) {
      const result = await runQualitySystem(system)
      results.push(result)
    }
  }

  const totalDuration = Date.now() - startTime

  return {
    results,
    totalDuration: `${totalDuration}ms`,
    systemCount: systems.length,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 品質ゲート評価
 */
function evaluateQualityGate(results, gateConfig) {
  const evaluation = {
    gateName: gateConfig.name,
    passed: true,
    violations: [],
    warnings: [],
    summary: {
      total: results.length,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  }

  let failedSystems = 0
  let totalWarnings = 0

  // システム別評価
  results.forEach((result) => {
    if (!result.success) {
      failedSystems++
      evaluation.summary.failed++

      evaluation.violations.push({
        system: result.system,
        type: 'system_failure',
        message: `${result.system} failed: ${result.error || 'Unknown error'}`,
        severity: 'critical',
        priority: result.priority || 10,
      })
      return
    }

    evaluation.summary.passed++

    // システム固有の評価
    const systemEval = evaluateSystemResult(result, gateConfig.requirements)

    systemEval.violations.forEach((violation) => {
      if (violation.severity === 'critical' || (violation.severity === 'high' && gateConfig.blockingLevel !== 'none')) {
        evaluation.violations.push(violation)
        evaluation.passed = false
      } else {
        evaluation.warnings.push(violation)
        totalWarnings++
      }
    })
  })

  // 全体的な品質ゲート評価
  if (failedSystems > gateConfig.requirements.overall.failedSystems) {
    evaluation.passed = false
    evaluation.violations.push({
      system: 'Overall',
      type: 'system_failures',
      message: `Too many failed systems: ${failedSystems} > ${gateConfig.requirements.overall.failedSystems}`,
      severity: 'critical',
      priority: 1,
    })
  }

  if (totalWarnings > gateConfig.requirements.overall.warningsAllowed) {
    evaluation.warnings.push({
      system: 'Overall',
      type: 'warning_count',
      message: `Warning count exceeds limit: ${totalWarnings} > ${gateConfig.requirements.overall.warningsAllowed}`,
      severity: 'medium',
      priority: 5,
    })
  }

  evaluation.summary.warnings = totalWarnings
  evaluation.summary.violations = evaluation.violations.length

  return evaluation
}

/**
 * システム個別結果評価（簡略化版）
 */
function evaluateSystemResult(result, requirements) {
  const evaluation = {
    system: result.system,
    violations: [],
    warnings: [],
  }

  try {
    // 各システムごとの評価を個別関数に委譲
    const evaluator = getSystemEvaluator(result.system)
    return evaluator(result, requirements, evaluation)
  } catch (error) {
    console.error(`❌ ${result.system} 評価エラー:`, error.message)
    return evaluation
  }
}

/**
 * システム評価関数を取得
 */
function getSystemEvaluator(systemName) {
  const evaluators = {
    'License Verification': evaluateLicenseSystem,
    'API Change Detection': evaluateAPISystem,
    'Performance Regression': evaluatePerformanceSystem,
    'Secret Detection': evaluateSecretSystem,
    'TypeScript Strict Mode': evaluateTypeScriptSystem,
  }
  return evaluators[systemName] || evaluateDefaultSystem
}

/**
 * License Verification システム評価
 */
function evaluateLicenseSystem(result, requirements, evaluation) {
  if (result.results.prohibited > requirements.license.prohibited) {
    evaluation.violations.push({
      system: result.system,
      type: 'prohibited_licenses',
      message: `Prohibited licenses detected: ${result.results.prohibited}`,
      severity: 'critical',
      priority: 2,
    })
  }
  if (result.results.violations > requirements.license.violations) {
    evaluation.violations.push({
      system: result.system,
      type: 'license_violations',
      message: `License violations: ${result.results.violations} > ${requirements.license.violations}`,
      severity: 'high',
      priority: 2,
    })
  }
  return evaluation
}

/**
 * API Change Detection システム評価
 */
function evaluateAPISystem(result, requirements, evaluation) {
  const breakingChanges = result.results.breakingChanges || 0
  if (breakingChanges > requirements.api.breakingChanges) {
    evaluation.violations.push({
      system: result.system,
      type: 'breaking_changes',
      message: `Breaking API changes: ${breakingChanges} > ${requirements.api.breakingChanges}`,
      severity: 'critical',
      priority: 3,
    })
  }
  return evaluation
}

/**
 * Performance Regression システム評価
 */
function evaluatePerformanceSystem(result, requirements, evaluation) {
  const regressions = result.results.regressions || 0
  if (regressions > requirements.performance.regressions) {
    evaluation.violations.push({
      system: result.system,
      type: 'performance_regression',
      message: `Performance regressions detected: ${regressions}`,
      severity: 'high',
      priority: 4,
    })
  }
  return evaluation
}

/**
 * Secret Detection システム評価
 */
function evaluateSecretSystem(result, requirements, evaluation) {
  const criticalSecrets = result.results.results?.filter((s) => s.severity === 'critical')?.length || 0
  const highSecrets = result.results.results?.filter((s) => s.severity === 'high')?.length || 0

  if (criticalSecrets > requirements.secrets.criticalSecrets) {
    evaluation.violations.push({
      system: result.system,
      type: 'critical_secrets',
      message: `Critical secrets detected: ${criticalSecrets}`,
      severity: 'critical',
      priority: 1,
    })
  }
  if (highSecrets > requirements.secrets.highSecrets) {
    evaluation.violations.push({
      system: result.system,
      type: 'high_secrets',
      message: `High priority secrets: ${highSecrets} > ${requirements.secrets.highSecrets}`,
      severity: 'high',
      priority: 1,
    })
  }
  return evaluation
}

/**
 * TypeScript Strict Mode システム評価
 */
function evaluateTypeScriptSystem(result, requirements, evaluation) {
  const totalErrors = result.results.stats?.total || 0
  const criticalErrors = result.results.stats?.bySeverity?.critical || 0

  if (criticalErrors > requirements.typescript.criticalErrors) {
    evaluation.violations.push({
      system: result.system,
      type: 'critical_typescript_errors',
      message: `Critical TypeScript errors: ${criticalErrors} > ${requirements.typescript.criticalErrors}`,
      severity: 'high',
      priority: 5,
    })
  }
  if (totalErrors > requirements.typescript.totalErrors) {
    evaluation.violations.push({
      system: result.system,
      type: 'typescript_errors',
      message: `TypeScript errors: ${totalErrors} > ${requirements.typescript.totalErrors}`,
      severity: 'medium',
      priority: 5,
    })
  }
  return evaluation
}

/**
 * デフォルトシステム評価
 */
function evaluateDefaultSystem(result, _requirements, evaluation) {
  return evaluation
}

/**
 * 品質レポート生成
 */
function generateQualityReport(results, evaluation, duration) {
  const report = {
    timestamp: new Date().toISOString(),
    duration: duration,
    gateConfig: evaluation.gateName,
    overall: {
      passed: evaluation.passed,
      status: evaluation.passed ? 'PASS' : 'FAIL',
      summary: evaluation.summary,
    },
    systems: results.map((result) => ({
      name: result.system,
      success: result.success,
      duration: result.duration,
      priority: result.priority,
      summary: extractSystemSummary(result),
    })),
    violations: evaluation.violations.sort((a, b) => (a.priority || 10) - (b.priority || 10)),
    warnings: evaluation.warnings.sort((a, b) => (a.priority || 10) - (b.priority || 10)),
    recommendations: generateRecommendations(evaluation),
  }

  return report
}

/**
 * システムサマリー抽出
 */
function extractSystemSummary(result) {
  if (!result.success) {
    return { error: result.error }
  }

  try {
    switch (result.system) {
      case 'License Verification':
        return {
          packages: result.results.totalPackages || 0,
          violations: result.results.violations || 0,
          prohibited: result.results.prohibited || 0,
        }
      case 'API Change Detection':
        return {
          routesMonitored: result.results.routes || 0,
          changes: result.results.changes?.length || 0,
          breakingChanges: result.results.breakingChanges || 0,
        }
      case 'Performance Regression':
        return {
          metrics: Object.keys(result.results.metrics || {}).length,
          regressions: result.results.regressions || 0,
          improvements: result.results.improvements?.length || 0,
        }
      case 'Secret Detection':
        return {
          filesScanned: result.results.stats?.filesScanned || 0,
          secretsFound: result.results.stats?.secretsFound || 0,
        }
      case 'TypeScript Strict Mode':
        return {
          filesAnalyzed: Object.keys(result.results.stats?.byFile || {}).length,
          totalErrors: result.results.stats?.total || 0,
          criticalErrors: result.results.stats?.bySeverity?.critical || 0,
        }
      default:
        return { status: 'completed' }
    }
  } catch (error) {
    return { error: 'Failed to extract summary' }
  }
}

/**
 * 改善推奨事項生成
 */
function generateRecommendations(evaluation) {
  const recommendations = []

  // 優先度順でソートされた違反を分析
  const criticalViolations = evaluation.violations.filter((v) => v.severity === 'critical')
  const highViolations = evaluation.violations.filter((v) => v.severity === 'high')

  if (criticalViolations.length > 0) {
    recommendations.push({
      priority: 1,
      type: 'immediate_action',
      title: '🚨 緊急対応必要',
      description: 'Critical レベルの問題を即座に修正',
      actions: criticalViolations.slice(0, 3).map((v) => ({
        system: v.system,
        action: v.message,
      })),
    })
  }

  if (highViolations.length > 0) {
    recommendations.push({
      priority: 2,
      type: 'high_priority',
      title: '⚠️ 高優先度対応',
      description: '24時間以内の対応を推奨',
      actions: highViolations.slice(0, 3).map((v) => ({
        system: v.system,
        action: v.message,
      })),
    })
  }

  // システム別推奨事項
  const failedSystems = evaluation.violations.filter((v) => v.type === 'system_failure').map((v) => v.system)

  if (failedSystems.length > 0) {
    recommendations.push({
      priority: 1,
      type: 'system_recovery',
      title: '🔧 システム復旧',
      description: '失敗したシステムの調査・修復',
      actions: failedSystems.map((system) => ({
        system,
        action: 'システムログの確認と問題解決',
      })),
    })
  }

  return recommendations
}

/**
 * レポート出力
 */
function outputReport(report) {
  // コンソール出力
  console.log('\n' + '='.repeat(80))
  console.log('🏆 包括的品質ゲート結果')
  console.log('='.repeat(80))

  console.log(`📊 品質ゲート: ${report.gateConfig}`)
  console.log(`⏱️  実行時間: ${report.duration}`)
  console.log(`🎯 総合判定: ${report.overall.passed ? '✅ PASS' : '❌ FAIL'}`)

  console.log('\n📈 システム別結果:')
  report.systems.forEach((system) => {
    const icon = system.success ? '✅' : '❌'
    const priority = '★'.repeat(Math.min(system.priority, 5))
    console.log(`   ${icon} ${system.name.padEnd(25)} ${system.duration.padStart(8)} ${priority}`)

    if (system.summary && Object.keys(system.summary).length > 0) {
      const summaryText = Object.entries(system.summary)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ')
      console.log(`      📋 ${summaryText}`)
    }
  })

  // 違反表示
  if (report.violations.length > 0) {
    console.log('\n🚫 品質ゲート違反:')
    report.violations.forEach((violation, index) => {
      const severityIcon = violation.severity === 'critical' ? '🔴' : violation.severity === 'high' ? '🟡' : '🟠'
      console.log(`   ${index + 1}. ${severityIcon} [${violation.system}] ${violation.message}`)
    })
  }

  // 警告表示
  if (report.warnings.length > 0) {
    console.log('\n⚠️ 警告:')
    report.warnings.slice(0, 5).forEach((warning, index) => {
      console.log(`   ${index + 1}. 🟡 [${warning.system}] ${warning.message}`)
    })

    if (report.warnings.length > 5) {
      console.log(`   ... +${report.warnings.length - 5}件の警告`)
    }
  }

  // 推奨事項表示
  if (report.recommendations.length > 0) {
    console.log('\n💡 推奨事項:')
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.title}`)
      console.log(`      ${rec.description}`)
      if (rec.actions && rec.actions.length > 0) {
        rec.actions.forEach((action, actionIndex) => {
          console.log(`      ${actionIndex + 1}) [${action.system}] ${action.action}`)
        })
      }
      console.log('')
    })
  }

  console.log('='.repeat(80))

  // JSONファイル保存
  try {
    fs.writeFileSync(CONFIG.execution.reportFile, JSON.stringify(report, null, 2))
    console.log(`📄 詳細レポート: ${CONFIG.execution.reportFile}`)
  } catch (error) {
    console.log(`⚠️  レポート保存失敗: ${error.message}`)
  }
}

// ===========================================
// メイン処理
// ===========================================

async function runComprehensiveQualityGate() {
  const startTime = Date.now()

  console.log('🏗️  BoxLog 包括的品質ゲートシステム')
  console.log('Phase 2 + Phase 3 (a,b,c) 完全統合品質管理\n')

  try {
    // 品質ゲート設定決定
    const gateLevel = process.argv.includes('--enterprise')
      ? 'enterprise'
      : process.argv.includes('--production')
        ? 'production'
        : 'development'

    const gateConfig = CONFIG.qualityGates[gateLevel]
    console.log(`🎯 品質ゲートレベル: ${gateConfig.name}`)
    console.log(`📋 ${gateConfig.description}\n`)

    // 全品質システム実行
    const execution = await runAllQualitySystems()

    // 品質ゲート評価
    console.log('\n🏁 品質ゲート評価中...')
    const evaluation = evaluateQualityGate(execution.results, gateConfig)

    // 実行時間計算
    const totalDuration = Date.now() - startTime

    // レポート生成・出力
    const report = generateQualityReport(execution.results, evaluation, `${totalDuration}ms`)
    outputReport(report)

    return {
      success: evaluation.passed,
      report,
      evaluation,
      execution,
    }
  } catch (error) {
    console.error('❌ Comprehensive Quality Gate failed:', error)
    return {
      success: false,
      error: error.message,
      report: null,
    }
  }
}

// ===========================================
// 実行部分
// ===========================================

if (require.main === module) {
  const verboseMode = process.argv.includes('--verbose')
  const _forceRun = process.argv.includes('--force')

  runComprehensiveQualityGate()
    .then((result) => {
      if (verboseMode && result.report) {
        console.log('\n📊 詳細レポート:')
        console.log(JSON.stringify(result.report, null, 2))
      }

      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Comprehensive Quality Gate execution failed:', error)
      process.exit(1)
    })
}

module.exports = { runComprehensiveQualityGate, CONFIG }
