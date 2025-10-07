'use client'

import { memo } from 'react'

import { Clock, GraduationCap, Moon, Sun } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { getChronoTypeProfiles } from '../chronotype-profiles'
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
  const { t } = useI18n()
  const chronoTypeProfiles = getChronoTypeProfiles(t as import('@/features/i18n/lib').TranslationFunction)

  if (diagnosisResult) {
    // 診断結果表示
    return (
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          🎉 診断完了！
        </h2>
        <div className="mb-6">
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            あなたのクロノタイプは...
          </p>
          <div className="inline-block rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
            <div className="mb-2 flex items-center gap-3">
              {diagnosisResult === 'lion' && (
                <Sun className="h-8 w-8 text-yellow-600 dark:text-yellow-500" data-slot="icon" />
              )}
              {diagnosisResult === 'bear' && (
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" data-slot="icon" />
              )}
              {diagnosisResult === 'wolf' && (
                <Moon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" data-slot="icon" />
              )}
              {diagnosisResult === 'dolphin' && (
                <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" data-slot="icon" />
              )}
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {chronoTypeProfiles.find((p) => p.id === diagnosisResult)?.name}
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {chronoTypeProfiles.find((p) => p.id === diagnosisResult)?.description}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onResetDiagnosis}
            className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            もう一度診断
          </button>
          <button
            type="button"
            onClick={onCloseDiagnosis}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            クロノタイプ診断
          </h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-500">
            {currentQuestion + 1} / {diagnosisQuestions.length}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
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
              className="w-full rounded-lg border border-neutral-200 p-4 text-left transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
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
