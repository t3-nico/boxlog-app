#!/usr/bin/env node

/**
 * BoxLog Compliance Report Generator
 *
 * 国際規格準拠レポートの自動生成
 * - WCAG 2.1 Level AA
 * - GDPR Compliance
 * - SOC 2 Type II
 * - CCPA Compliance
 */

const fs = require('fs')
const path = require('path')

const { ESLint } = require('eslint')

// レポート設定
const REPORT_CONFIG = {
  outputDir: 'compliance-reports',
  formats: ['json', 'html', 'csv'],
  regulations: {
    wcag: {
      name: 'WCAG 2.1 Level AA',
      rules: ['jsx-a11y/'],
      severity: 'error',
      description: 'Web Content Accessibility Guidelines',
    },
    gdpr: {
      name: 'GDPR Compliance',
      rules: [
        'boxlog-compliance/no-personal-data-logging',
        'boxlog-compliance/require-consent-tracking',
        'boxlog-compliance/secure-data-transmission',
        'boxlog-compliance/no-third-party-tracking',
      ],
      severity: 'error',
      description: 'EU General Data Protection Regulation',
    },
    soc2: {
      name: 'SOC 2 Type II',
      rules: [
        'boxlog-compliance/no-hardcoded-secrets',
        'boxlog-compliance/require-input-validation',
        'boxlog-compliance/require-audit-logging',
        'boxlog-compliance/secure-error-handling',
        'boxlog-compliance/data-encryption-enforcement',
      ],
      severity: 'error',
      description: 'Service Organization Control 2',
    },
    dataRetention: {
      name: 'Data Retention Policy',
      rules: [
        'boxlog-compliance/enforce-data-retention-limits',
        'boxlog-compliance/require-deletion-mechanism',
        'boxlog-compliance/automated-data-cleanup',
        'boxlog-compliance/data-anonymization',
      ],
      severity: 'warn',
      description: 'Data Protection and Retention Policies',
    },
  },
}

class ComplianceReporter {
  constructor() {
    this.eslint = new ESLint({
      configFile: './config/eslint/.eslintrc.compliance.json',
      useEslintrc: false,
    })

    this.timestamp = new Date().toISOString()
    this.reportId = `compliance-${Date.now()}`

    // レポート出力ディレクトリの作成
    if (!fs.existsSync(REPORT_CONFIG.outputDir)) {
      fs.mkdirSync(REPORT_CONFIG.outputDir, { recursive: true })
    }
  }

  /**
   * ESLintルールの結果をフィルタリング
   */
  filterRules(results, rulePrefix) {
    const filteredResults = []

    results.forEach((result) => {
      const filteredMessages = result.messages.filter((message) => {
        return message.ruleId && message.ruleId.startsWith(rulePrefix)
      })

      if (filteredMessages.length > 0) {
        filteredResults.push({
          ...result,
          messages: filteredMessages,
          errorCount: filteredMessages.filter((m) => m.severity === 2).length,
          warningCount: filteredMessages.filter((m) => m.severity === 1).length,
        })
      }
    })

    return filteredResults
  }

  /**
   * 規制別のコンプライアンス分析
   */
  analyzeCompliance(results) {
    const complianceAnalysis = {}

    Object.entries(REPORT_CONFIG.regulations).forEach(([key, regulation]) => {
      const regulationResults = []

      regulation.rules.forEach((rulePattern) => {
        const ruleResults = this.filterRules(results, rulePattern)
        regulationResults.push(...ruleResults)
      })

      const totalErrors = regulationResults.reduce((sum, result) => sum + result.errorCount, 0)
      const totalWarnings = regulationResults.reduce((sum, result) => sum + result.warningCount, 0)
      const totalFiles = regulationResults.length
      const affectedFiles = regulationResults.filter((r) => r.errorCount > 0 || r.warningCount > 0).length

      const complianceScore =
        totalFiles > 0 ? Math.max(0, 100 - (totalErrors * 10 + totalWarnings * 5) / totalFiles) : 100

      complianceAnalysis[key] = {
        regulation: regulation.name,
        description: regulation.description,
        compliant: totalErrors === 0,
        score: Math.round(complianceScore),
        totalFiles,
        affectedFiles,
        errorCount: totalErrors,
        warningCount: totalWarnings,
        results: regulationResults,
        status: this.getComplianceStatus(totalErrors, totalWarnings),
        recommendations: this.generateRecommendations(key, totalErrors, totalWarnings),
      }
    })

    return complianceAnalysis
  }

  /**
   * コンプライアンス状況の判定
   */
  getComplianceStatus(errors, warnings) {
    if (errors === 0 && warnings === 0) return 'COMPLIANT'
    if (errors === 0) return 'MINOR_ISSUES'
    if (errors <= 5) return 'MAJOR_ISSUES'
    return 'NON_COMPLIANT'
  }

