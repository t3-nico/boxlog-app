import type { TranslationFunction } from '@/features/i18n/lib'

import { getDiagnosisQuestions, type DiagnosisQuestion } from './chronotype.diagnosis-questions'

// Re-export for backward compatibility
export type { DiagnosisQuestion }

export const calculateDiagnosisResult = (
  answers: Record<string, number>,
  t: TranslationFunction
): 'lion' | 'bear' | 'wolf' | 'dolphin' => {
  const diagnosisQuestions = getDiagnosisQuestions(t)
  const typeScores = { lion: 0, bear: 0, wolf: 0, dolphin: 0 }

  diagnosisQuestions.forEach((question) => {
    const answer = answers[question.id]
    if (answer) {
      const selectedOption = question.options.find((opt) => opt.value === answer)
      if (selectedOption) {
        typeScores[selectedOption.type]++
      }
    }
  })

  // 最もスコアの高いタイプを返す
  const maxScore = Math.max(...Object.values(typeScores))
  const result = (Object.keys(typeScores) as Array<keyof typeof typeScores>).find(
    (type) => typeScores[type] === maxScore
  )

  return result || 'bear'
}
