/**
 * クロノタイプ診断モーダルコンポーネント
 */
'use client'

import { useState, useMemo } from 'react'

import type { ChronotypeType } from '@/types/chronotype'
import { useI18n } from '@/lib/i18n/hooks'
import type { TranslationFunction } from '@/lib/i18n'

import { getDiagnosisQuestions } from '../chronotype.diagnosis-questions'
import { calculateDiagnosisResult } from '../chronotype.diagnosis'

interface DiagnosisModalProps {
  onComplete: (result: ChronotypeType) => void
  onCancel: () => void
}

export function DiagnosisModal({ onComplete, onCancel }: DiagnosisModalProps) {
  const { t } = useI18n()
  const diagnosisQuestions = useMemo(() => getDiagnosisQuestions(t as TranslationFunction), [t])

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const progress = ((currentQuestion + 1) / diagnosisQuestions.length) * 100

  const handleAnswerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const questionId = e.currentTarget.dataset.questionId
    const optionValue = Number(e.currentTarget.dataset.optionValue)

    if (!questionId) return

    const newAnswers = { ...answers, [questionId]: optionValue }
    setAnswers(newAnswers)

    if (currentQuestion < diagnosisQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // 診断完了 - 結果を計算
      const result = calculateDiagnosisResult(newAnswers, t as TranslationFunction)
      onComplete(result)
    }
  }

  const currentQ = diagnosisQuestions[currentQuestion]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              クロノタイプ診断
            </h2>
            <span className="text-sm text-neutral-500 dark:text-neutral-500">
              {currentQuestion + 1} / {diagnosisQuestions.length}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{currentQ?.question}</h3>
          <div className="space-y-3">
            {currentQ?.options.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={handleAnswerClick}
                data-question-id={currentQ.id}
                data-option-value={option.value}
                className="w-full rounded-lg border border-neutral-300 p-4 text-left transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
