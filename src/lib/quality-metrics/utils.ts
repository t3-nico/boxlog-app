/**
 * 品質メトリクスユーティリティ
 */

import type { QualityMetrics } from './types';

/**
 * 品質スコア計算（100点満点）
 */
export function calculateQualityScore(metrics: QualityMetrics): number {
  let score = 100;

  // ESLintエラー（-1点/エラー、最大-20点）
  score -= Math.min(20, metrics.codeQuality.eslint.errors);

  // TypeScriptエラー（-2点/エラー、最大-20点）
  score -= Math.min(20, metrics.codeQuality.typescript.errors * 2);

  // カバレッジ（80%未満で減点）
  const coverage = metrics.testing.coverage.lines;
  if (coverage < 80) {
    score -= Math.min(20, (80 - coverage) / 2);
  }

  // 技術的負債（TODO数、最大-10点）
  score -= Math.min(10, metrics.technicalDebt.todoCount / 5);

  // バンドルサイズ（5MB超で減点）
  const bundleMB = metrics.performance.bundleSize.total / (1024 * 1024);
  if (bundleMB > 5) {
    score -= Math.min(10, (bundleMB - 5) * 2);
  }

  return Math.max(0, Math.round(score));
}

/**
 * 品質グレード取得
 */
export function getQualityGrade(score: number): { grade: string; status: string } {
  if (score >= 90) return { grade: 'A', status: '優秀' };
  if (score >= 80) return { grade: 'B', status: '良好' };
  if (score >= 70) return { grade: 'C', status: '要改善' };
  if (score >= 60) return { grade: 'D', status: '問題あり' };
  return { grade: 'F', status: '危険' };
}