  /**
   * 修正推奨事項の生成
   */
  generateRecommendations(regulation, errors, warnings) {
    const recommendations = []

    if (regulation === 'gdpr' && errors > 0) {
      recommendations.push('個人データの処理について法的根拠を確認してください')
      recommendations.push('データ保護設計原則に従ってコードを見直してください')
    }

    if (regulation === 'soc2' && errors > 0) {
      recommendations.push('セキュリティ統制の実装を強化してください')
      recommendations.push('監査ログの記録を確実に行ってください')
    }

    if (regulation === 'wcag' && (errors > 0 || warnings > 0)) {
      recommendations.push('アクセシビリティ要件を満たすよう修正してください')
      recommendations.push('スクリーンリーダー対応を確認してください')
    }

    return recommendations
  }

  /**
   * 総合レポートの生成
   */
  async generateComplianceReport() {
    console.log('🔍 Compliance audit started...')

    try {
      // ESLint実行
      const results = await this.eslint.lintFiles(['src/**/*.{ts,tsx}'])

      // 規制別分析
      const compliance = this.analyzeCompliance(results)

      // 総合スコア計算
      const overallScore = this.calculateOverallScore(compliance)

      // レポートデータ構築
      const report = {
        metadata: {
          reportId: this.reportId,
          timestamp: this.timestamp,
          version: '1.0.0',
          auditType: 'International Compliance',
          regulations: Object.keys(REPORT_CONFIG.regulations),
        },
        summary: {
          overallCompliant: overallScore.compliant,
          overallScore: overallScore.score,
          totalFiles: results.length,
          totalErrors: results.reduce((sum, r) => sum + r.errorCount, 0),
          totalWarnings: results.reduce((sum, r) => sum + r.warningCount, 0),
          criticalIssues: overallScore.criticalIssues,
          status: overallScore.status,
        },
        compliance,
        recommendations: this.generateGlobalRecommendations(compliance),
        nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      }

      // レポート出力
      await this.saveReports(report)

      console.log('📊 Compliance audit completed')
      console.log(`📈 Overall Score: ${overallScore.score}/100`)
      console.log(`📋 Status: ${overallScore.status}`)

      return report
    } catch (error) {
      console.error('❌ Compliance audit failed:', error)
      throw error
    }
  }

  /**
   * 総合スコア計算
   */
  calculateOverallScore(compliance) {
    const regulations = Object.values(compliance)
    const totalScore = regulations.reduce((sum, reg) => sum + reg.score, 0)
    const averageScore = regulations.length > 0 ? totalScore / regulations.length : 0

    const criticalIssues = regulations.filter((reg) => reg.errorCount > 0).length
    const compliant = regulations.every((reg) => reg.compliant)

    let status = 'COMPLIANT'
    if (!compliant) {
      if (criticalIssues > 2) status = 'NON_COMPLIANT'
      else if (criticalIssues > 0) status = 'MAJOR_ISSUES'
      else status = 'MINOR_ISSUES'
    }

    return {
      score: Math.round(averageScore),
      compliant,
      criticalIssues,
      status,
    }
  }

