'use client'

/**
 * 品質ダッシュボードページ
 * 品質メトリクスの可視化とトレンド分析
 */

import React, { useEffect, useState } from 'react'

interface QualityMetrics {
  timestamp: string
  score: number
  grade: string
  status: string
  codeQuality: {
    eslint: { errors: number; warnings: number }
    typescript: { errors: number }
    prettier: { unformatted: number }
  }
  testing: {
    coverage: { lines: number; branches: number; functions: number; statements: number }
    testCount: number
    passRate: number
  }
  performance: {
    bundleSize: { main: number; total: number }
    buildTime: number
  }
  technicalDebt: {
    todoCount: number
    complexityScore: number
  }
  recommendations: Array<{
    type: string
    category: string
    message: string
    action: string
    effort: string
    impact: string
  }>
}

const QualityDashboard: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<QualityMetrics | null>(null)
  const [_historicalData, setHistoricalData] = useState<QualityMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQualityData()
  }, [])

  const loadQualityData = async () => {
    try {
      // 実際の実装では、APIエンドポイントから品質データを取得
      // ここではデモデータを使用
      const demoData: QualityMetrics = {
        timestamp: new Date().toISOString(),
        score: 56,
        grade: 'F',
        status: '危険',
        codeQuality: {
          eslint: { errors: 0, warnings: 0 },
          typescript: { errors: 2177 },
          prettier: { unformatted: 0 }
        },
        testing: {
          coverage: { lines: 0, branches: 0, functions: 0, statements: 0 },
          testCount: 0,
          passRate: 0
        },
        performance: {
          bundleSize: { main: 0, total: 0 },
          buildTime: 0
        },
        technicalDebt: {
          todoCount: 22,
          complexityScore: 0
        },
        recommendations: [
          {
            type: 'critical',
            category: 'maintainability',
            message: 'TypeScriptエラーが2177件あります',
            action: '型定義の修正が必要です',
            effort: 'high',
            impact: 'high'
          }
        ]
      }

      setCurrentMetrics(demoData)
      setHistoricalData([demoData]) // 実際にはAPIから履歴データを取得
      setLoading(false)
    } catch (err) {
      setError('品質データの読み込みに失敗しました')
      setLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return colors.success.DEFAULT
    if (score >= 80) return colors.success.light
    if (score >= 70) return colors.warning.DEFAULT
    if (score >= 60) return colors.warning.dark
    return colors.error.DEFAULT
  }

  const getGradeEmoji = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      A: '🏆',
      B: '🥈',
      C: '🥉',
      D: '⚠️',
      F: '🚨'
    }
    return gradeMap[grade] || '❓'
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.background.base} flex items-center justify-center`}>
        <div className={`${colors.text.base} ${typography.body.lg}`}>
          品質データ読み込み中...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${colors.background.base} flex items-center justify-center`}>
        <div className={`${colors.error.DEFAULT} ${typography.body.lg}`}>
          {error}
        </div>
      </div>
    )
  }

  if (!currentMetrics) {
    return (
      <div className={`min-h-screen ${colors.background.base} flex items-center justify-center`}>
        <div className={`${colors.text.muted} ${typography.body.lg}`}>
          品質データが見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${colors.background.base} ${spacing.page.padding}`}>
      {/* ヘッダー */}
      <div className={`${spacing.section.margin} border-b ${colors.border.base} ${spacing.section.paddingBottom}`}>
        <h1 className={`${typography.heading.h1} ${colors.text.base}`}>
          📊 BoxLog品質ダッシュボード
        </h1>
        <p className={`${typography.body.base} ${colors.text.muted} mt-2`}>
          最終更新: {new Date(currentMetrics.timestamp).toLocaleString('ja-JP')}
        </p>
      </div>

      {/* 総合評価カード */}
      <div className={`${spacing.section.margin}`}>
        <div className={`${colors.background.card} ${rounded.component.card.lg} ${spacing.component.padding.lg} shadow-lg border ${colors.border.base}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${typography.heading.h2} ${colors.text.base} mb-2`}>
                総合品質スコア
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className={`${typography.heading.h1} font-bold`}
                  style={{ color: getScoreColor(currentMetrics.score) }}
                >
                  {currentMetrics.score}/100
                </span>
                <div className="text-center">
                  <div className={`text-4xl`}>
                    {getGradeEmoji(currentMetrics.grade)}
                  </div>
                  <div className={`${typography.heading.h3} ${colors.text.base}`}>
                    グレード {currentMetrics.grade}
                  </div>
                </div>
              </div>
              <p className={`${typography.body.lg} ${colors.text.muted} mt-2`}>
                状態: {currentMetrics.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メトリクス詳細 */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${spacing.section.margin}`}>
        {/* コード品質 */}
        <div className={`${colors.background.card} ${rounded.component.card.lg} ${spacing.component.padding.lg} shadow border ${colors.border.base}`}>
          <h3 className={`${typography.heading.h3} ${colors.text.base} mb-4`}>
            🔍 コード品質
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>ESLintエラー</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {currentMetrics.codeQuality.eslint.errors}件
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>ESLint警告</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {currentMetrics.codeQuality.eslint.warnings}件
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>TypeScriptエラー</span>
              <span className={`${typography.body.base} ${currentMetrics.codeQuality.typescript.errors > 0 ? colors.error.DEFAULT : colors.success.DEFAULT} font-semibold`}>
                {currentMetrics.codeQuality.typescript.errors}件
              </span>
            </div>
          </div>
        </div>

        {/* テスト */}
        <div className={`${colors.background.card} ${rounded.component.card.lg} ${spacing.component.padding.lg} shadow border ${colors.border.base}`}>
          <h3 className={`${typography.heading.h3} ${colors.text.base} mb-4`}>
            🧪 テスト
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>行カバレッジ</span>
              <span className={`${typography.body.base} ${(currentMetrics.testing.coverage?.lines ?? 0) >= 80 ? colors.success.DEFAULT : colors.warning.DEFAULT} font-semibold`}>
                {currentMetrics.testing.coverage?.lines ?? 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>分岐カバレッジ</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {currentMetrics.testing.coverage.branches}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>関数カバレッジ</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {currentMetrics.testing.coverage.functions}%
              </span>
            </div>
          </div>
        </div>

        {/* 技術的負債 */}
        <div className={`${colors.background.card} ${rounded.component.card.lg} ${spacing.component.padding.lg} shadow border ${colors.border.base}`}>
          <h3 className={`${typography.heading.h3} ${colors.text.base} mb-4`}>
            🏗️ 技術的負債
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>TODO/FIXME</span>
              <span className={`${typography.body.base} ${currentMetrics.technicalDebt.todoCount > 20 ? colors.warning.DEFAULT : colors.text.base} font-semibold`}>
                {currentMetrics.technicalDebt.todoCount}個
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>高複雑度関数</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {currentMetrics.technicalDebt.complexityScore}個
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${typography.body.base} ${colors.text.muted}`}>バンドルサイズ</span>
              <span className={`${typography.body.base} ${colors.text.base} font-semibold`}>
                {(currentMetrics.performance.bundleSize.total / 1024 / 1024).toFixed(2)}MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 改善提案 */}
      {currentMetrics.recommendations.length > 0 && (
        <div className={`${spacing.section.margin}`}>
          <div className={`${colors.background.card} ${rounded.component.card.lg} ${spacing.component.padding.lg} shadow border ${colors.border.base}`}>
            <h3 className={`${typography.heading.h3} ${colors.text.base} mb-4`}>
              💡 改善提案
            </h3>
            <div className="space-y-4">
              {currentMetrics.recommendations.map((recommendation) => (
                <div
                  key={`${recommendation.type}-${recommendation.category}-${recommendation.message.slice(0, 20)}`}
                  className={`${colors.background.muted} ${rounded.component.card.md} ${spacing.component.padding.md} border-l-4`}
                  style={{ borderLeftColor: recommendation.type === 'critical' ? '#ef4444' : recommendation.type === 'high' ? '#f97316' : '#eab308' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${typography.caption.base} px-2 py-1 ${rounded.component.badge.sm}`}
                          style={{
                            backgroundColor: recommendation.type === 'critical' ? '#fee2e2' : recommendation.type === 'high' ? '#fed7aa' : '#fef3c7',
                            color: recommendation.type === 'critical' ? '#dc2626' : recommendation.type === 'high' ? '#ea580c' : '#d97706'
                          }}
                        >
                          {recommendation.type.toUpperCase()}
                        </span>
                        <span className={`${typography.caption.base} ${colors.text.muted}`}>
                          {recommendation.category}
                        </span>
                      </div>
                      <p className={`${typography.body.base} ${colors.text.base} mb-2`}>
                        {recommendation.message}
                      </p>
                      <p className={`${typography.body.sm} ${colors.text.muted}`}>
                        対策: {recommendation.action}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`${typography.caption.base} ${colors.text.muted}`}>
                          工数: {recommendation.effort}
                        </span>
                        <span className={`${typography.caption.base} ${colors.text.muted}`}>
                          影響度: {recommendation.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className={`${spacing.section.margin} flex gap-4`}>
        <button
          type="button"
          onClick={() => { window.location.reload() }}
          className={`${colors.primary.DEFAULT} ${colors.background.white} ${spacing.component.padding.md} ${rounded.component.button.md} ${typography.button.base} hover:opacity-80 transition-opacity`}
        >
          📊 レポート更新
        </button>
        <button
          type="button"
          onClick={() => { window.open('/reports/quality/', '_blank') }}
          className={`${colors.secondary.DEFAULT} ${colors.background.white} ${spacing.component.padding.md} ${rounded.component.button.md} ${typography.button.base} hover:opacity-80 transition-opacity`}
        >
          📁 詳細レポート
        </button>
        <button
          type="button"
          onClick={() => { window.open('https://github.com/t3-nico/boxlog-app/issues?q=label%3Aquality-improvement', '_blank') }}
          className={`${colors.accent.DEFAULT} ${colors.background.white} ${spacing.component.padding.md} ${rounded.component.button.md} ${typography.button.base} hover:opacity-80 transition-opacity`}
        >
          🎯 改善Issue
        </button>
      </div>

      {/* フッター */}
      <div className={`${spacing.section.margin} text-center border-t ${colors.border.base} ${spacing.component.padding.lg}`}>
        <p className={`${typography.caption.base} ${colors.text.muted}`}>
          BoxLog 自動品質レポートシステム v1.0 | Issue #356
        </p>
      </div>
    </div>
  )
}

export default QualityDashboard