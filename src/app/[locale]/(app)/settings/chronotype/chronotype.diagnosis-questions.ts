/**
 * クロノタイプ診断質問データ
 */
import type { TranslationFunction } from '@/lib/i18n'

/**
 * クロノタイプ診断質問の型定義
 */
export interface DiagnosisQuestion {
  id: string
  question: string
  options: {
    value: number
    text: string
    type: 'lion' | 'bear' | 'wolf' | 'dolphin'
  }[]
}

/**
 * クロノタイプ診断質問データ
 */
export const getDiagnosisQuestions = (t: TranslationFunction): DiagnosisQuestion[] => [
  {
    id: '1',
    question: t('settings.chronotype.diagnosis.questions.bedtime'),
    options: [
      { value: 4, text: t('settings.chronotype.diagnosis.options.bedtime1'), type: 'lion' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.bedtime2'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.bedtime3'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.bedtimeIrregular'), type: 'dolphin' },
    ],
  },
  {
    id: '2',
    question: t('settings.chronotype.diagnosis.questions.wakeup'),
    options: [
      { value: 4, text: t('settings.chronotype.diagnosis.options.wakeup1'), type: 'lion' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.wakeup2'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.wakeup3'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.wakeupIrregular'), type: 'dolphin' },
    ],
  },
  {
    id: '3',
    question: t('settings.chronotype.diagnosis.questions.peakFocus'),
    options: [
      { value: 4, text: t('settings.chronotype.diagnosis.options.focusEarly'), type: 'lion' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.focusMorning'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.focusNight'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.focusMultiple'), type: 'dolphin' },
    ],
  },
  {
    id: '4',
    question: t('settings.chronotype.diagnosis.questions.morningWake'),
    options: [
      { value: 4, text: t('settings.chronotype.diagnosis.options.wakeVeryFresh'), type: 'lion' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.wakeFresh'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.wakeHard'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.wakeLight'), type: 'dolphin' },
    ],
  },
  {
    id: '5',
    question: t('settings.chronotype.diagnosis.questions.eveningActivity'),
    options: [
      { value: 1, text: t('settings.chronotype.diagnosis.options.eveningRelax'), type: 'lion' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.eveningModerate'), type: 'bear' },
      { value: 4, text: t('settings.chronotype.diagnosis.options.eveningActive'), type: 'wolf' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.eveningDepends'), type: 'dolphin' },
    ],
  },
  {
    id: '6',
    question: t('settings.chronotype.diagnosis.questions.sleepQuality'),
    options: [
      { value: 3, text: t('settings.chronotype.diagnosis.options.sleepRegular'), type: 'lion' },
      { value: 4, text: t('settings.chronotype.diagnosis.options.sleepStable'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.sleepLateDeep'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.sleepLight'), type: 'dolphin' },
    ],
  },
  {
    id: '7',
    question: t('settings.chronotype.diagnosis.questions.weekendPattern'),
    options: [
      { value: 4, text: t('settings.chronotype.diagnosis.options.weekendSame'), type: 'lion' },
      { value: 3, text: t('settings.chronotype.diagnosis.options.weekendSimilar'), type: 'bear' },
      { value: 2, text: t('settings.chronotype.diagnosis.options.weekendDifferent'), type: 'wolf' },
      { value: 1, text: t('settings.chronotype.diagnosis.options.weekendIrregular'), type: 'dolphin' },
    ],
  },
]