  /**
   * グローバル推奨事項生成
   */
  generateGlobalRecommendations(compliance) {
    const recommendations = []

    const nonCompliantRegulations = Object.entries(compliance)
      .filter(([_, reg]) => !reg.compliant)
      .map(([key, _]) => key)

    if (nonCompliantRegulations.includes('gdpr')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Legal Compliance',
        action: 'GDPR違反の修正を最優先で実施してください',
      })
    }

    if (nonCompliantRegulations.includes('soc2')) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security',
        action: 'セキュリティ統制の強化を実施してください',
      })
    }

    if (nonCompliantRegulations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Maintenance',
        action: '現在のコンプライアンス状態を維持してください',
      })
    }

    return recommendations
  }

  /**
   * レポート保存
   */
  async saveReports(report) {
    const baseFilename = `${this.reportId}`

    // JSON形式
    const jsonPath = path.join(REPORT_CONFIG.outputDir, `${baseFilename}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
    console.log(`💾 JSON report saved: ${jsonPath}`)

    // HTML形式
    const htmlPath = path.join(REPORT_CONFIG.outputDir, `${baseFilename}.html`)
    const htmlContent = this.generateHTMLReport(report)
    fs.writeFileSync(htmlPath, htmlContent)
    console.log(`📄 HTML report saved: ${htmlPath}`)

    // CSV形式
    const csvPath = path.join(REPORT_CONFIG.outputDir, `${baseFilename}.csv`)
    const csvContent = this.generateCSVReport(report)
    fs.writeFileSync(csvPath, csvContent)
    console.log(`📊 CSV report saved: ${csvPath}`)
  }

  /**
   * HTMLレポート生成
   */
  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BoxLog Compliance Report - ${report.metadata.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
        .score { font-size: 48px; font-weight: bold; color: ${report.summary.overallScore >= 90 ? '#28a745' : report.summary.overallScore >= 70 ? '#ffc107' : '#dc3545'}; }
        .status { font-size: 24px; margin: 10px 0; padding: 10px 20px; border-radius: 6px; display: inline-block; color: white; background: ${this.getStatusColor(report.summary.status)}; }
        .regulation { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 6px; }
        .compliant { border-color: #28a745; background: #f8fff8; }
        .non-compliant { border-color: #dc3545; background: #fff8f8; }
        .regulation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .regulation-score { font-size: 24px; font-weight: bold; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #007acc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ BoxLog Compliance Report</h1>
            <div class="score">${report.summary.overallScore}/100</div>
            <div class="status">${report.summary.status}</div>
            <p>Generated: ${new Date(report.metadata.timestamp).toLocaleString('ja-JP')}</p>
        </div>

        <div class="stats">
            <div class="stat">
                <h3>Total Files</h3>
                <div style="font-size: 24px; font-weight: bold;">${report.summary.totalFiles}</div>
            </div>
            <div class="stat">
                <h3>Errors</h3>
                <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${report.summary.totalErrors}</div>
            </div>
            <div class="stat">
                <h3>Warnings</h3>
                <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${report.summary.totalWarnings}</div>
            </div>
            <div class="stat">
                <h3>Critical Issues</h3>
                <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${report.summary.criticalIssues}</div>
            </div>
        </div>

        ${Object.entries(report.compliance)
          .map(
            ([_key, reg]) => `
        <div class="regulation ${reg.compliant ? 'compliant' : 'non-compliant'}">
            <div class="regulation-header">
                <h2>${reg.regulation}</h2>
                <div class="regulation-score" style="color: ${reg.score >= 90 ? '#28a745' : reg.score >= 70 ? '#ffc107' : '#dc3545'}">${reg.score}/100</div>
            </div>
            <p>${reg.description}</p>
            <div class="stats">
                <div class="stat">
                    <h4>Status</h4>
                    <div>${reg.status}</div>
                </div>
                <div class="stat">
                    <h4>Affected Files</h4>
                    <div>${reg.affectedFiles}/${reg.totalFiles}</div>
                </div>
                <div class="stat">
                    <h4>Errors</h4>
                    <div style="color: #dc3545;">${reg.errorCount}</div>
                </div>
                <div class="stat">
                    <h4>Warnings</h4>
                    <div style="color: #ffc107;">${reg.warningCount}</div>
                </div>
            </div>
            ${
              reg.recommendations.length > 0
                ? `
                <div class="recommendations">
                    <h4>🔧 Recommendations</h4>
                    ${reg.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join('')}
                </div>
            `
                : ''
            }
        </div>
        `
          )
          .join('')}

        <div class="recommendations">
            <h3>🎯 Global Recommendations</h3>
            ${report.recommendations
              .map(
                (rec) => `
                <div class="recommendation">
                    <strong>[${rec.priority}] ${rec.category}:</strong> ${rec.action}
                </div>
            `
              )
              .join('')}
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>Next audit scheduled: ${new Date(report.nextAuditDate).toLocaleDateString('ja-JP')}</p>
            <p>Report ID: ${report.metadata.reportId}</p>
        </div>
    </div>
</body>
</html>`
  }

  /**
   * CSVレポート生成
   */
  generateCSVReport(report) {
    const headers = ['Regulation', 'Score', 'Status', 'Files', 'Errors', 'Warnings', 'Compliant']
    const rows = Object.entries(report.compliance).map(([_key, reg]) => [
      reg.regulation,
      reg.score,
      reg.status,
      reg.totalFiles,
      reg.errorCount,
      reg.warningCount,
      reg.compliant ? 'Yes' : 'No',
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  /**
   * ステータス色の取得
   */
  getStatusColor(status) {
    switch (status) {
      case 'COMPLIANT':
        return '#28a745'
      case 'MINOR_ISSUES':
        return '#ffc107'
      case 'MAJOR_ISSUES':
        return '#fd7e14'
      case 'NON_COMPLIANT':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }
}

// CLI実行
async function main() {
  const reporter = new ComplianceReporter()

  try {
    const report = await reporter.generateComplianceReport()

    // Slack通知（環境変数でWebhook URLが設定されている場合）
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(report)
    }

    // 終了コード設定
    process.exit(report.summary.overallCompliant ? 0 : 1)
  } catch (error) {
    console.error('❌ Compliance report generation failed:', error)
    process.exit(1)
  }
}

/**
 * Slack通知送信
 */
async function sendSlackNotification(report) {
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL
    const message = {
      text: `📊 BoxLog Compliance Report`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🛡️ BoxLog Compliance Audit Results',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Overall Score:* ${report.summary.overallScore}/100`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:* ${report.summary.status}`,
            },
            {
              type: 'mrkdwn',
              text: `*Errors:* ${report.summary.totalErrors}`,
            },
            {
              type: 'mrkdwn',
              text: `*Warnings:* ${report.summary.totalWarnings}`,
            },
          ],
        },
      ],
    }

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    console.log('📱 Slack notification sent')
  } catch (error) {
    console.warn('⚠️ Failed to send Slack notification:', error.message)
  }
}

// CLI実行時
if (require.main === module) {
  main()
}

module.exports = { ComplianceReporter }
