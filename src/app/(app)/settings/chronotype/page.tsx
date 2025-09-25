/* eslint-disable max-lines */
'use client'

import { useCallback, useState } from 'react'

import { Clock, GraduationCap, Lightbulb, Moon, Sun } from 'lucide-react'

import { colors, rounded, spacing, typography } from '@/config/theme'
import { SettingsLayout } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { type ChronotypeType } from '@/types/chronotype'

interface ChronotypeAutoSaveSettings {
  type: ChronotypeType
  enabled: boolean
  displayMode: 'border' | 'background' | 'both'
  opacity: number
}

interface ChronoTypeSchedule {
  id: string
  type: 'focus' | 'creative' | 'rest' | 'admin' | 'sleep'
  label: string
  startTime: string
  endTime: string
  description: string
  icon: string
}

interface ChronoTypeProfile {
  id: string
  name: string
  description: string
  peakHours: string
  lowHours: string
  schedules: ChronoTypeSchedule[]
}

const chronoTypeProfiles: ChronoTypeProfile[] = [
  {
    id: 'lion',
    name: 'Lion (ライオン型・超朝型)',
    description: '早朝に最も生産的。朝5-6時に起床し、午前中にピークを迎える。',
    peakHours: '7:00-11:00',
    lowHours: '17:00-21:00, 21:00以降',
    schedules: [
      {
        id: '1',
        type: 'admin',
        label: 'Morning Setup',
        startTime: '05:00',
        endTime: '07:00',
        description: '起床・準備の時間',
        icon: 'admin',
      },
      {
        id: '2',
        type: 'focus',
        label: 'Peak Performance',
        startTime: '07:00',
        endTime: '11:00',
        description: '最高のパフォーマンス時間',
        icon: 'focus',
      },
      {
        id: '3',
        type: 'creative',
        label: 'Focused Work',
        startTime: '11:00',
        endTime: '14:00',
        description: '集中作業',
        icon: 'creative',
      },
      {
        id: '4',
        type: 'admin',
        label: 'Regular Tasks',
        startTime: '14:00',
        endTime: '17:00',
        description: '通常業務',
        icon: 'admin',
      },
      {
        id: '5',
        type: 'rest',
        label: 'Low Energy',
        startTime: '17:00',
        endTime: '21:00',
        description: '低エネルギー時間',
        icon: 'rest',
      },
      {
        id: '6',
        type: 'sleep',
        label: 'Sleep Time',
        startTime: '21:00',
        endTime: '05:00',
        description: '睡眠時間',
        icon: 'sleep',
      },
    ],
  },
  {
    id: 'bear',
    name: 'Bear (クマ型・標準型)',
    description: '太陽のリズムに従う。朝7時頃起床、午前中と午後早めが生産的。',
    peakHours: '9:00-12:00, 14:00-17:00',
    lowHours: '12:00-14:00, 22:00以降',
    schedules: [
      {
        id: '1',
        type: 'admin',
        label: 'Morning Prep',
        startTime: '07:00',
        endTime: '09:00',
        description: '起床・準備',
        icon: 'admin',
      },
      {
        id: '2',
        type: 'focus',
        label: 'Morning Peak',
        startTime: '09:00',
        endTime: '12:00',
        description: '午前のピーク時間',
        icon: 'focus',
      },
      {
        id: '3',
        type: 'rest',
        label: 'Lunch Break',
        startTime: '12:00',
        endTime: '14:00',
        description: 'ランチ・休憩',
        icon: 'rest',
      },
      {
        id: '4',
        type: 'creative',
        label: 'Afternoon Peak',
        startTime: '14:00',
        endTime: '17:00',
        description: '午後のピーク時間',
        icon: 'creative',
      },
      {
        id: '5',
        type: 'admin',
        label: 'Evening Wind Down',
        startTime: '17:00',
        endTime: '22:00',
        description: '夕方の時間',
        icon: 'admin',
      },
      {
        id: '6',
        type: 'sleep',
        label: 'Sleep Time',
        startTime: '22:00',
        endTime: '07:00',
        description: '睡眠時間',
        icon: 'sleep',
      },
    ],
  },
  {
    id: 'wolf',
    name: 'Wolf (オオカミ型・夜型)',
    description: '夜に最も創造的。朝は苦手で、午後から夜にかけて生産性が上がる。',
    peakHours: '17:00-22:00, 22:00-02:00',
    lowHours: '7:00-11:00',
    schedules: [
      {
        id: '1',
        type: 'rest',
        label: 'Slow Morning',
        startTime: '07:00',
        endTime: '11:00',
        description: '低調な朝の時間',
        icon: 'rest',
      },
      {
        id: '2',
        type: 'admin',
        label: 'Gradual Start',
        startTime: '11:00',
        endTime: '14:00',
        description: '徐々にペースアップ',
        icon: 'admin',
      },
      {
        id: '3',
        type: 'creative',
        label: 'Afternoon Focus',
        startTime: '14:00',
        endTime: '17:00',
        description: '午後の集中時間',
        icon: 'creative',
      },
      {
        id: '4',
        type: 'focus',
        label: 'Evening Peak',
        startTime: '17:00',
        endTime: '22:00',
        description: '夜のピーク時間',
        icon: 'focus',
      },
      {
        id: '5',
        type: 'creative',
        label: 'Creative Night',
        startTime: '22:00',
        endTime: '02:00',
        description: '深夜の創造的時間',
        icon: 'creative',
      },
      {
        id: '6',
        type: 'sleep',
        label: 'Sleep Time',
        startTime: '02:00',
        endTime: '07:00',
        description: '睡眠時間',
        icon: 'sleep',
      },
    ],
  },
  {
    id: 'dolphin',
    name: 'Dolphin (イルカ型・不規則型)',
    description: '睡眠が浅く、不規則なリズム。短い集中時間を複数回持つ。',
    peakHours: '8:00-10:00, 14:00-16:00',
    lowHours: '12:00-14:00, 22:00以降',
    schedules: [
      {
        id: '1',
        type: 'admin',
        label: 'Morning Start',
        startTime: '06:00',
        endTime: '08:00',
        description: '早朝の起床',
        icon: 'admin',
      },
      {
        id: '2',
        type: 'creative',
        label: 'Morning Focus',
        startTime: '08:00',
        endTime: '10:00',
        description: '朝の集中時間',
        icon: 'creative',
      },
      {
        id: '3',
        type: 'admin',
        label: 'Regular Tasks',
        startTime: '10:00',
        endTime: '12:00',
        description: '通常業務',
        icon: 'admin',
      },
      {
        id: '4',
        type: 'rest',
        label: 'Midday Rest',
        startTime: '12:00',
        endTime: '14:00',
        description: '昼間の低調時間',
        icon: 'rest',
      },
      {
        id: '5',
        type: 'focus',
        label: 'Afternoon Peak',
        startTime: '14:00',
        endTime: '16:00',
        description: '午後のピーク',
        icon: 'focus',
      },
      {
        id: '6',
        type: 'creative',
        label: 'Evening Work',
        startTime: '16:00',
        endTime: '18:00',
        description: '夕方の作業',
        icon: 'creative',
      },
      {
        id: '7',
        type: 'admin',
        label: 'Evening Tasks',
        startTime: '18:00',
        endTime: '22:00',
        description: '夜の時間',
        icon: 'admin',
      },
      {
        id: '8',
        type: 'sleep',
        label: 'Sleep Time',
        startTime: '22:00',
        endTime: '06:00',
        description: '睡眠時間',
        icon: 'sleep',
      },
    ],
  },
]

