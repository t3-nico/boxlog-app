/**
 * 翻訳品質レビュー - 定数
 */

import type { QualityLevel } from './types'

export const QUALITY_COLORS: Record<QualityLevel, string> = {
  excellent: 'text-green-600 bg-green-100',
  good: 'text-blue-600 bg-blue-100',
  acceptable: 'text-yellow-600 bg-yellow-100',
  needs_improvement: 'text-orange-600 bg-orange-100',
  poor: 'text-red-600 bg-red-100',
}

export const SEVERITY_COLORS = {
  critical: 'text-red-600',
  major: 'text-orange-600',
  minor: 'text-yellow-600',
}

export const ISSUE_TYPE_LABELS = {
  accuracy: '正確性',
  fluency: '流暢性',
  consistency: '一貫性',
  completeness: '完全性',
  cultural: '文化的適応',
  technical: '技術的正確性',
}

export function getQualityBadgeColor(level: QualityLevel): string {
  return QUALITY_COLORS[level] || 'text-gray-600 bg-gray-100'
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}
