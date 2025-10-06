import { Clock, GraduationCap, Lightbulb, Moon } from 'lucide-react'

export const typeIconComponents = {
  focus: GraduationCap,
  creative: Lightbulb,
  rest: Moon,
  admin: Clock,
  sleep: () => '💤', // Simple function returning emoji string
}

/**
 * スケジュールタイプごとの色設定
 */
export const typeColors = {
  focus: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  creative: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  rest: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  admin: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  sleep: 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-500',
}

/**
 * 診断質問データは chronotype.diagnosis-questions.ts を参照してください
 */
