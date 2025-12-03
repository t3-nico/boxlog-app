/**
 * データ永続化関数
 */

import fs from 'fs'
import path from 'path'

import type { QualityAssessment, ReviewWorkflow } from './types'

/**
 * 評価データの保存
 */
export function saveAssessment(assessment: QualityAssessment, assessmentsPath: string): void {
  const filename = `${assessment.language}-${assessment.translationKey.replace(/\./g, '_')}-${Date.now()}.json`
  const filepath = path.join(assessmentsPath, filename)
  fs.writeFileSync(filepath, JSON.stringify(assessment, null, 2))
}

/**
 * レビューワークフローの保存
 */
export function saveReviewWorkflow(workflow: ReviewWorkflow, reviewsPath: string): void {
  const filename = `${workflow.language}-${workflow.translationKey.replace(/\./g, '_')}.json`
  const filepath = path.join(reviewsPath, filename)
  fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2))
}

/**
 * レビューワークフローの読み込み
 */
export function loadReviewWorkflow(
  translationKey: string,
  language: string,
  reviewsPath: string
): ReviewWorkflow | null {
  const filename = `${language}-${translationKey.replace(/\./g, '_')}.json`
  const filepath = path.join(reviewsPath, filename)

  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(content)
  }

  return null
}

/**
 * 評価データの読み込み
 */
export function loadAssessments(
  startDate: Date,
  endDate: Date,
  assessmentsPath: string,
  language?: string
): QualityAssessment[] {
  const assessments: QualityAssessment[] = []

  if (!fs.existsSync(assessmentsPath)) {
    return assessments
  }

  const files = fs.readdirSync(assessmentsPath)

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    if (language && !file.startsWith(language)) continue

    const filepath = path.join(assessmentsPath, file)
    const content = fs.readFileSync(filepath, 'utf-8')
    const assessment: QualityAssessment = JSON.parse(content)

    const reviewDate = new Date(assessment.reviewDate)
    if (reviewDate >= startDate && reviewDate <= endDate) {
      assessments.push(assessment)
    }
  }

  return assessments
}

/**
 * ディレクトリの初期化
 */
export function ensureDirectories(paths: string[]): void {
  paths.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}