const typeColors = {
  focus: `${colors.semantic.success.DEFAULT} ${colors.semantic.success.text}`,
  creative: `${colors.semantic.info.DEFAULT} ${colors.semantic.info.text}`,
  rest: `${colors.semantic.warning.DEFAULT} ${colors.semantic.warning.text}`,
  admin: `${colors.background.surface} ${colors.text.secondary}`,
  sleep: `${colors.background.elevated} ${colors.text.muted}`,
}

const typeIcons = {
  focus: GraduationCap,
  creative: Lightbulb,
  rest: Moon,
  admin: Clock,
  sleep: () => <span className={typography.body.DEFAULT}>💤</span>,
}

interface DiagnosisQuestion {
  id: string
  question: string
  options: {
    value: number
    text: string
    type: 'lion' | 'bear' | 'wolf' | 'dolphin'
  }[]
}

const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: '1',
    question: '理想的な就寝時間はいつですか？',
    options: [
      { value: 4, text: '20:00-21:30（超早寝）', type: 'lion' },
      { value: 3, text: '21:30-23:00（標準的）', type: 'bear' },
      { value: 2, text: '23:00-01:00（夜型）', type: 'wolf' },
      { value: 1, text: '不規則・まちまち', type: 'dolphin' },
    ],
  },
  {
    id: '2',
    question: '理想的な起床時間はいつですか？',
    options: [
      { value: 4, text: '5:00-6:30（超早起き）', type: 'lion' },
      { value: 3, text: '6:30-8:00（標準的）', type: 'bear' },
      { value: 2, text: '8:00-10:00（遅め）', type: 'wolf' },
      { value: 1, text: '不規則・まちまち', type: 'dolphin' },
    ],
  },
  {
    id: '3',
    question: '最も集中できる時間帯はいつですか？',
    options: [
      { value: 4, text: '早朝（6-9時）', type: 'lion' },
      { value: 3, text: '午前中（9-12時）', type: 'bear' },
      { value: 2, text: '夜間（20-24時）', type: 'wolf' },
      { value: 1, text: '複数の短時間（8-10時、14-16時）', type: 'dolphin' },
    ],
  },
  {
    id: '4',
    question: '朝の目覚めはどうですか？',
    options: [
      { value: 4, text: '非常にスッキリ、すぐ活動開始', type: 'lion' },
      { value: 3, text: 'スッキリ目覚める', type: 'bear' },
      { value: 2, text: 'なかなか起きられない', type: 'wolf' },
      { value: 1, text: '浅い眠り、頻繁に目覚める', type: 'dolphin' },
    ],
  },
  {
    id: '5',
    question: '夜の過ごし方として好ましいのは？',
    options: [
      { value: 1, text: '19-20時頃にはリラックスモード', type: 'lion' },
      { value: 2, text: '21-22時頃に適度にくつろぐ', type: 'bear' },
      { value: 4, text: '深夜まで活発に活動する', type: 'wolf' },
      { value: 3, text: '気分や体調による', type: 'dolphin' },
    ],
  },
  {
    id: '6',
    question: '睡眠の質について教えてください',
    options: [
      { value: 3, text: '規則正しく深く眠れる', type: 'lion' },
      { value: 4, text: '安定して良く眠れる', type: 'bear' },
      { value: 2, text: '遅寝だが深く眠れる', type: 'wolf' },
      { value: 1, text: '浅い眠り、中途覚醒が多い', type: 'dolphin' },
    ],
  },
  {
    id: '7',
    question: '週末の自然な睡眠パターンは？',
    options: [
      { value: 4, text: '平日とまったく同じ', type: 'lion' },
      { value: 3, text: '平日とほぼ同じ（±1時間）', type: 'bear' },
      { value: 2, text: '大幅にずれる（2-3時間以上）', type: 'wolf' },
      { value: 1, text: '不規則で一定しない', type: 'dolphin' },
    ],
  },
]

