'use client'

import { memo } from 'react'

import { Clock, GraduationCap, Moon, Sun } from 'lucide-react'

import { colors, rounded, spacing, typography } from '@/config/theme'

import { chronoTypeProfiles } from '../chronotype.constants'
import type { DiagnosisQuestion } from '../chronotype.diagnosis'

interface DiagnosisSectionProps {
  diagnosisResult: string | null
  currentQuestion: number
  diagnosisQuestions: DiagnosisQuestion[]
  progress: number
  onAnswerClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  onResetDiagnosis: () => void
  onCloseDiagnosis: () => void
}

export const DiagnosisSection = memo(({
  diagnosisResult,
  currentQuestion,
  diagnosisQuestions,
  progress,
  onAnswerClick,
  onResetDiagnosis,
  onCloseDiagnosis,
}: DiagnosisSectionProps) => {
  if (diagnosisResult) {
    // 診断結果表示
    return (
      <div className="text-center">
        <h2 className={`${typography.heading.h2} ${colors.text.primary} mb-4`}>🎉 診断完了！</h2>
        <div className="mb-6">
          <p className={`${typography.body.sm} ${colors.text.secondary} mb-4`}>あなたのクロノタイプは...</p>
          <div
            className={`inline-block p-6 ${colors.semantic.info.light} ${rounded.component.card.base} border ${colors.semantic.info.border}`}
          >
            <div className="mb-2 flex items-center gap-3">
              {diagnosisResult === 'lion' && (
                <Sun className={`h-8 w-8 ${colors.semantic.warning.text}`} data-slot="icon" />
              )}
              {diagnosisResult === 'bear' && (
                <Clock className={`h-8 w-8 ${colors.semantic.info.text}`} data-slot="icon" />
              )}
              {diagnosisResult === 'wolf' && (
                <Moon className={`h-8 w-8 ${colors.primary.text}`} data-slot="icon" />
              )}
              {diagnosisResult === 'dolphin' && (
                <GraduationCap className={`h-8 w-8 ${colors.secondary.text}`} data-slot="icon" />
              )}
              <h3 className={`${typography.heading.h3} font-bold ${colors.text.primary}`}>
                {chronoTypeProfiles.find((p) => p.id === diagnosisResult)?.name}
              </h3>
            </div>
            <p className={colors.text.secondary}>
              {chronoTypeProfiles.find((p) => p.id === diagnosisResult)?.description}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onResetDiagnosis}
            className={`px-4 py-2 ${typography.body.sm} font-medium ${colors.text.secondary} ${colors.background.card} border ${colors.border.DEFAULT} ${rounded.component.button.md} transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700`}
          >
            もう一度診断
          </button>
          <button
            type="button"
            onClick={onCloseDiagnosis}
            className={`px-4 py-2 ${typography.body.sm} font-medium ${colors.primary.text} ${colors.primary.DEFAULT} ${colors.primary.hover} ${rounded.component.button.md} transition-colors`}
          >
            設定に進む
          </button>
        </div>
      </div>
    )
  }

  // 質問表示
  const question =
    currentQuestion >= 0 && currentQuestion < diagnosisQuestions.length
      ? diagnosisQuestions[currentQuestion]
      : null

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className={`${typography.heading.h2} ${colors.text.primary}`}>クロノタイプ診断</h2>
          <span className={`${typography.body.sm} ${colors.text.muted}`}>
            {currentQuestion + 1} / {diagnosisQuestions.length}
          </span>
        </div>
        <div className={`w-full ${colors.background.elevated} ${rounded.component.button.pill} h-2`}>
          <div
            className={`${colors.primary.DEFAULT} h-2 ${rounded.component.button.pill} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
          {question?.question || ''}
        </h3>
        <div className="space-y-3">
          {(question?.options || []).map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={onAnswerClick}
              data-question-id={question?.id || ''}
              data-option-value={option.value}
              className={`w-full border p-4 text-left ${colors.border.DEFAULT} ${rounded.component.card.base} transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-600 dark:hover:bg-neutral-800`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

DiagnosisSection.displayName = 'DiagnosisSection'
