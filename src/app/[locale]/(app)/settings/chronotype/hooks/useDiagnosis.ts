import { useState, useCallback } from 'react'

import type { ChronotypeType } from '@/types/chronotype'

import { diagnosisQuestions, calculateDiagnosisResult } from '../chronotype.diagnosis'

export const useDiagnosis = (onDiagnosisComplete?: (result: ChronotypeType) => void) => {
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null)

  const startDiagnosis = useCallback(() => {
    setShowDiagnosis(true)
    setCurrentQuestion(0)
    setAnswers({})
    setDiagnosisResult(null)

    // ページトップにスムーズスクロール
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }, 100)
  }, [])

  const resetDiagnosis = useCallback(() => {
    setShowDiagnosis(false)
    setCurrentQuestion(0)
    setAnswers({})
    setDiagnosisResult(null)
  }, [])

  const handleCloseDiagnosis = useCallback(() => {
    setShowDiagnosis(false)
  }, [])

  const handleAnswerSelect = useCallback(
    (questionId: string, value: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }))

      if (currentQuestion < diagnosisQuestions.length - 1) {
        setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300)
      } else {
        // 診断完了 - 結果を計算
        const finalAnswers = { ...answers, [questionId]: value }
        setTimeout(() => {
          const result = calculateDiagnosisResult(finalAnswers)
          setDiagnosisResult(result)
          if (onDiagnosisComplete) {
            onDiagnosisComplete(result as ChronotypeType)
          }
        }, 300)
      }
    },
    [currentQuestion, answers, onDiagnosisComplete]
  )

  const handleAnswerClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const questionId = event.currentTarget.dataset.questionId
      const optionValue = Number(event.currentTarget.dataset.optionValue)
      if (questionId && !isNaN(optionValue)) {
        handleAnswerSelect(questionId, optionValue)
      }
    },
    [handleAnswerSelect]
  )

  const progress = ((currentQuestion + 1) / diagnosisQuestions.length) * 100

  return {
    showDiagnosis,
    currentQuestion,
    diagnosisResult,
    progress,
    startDiagnosis,
    resetDiagnosis,
    handleCloseDiagnosis,
    handleAnswerClick,
    diagnosisQuestions,
  }
}