const ChronoTypePage = () => {
  const { chronotype, updateSettings } = useCalendarSettingsStore()
  const [_customSchedules, _setCustomSchedules] = useState<ChronoTypeSchedule[]>([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null)

  // クロノタイプ設定の自動保存
  const chronoSettings = useAutoSaveSettings<ChronotypeAutoSaveSettings>({
    initialValues: {
      type: chronotype.type || 'bear',
      enabled: chronotype.enabled,
      displayMode: chronotype.displayMode || 'border',
      opacity: chronotype.opacity || 90,
    },
    onSave: async (values) => {
      // クロノタイプ設定API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 600))
      console.log('Saving chronotype settings:', values)
      // 実際のstore更新
      updateSettings({ chronotype: values })
    },
    successMessage: 'クロノタイプ設定を保存しました',
    debounceMs: 1200,
  })

  const currentProfile = chronoTypeProfiles.find((p) => p.id === chronoSettings.values.type)

  // useCallback handlers for jsx-no-bind optimization
  const handleCloseDiagnosis = useCallback(() => {
    setShowDiagnosis(false)
  }, [])

  // Handler functions for diagnosis (reserved for future use)
  const resetDiagnosis = useCallback(() => {
    setShowDiagnosis(false)
    setCurrentQuestion(0)
    setAnswers({})
    setDiagnosisResult(null)
  }, [])

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

  // Handler for answer selection using data attributes
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

  // Handler for chronotype profile selection using data attributes
  const handleProfileSelect = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const profileId = event.currentTarget.dataset.profileId
      if (profileId) {
        chronoSettings.updateValue('type', profileId as ChronotypeType)
      }
    },
    [chronoSettings]
  )

  const handleEnabledToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      chronoSettings.updateValue('enabled', e.target.checked)
    },
    [chronoSettings]
  )

  const getTypeIcon = (type: ChronoTypeSchedule['type']) => {
    if (!Object.prototype.hasOwnProperty.call(typeIcons, type)) {
      return null
    }
    const IconComponent = typeIcons[type as keyof typeof typeIcons]
    return <IconComponent className="h-4 w-4" data-slot="icon" />
  }

  const handleAnswerSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))

    if (currentQuestion < diagnosisQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300)
    } else {
      // 診断完了 - 結果を計算
      setTimeout(() => calculateResult({ ...answers, [questionId]: value }), 300)
    }
  }

  const calculateResult = (finalAnswers: Record<string, number>) => {
    const typeScores = { lion: 0, bear: 0, wolf: 0, dolphin: 0 }

    diagnosisQuestions.forEach((question) => {
      const answer = finalAnswers[question.id]
      if (answer) {
        const selectedOption = question.options.find((opt) => opt.value === answer)
        if (selectedOption) {
          typeScores[selectedOption.type]++
        }
      }
    })

    // 最高スコアのタイプを決定
    const maxScore = Math.max(...Object.values(typeScores))
    const resultType = Object.entries(typeScores).find(([_, score]) => score === maxScore)?.[0] || 'bear'

    setDiagnosisResult(resultType)
    chronoSettings.updateValue('type', resultType as ChronotypeType)
  }

  const progress = ((currentQuestion + 1) / diagnosisQuestions.length) * 100

  return (
    <SettingsLayout
      title="Chronotype Settings"
      description="あなたの体内時計に合わせて最適な作業スケジュールを設定します"
    >
      <div className={spacing.stackGap.lg}>
        {/* 診断セクション */}
        {showDiagnosis ? (
          <div
            id="diagnosis-section"
            className={`${colors.background.card} ${rounded.component.card.base} border ${colors.border.DEFAULT} p-6`}
          >
            {diagnosisResult ? (
              /* 診断結果表示 */
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
                    onClick={resetDiagnosis}
                    className={`px-4 py-2 ${typography.body.sm} font-medium ${colors.text.secondary} ${colors.background.card} border ${colors.border.DEFAULT} ${rounded.component.button.md} transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700`}
                  >
                    もう一度診断
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDiagnosis}
                    className={`px-4 py-2 ${typography.body.sm} font-medium ${colors.primary.text} ${colors.primary.DEFAULT} ${colors.primary.hover} ${rounded.component.button.md} transition-colors`}
                  >
                    設定に進む
                  </button>
                </div>
              </div>
            ) : (
              /* 質問表示 */
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
                    ></div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`${typography.heading.h3} ${colors.text.primary} mb-4`}>
                    {(() => {
                      const question = currentQuestion >= 0 && currentQuestion < diagnosisQuestions.length ? diagnosisQuestions[currentQuestion] : null
                      return question?.question || ''
                    })()}
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const question = currentQuestion >= 0 && currentQuestion < diagnosisQuestions.length ? diagnosisQuestions[currentQuestion] : null
                      return (question?.options || []).map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={handleAnswerClick}
                        data-question-id={(() => {
                          const question = currentQuestion >= 0 && currentQuestion < diagnosisQuestions.length ? diagnosisQuestions[currentQuestion] : null
                          return question?.id || ''
                        })()}
                        data-option-value={option.value}
                        className={`w-full border p-4 text-left ${colors.border.DEFAULT} ${rounded.component.card.base} transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-600 dark:hover:bg-neutral-800`}
                      >
                        {option.text}
                      </button>
                    ))
                    })()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetDiagnosis}
                  className={`${typography.body.sm} ${colors.text.muted} hover:text-neutral-900 dark:hover:text-neutral-100`}
                >
                  診断をキャンセル
                </button>
              </div>
            )}
          </div>
        ) : (
          /* クロノタイププロファイル選択 */
          <div
            className={`${colors.background.card} ${rounded.component.card.base} border ${colors.border.DEFAULT} p-6`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`${typography.heading.h2} ${colors.text.primary}`}>クロノタイプを選択</h2>
              <button
                type="button"
                onClick={startDiagnosis}
                className={`px-3 py-1.5 ${typography.body.sm} font-medium ${colors.primary.text} ${colors.primary.DEFAULT} ${colors.primary.hover} rounded-lg transition-colors`}
              >
                🔍 診断で決める
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {chronoTypeProfiles.map((profile) => (
                <button
                  type="button"
                  key={profile.id}
                  onClick={handleProfileSelect}
                  data-profile-id={profile.id}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    chronoSettings.values.type === profile.id
                      ? `${colors.border.info} ${colors.semantic.info.light}`
                      : `${colors.border.DEFAULT} hover:${colors.border.strong}`
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {profile.id === 'lion' && (
                      <Sun className={`h-5 w-5 ${colors.semantic.warning.text}`} data-slot="icon" />
                    )}
                    {profile.id === 'bear' && (
                      <Clock className={`h-5 w-5 ${colors.semantic.info.text}`} data-slot="icon" />
                    )}
                    {profile.id === 'wolf' && <Moon className={`h-5 w-5 ${colors.primary.text}`} data-slot="icon" />}
                    {profile.id === 'dolphin' && (
                      <GraduationCap className={`h-5 w-5 ${colors.secondary.text}`} data-slot="icon" />
                    )}
                    <h3 className={`${typography.body.semibold} ${colors.text.primary}`}>{profile.name}</h3>
                  </div>
                  <p className={`${typography.body.small} ${colors.text.secondary} mb-2`}>{profile.description}</p>
                  <div className={typography.special.caption}>
                    <div>ピーク: {profile.peakHours}</div>
                    <div>低調: {profile.lowHours}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選択されたプロファイルのスケジュール表示 */}
        {currentProfile != null && (
          <div
            className={`${colors.background.card} ${rounded.component.card.base} border ${colors.border.DEFAULT} p-6`}
          >
            <h2 className={`${typography.heading.h4} ${colors.text.primary} mb-4`}>
              {currentProfile.name} のスケジュール
            </h2>

            <div className="space-y-3">
              {currentProfile.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${typeColors[schedule.type]}`}
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(schedule.type)}
                    <div>
                      <div className="font-medium">{schedule.label}</div>
                      <div className="text-sm opacity-75">{schedule.description}</div>
                    </div>
                  </div>
                  <div className="font-mono text-sm">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* カレンダー表示設定 */}
        <div className={`${colors.background.card} ${rounded.component.card.base} border ${colors.border.DEFAULT} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${typography.heading.h4} ${colors.text.primary}`}>Show in Calendar</h2>
              <p className={`${typography.body.small} ${colors.text.secondary}`}>
                Display chronotype indicators in calendar views
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={chronoSettings.values.enabled}
                onChange={handleEnabledToggle}
                className="peer sr-only"
                aria-label="Show chronotype in calendar"
              />
              <div
                className={`peer h-6 w-12 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 dark:bg-neutral-700 dark:after:border-neutral-600 dark:focus:ring-blue-800 dark:peer-checked:bg-blue-500`}
              ></div>
            </label>
          </div>
        </div>

        {/* クロノタイプ説明セクション */}
        <div
          className={`${colors.background.card} ${rounded.component.card.base} border ${colors.border.DEFAULT} mt-8 p-6`}
        >
          <h2 className={`${typography.heading.h2} ${colors.text.primary} mb-4`}>クロノタイプとは？</h2>

          <div className="prose prose-sm max-w-none">
            <div className={`space-y-4 ${colors.text.secondary}`}>
              <p>
                <strong>クロノタイプ（Chronotype）</strong>
                は、個人の体内時計（概日リズム）によって決まる活動パターンのことです。
                人それぞれ異なる生物学的な時間軸を持っており、これを理解して活用することで生産性と well-being
                を向上させることができます。
              </p>

              <h3 className={`${typography.heading.h5} ${colors.text.primary} mb-6`}>📊 4つのクロノタイプ</h3>

              <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  className={`${colors.semantic.warning.light} p-4 ${rounded.component.card.base} border ${colors.border.DEFAULT}`}
                >
                  <h4 className={`${typography.body.semibold} ${colors.semantic.warning.text} mb-2`}>
                    🦁 Lion (ライオン型・超朝型)
                  </h4>
                  <ul className={`${typography.body.small} ${colors.semantic.warning.text} space-y-1`}>
                    <li>• 人口の約 15%</li>
                    <li>• 早朝（5-7時）起床、7-11時がピーク</li>
                    <li>• 夜は21時頃には疲れる</li>
                    <li>• リーダーシップを発揮しやすい</li>
                  </ul>
                </div>

                <div
                  className={`${colors.semantic.info.light} p-4 ${rounded.component.card.base} border ${colors.border.DEFAULT}`}
                >
                  <h4 className={`${typography.body.semibold} ${colors.semantic.info.text} mb-2`}>
                    🐻 Bear (クマ型・標準型)
                  </h4>
                  <ul className={`${typography.body.small} ${colors.semantic.info.text} space-y-1`}>
                    <li>• 人口の約 55%</li>
                    <li>• 7-8時起床、9-12時と14-17時がピーク</li>
                    <li>• 太陽のサイクルに同調</li>
                    <li>• 最も一般的なタイプ</li>
                  </ul>
                </div>

                <div
                  className={`${colors.background.elevated} p-4 ${rounded.component.card.base} border ${colors.border.DEFAULT}`}
                >
                  <h4 className={`${typography.body.semibold} ${colors.text.primary} mb-2`}>
                    🐺 Wolf (オオカミ型・夜型)
                  </h4>
                  <ul className={`${typography.body.small} ${colors.text.secondary} space-y-1`}>
                    <li>• 人口の約 20%</li>
                    <li>• 17-22時がピーク、深夜も活動的</li>
                    <li>• 朝は調子が上がりにくい</li>
                    <li>• 創造性と直感力が高い</li>
                  </ul>
                </div>

                <div
                  className={`${colors.semantic.success.light} p-4 ${rounded.component.card.base} border ${colors.border.DEFAULT}`}
                >
                  <h4 className={`${typography.body.semibold} ${colors.semantic.success.text} mb-2`}>
                    🐬 Dolphin (イルカ型・不規則型)
                  </h4>
                  <ul className={`${typography.body.small} ${colors.semantic.success.text} space-y-1`}>
                    <li>• 人口の約 10%</li>
                    <li>• 複数の短いピーク時間</li>
                    <li>• 睡眠が浅く、中途覚醒が多い</li>
                    <li>• 高い知性と完璧主義傾向</li>
                  </ul>
                </div>
              </div>

              <h3 className={`${typography.heading.h5} ${colors.text.primary} mb-6`}>
                🎯 クロノタイプを活用するメリット
              </h3>

              <ul className={`ml-4 list-inside list-disc space-y-2 ${colors.text.secondary}`}>
                <li>
                  <strong className={colors.text.primary}>生産性の向上</strong>：自分のピーク時間に重要なタスクを配置
                </li>
                <li>
                  <strong className={colors.text.primary}>ストレス軽減</strong>
                  ：体内時計に逆らわない働き方でストレス減少
                </li>
                <li>
                  <strong className={colors.text.primary}>創造性の発揮</strong>：クリエイティブな時間帯を意識的に活用
                </li>
                <li>
                  <strong className={colors.text.primary}>健康の維持</strong>
                  ：自然なリズムに合わせた生活で心身の健康をサポート
                </li>
                <li>
                  <strong className={colors.text.primary}>チームワークの改善</strong>
                  ：メンバーのクロノタイプを理解した協働
                </li>
              </ul>

              <h3 className={`${typography.heading.h5} ${colors.text.primary} mb-6`}>📝 作業タイプの分類</h3>

              <div className="my-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                <div
                  className={`flex items-center gap-2 p-2 ${colors.semantic.success.light} ${rounded.component.button.sm}`}
                >
                  <GraduationCap className={`h-4 w-4 ${colors.semantic.success.text}`} data-slot="icon" />
                  <span className={`${typography.body.small} font-semibold ${colors.semantic.success.text}`}>
                    Focus
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2 ${colors.background.elevated} ${rounded.component.button.sm}`}
                >
                  <Lightbulb className={`h-4 w-4 ${colors.text.primary}`} data-slot="icon" />
                  <span className={`${typography.body.small} font-semibold ${colors.text.primary}`}>Creative</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2 ${colors.semantic.info.light} ${rounded.component.button.sm}`}
                >
                  <Moon className={`h-4 w-4 ${colors.semantic.info.text}`} data-slot="icon" />
                  <span className={`${typography.body.small} font-semibold ${colors.semantic.info.text}`}>Rest</span>
                </div>
                <div className="bg-muted flex items-center gap-2 rounded p-2">
                  <Clock className={`h-4 w-4 ${colors.text.secondary}`} data-slot="icon" />
                  <span className={`${typography.body.small} font-semibold ${colors.text.secondary}`}>Admin</span>
                </div>
                <div
                  className={`flex items-center gap-2 bg-blue-50 p-2 dark:bg-blue-900/20 ${rounded.component.button.sm}`}
                >
                  <span className="text-sm">💤</span>
                  <span className={`${typography.body.small} font-medium text-blue-600 dark:text-blue-400`}>Sleep</span>
                </div>
              </div>

              <p className="text-sm">
                <strong>Focus</strong>：集中力を要する重要な作業
                <br />
                <strong>Creative</strong>：アイデア出し、企画、デザインなどの創造的作業
                <br />
                <strong>Rest</strong>：休憩、軽い作業、リラックス時間
                <br />
                <strong>Admin</strong>：メール処理、事務作業、ルーチンタスク
                <br />
                <strong>Sleep</strong>：睡眠時間、休息を推奨する時間帯
              </p>

              <div className="bg-muted mt-6 rounded-lg p-4">
                <p className={`${typography.body.small} ${colors.text.secondary}`}>
                  💡 <strong>ヒント</strong>：クロノタイプは遺伝的要因が大きく、完全に変えることは困難です。
                  重要なのは自分のタイプを受け入れ、それに合わせて作業スケジュールを最適化することです。
                </p>
              </div>

              {/* 診断ボタン */}
              <div className="mt-6 border-t border-neutral-200 pt-6 text-center dark:border-neutral-700">
                <p className={`${typography.body.small} ${colors.text.secondary} mb-4`}>
                  自分のクロノタイプが分からない方は、診断をお試しください
                </p>
                <button
                  type="button"
                  onClick={startDiagnosis}
                  className={`inline-flex items-center gap-2 px-6 py-3 ${typography.body.sm} font-medium text-white ${colors.primary.DEFAULT} ${colors.primary.hover} rounded-lg shadow-sm transition-colors`}
                >
                  🔍 クロノタイプ診断を開始
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}

export default ChronoTypePage
