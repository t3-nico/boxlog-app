'use client'

import { useState } from 'react'
import { 
  GraduationCap,
  Lightbulb,
  Moon,
  Sun,
  Clock
} from 'lucide-react'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { CHRONOTYPE_PRESETS, type ChronotypeType } from '@/types/chronotype'

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
      { id: '1', type: 'admin', label: 'Morning Setup', startTime: '05:00', endTime: '07:00', description: '起床・準備の時間', icon: 'admin' },
      { id: '2', type: 'focus', label: 'Peak Performance', startTime: '07:00', endTime: '11:00', description: '最高のパフォーマンス時間', icon: 'focus' },
      { id: '3', type: 'creative', label: 'Focused Work', startTime: '11:00', endTime: '14:00', description: '集中作業', icon: 'creative' },
      { id: '4', type: 'admin', label: 'Regular Tasks', startTime: '14:00', endTime: '17:00', description: '通常業務', icon: 'admin' },
      { id: '5', type: 'rest', label: 'Low Energy', startTime: '17:00', endTime: '21:00', description: '低エネルギー時間', icon: 'rest' },
      { id: '6', type: 'sleep', label: 'Sleep Time', startTime: '21:00', endTime: '05:00', description: '睡眠時間', icon: 'sleep' },
    ]
  },
  {
    id: 'bear',
    name: 'Bear (クマ型・標準型)',
    description: '太陽のリズムに従う。朝7時頃起床、午前中と午後早めが生産的。',
    peakHours: '9:00-12:00, 14:00-17:00',
    lowHours: '12:00-14:00, 22:00以降',
    schedules: [
      { id: '1', type: 'admin', label: 'Morning Prep', startTime: '07:00', endTime: '09:00', description: '起床・準備', icon: 'admin' },
      { id: '2', type: 'focus', label: 'Morning Peak', startTime: '09:00', endTime: '12:00', description: '午前のピーク時間', icon: 'focus' },
      { id: '3', type: 'rest', label: 'Lunch Break', startTime: '12:00', endTime: '14:00', description: 'ランチ・休憩', icon: 'rest' },
      { id: '4', type: 'creative', label: 'Afternoon Peak', startTime: '14:00', endTime: '17:00', description: '午後のピーク時間', icon: 'creative' },
      { id: '5', type: 'admin', label: 'Evening Wind Down', startTime: '17:00', endTime: '22:00', description: '夕方の時間', icon: 'admin' },
      { id: '6', type: 'sleep', label: 'Sleep Time', startTime: '22:00', endTime: '07:00', description: '睡眠時間', icon: 'sleep' },
    ]
  },
  {
    id: 'wolf',
    name: 'Wolf (オオカミ型・夜型)',
    description: '夜に最も創造的。朝は苦手で、午後から夜にかけて生産性が上がる。',
    peakHours: '17:00-22:00, 22:00-02:00',
    lowHours: '7:00-11:00',
    schedules: [
      { id: '1', type: 'rest', label: 'Slow Morning', startTime: '07:00', endTime: '11:00', description: '低調な朝の時間', icon: 'rest' },
      { id: '2', type: 'admin', label: 'Gradual Start', startTime: '11:00', endTime: '14:00', description: '徐々にペースアップ', icon: 'admin' },
      { id: '3', type: 'creative', label: 'Afternoon Focus', startTime: '14:00', endTime: '17:00', description: '午後の集中時間', icon: 'creative' },
      { id: '4', type: 'focus', label: 'Evening Peak', startTime: '17:00', endTime: '22:00', description: '夜のピーク時間', icon: 'focus' },
      { id: '5', type: 'creative', label: 'Creative Night', startTime: '22:00', endTime: '02:00', description: '深夜の創造的時間', icon: 'creative' },
      { id: '6', type: 'sleep', label: 'Sleep Time', startTime: '02:00', endTime: '07:00', description: '睡眠時間', icon: 'sleep' },
    ]
  },
  {
    id: 'dolphin',
    name: 'Dolphin (イルカ型・不規則型)',
    description: '睡眠が浅く、不規則なリズム。短い集中時間を複数回持つ。',
    peakHours: '8:00-10:00, 14:00-16:00',
    lowHours: '12:00-14:00, 22:00以降',
    schedules: [
      { id: '1', type: 'admin', label: 'Morning Start', startTime: '06:00', endTime: '08:00', description: '早朝の起床', icon: 'admin' },
      { id: '2', type: 'creative', label: 'Morning Focus', startTime: '08:00', endTime: '10:00', description: '朝の集中時間', icon: 'creative' },
      { id: '3', type: 'admin', label: 'Regular Tasks', startTime: '10:00', endTime: '12:00', description: '通常業務', icon: 'admin' },
      { id: '4', type: 'rest', label: 'Midday Rest', startTime: '12:00', endTime: '14:00', description: '昼間の低調時間', icon: 'rest' },
      { id: '5', type: 'focus', label: 'Afternoon Peak', startTime: '14:00', endTime: '16:00', description: '午後のピーク', icon: 'focus' },
      { id: '6', type: 'creative', label: 'Evening Work', startTime: '16:00', endTime: '18:00', description: '夕方の作業', icon: 'creative' },
      { id: '7', type: 'admin', label: 'Evening Tasks', startTime: '18:00', endTime: '22:00', description: '夜の時間', icon: 'admin' },
      { id: '8', type: 'sleep', label: 'Sleep Time', startTime: '22:00', endTime: '06:00', description: '睡眠時間', icon: 'sleep' },
    ]
  }
]

const typeColors = {
  focus: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  creative: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  rest: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  admin: 'bg-muted text-gray-700 dark:text-gray-300',
  sleep: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
}

const typeIcons = {
  focus: GraduationCap,
  creative: Lightbulb,
  rest: Moon,
  admin: Clock,
  sleep: () => <span className="text-base">💤</span>
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
      { value: 1, text: '不規則・まちまち', type: 'dolphin' }
    ]
  },
  {
    id: '2',
    question: '理想的な起床時間はいつですか？',
    options: [
      { value: 4, text: '5:00-6:30（超早起き）', type: 'lion' },
      { value: 3, text: '6:30-8:00（標準的）', type: 'bear' },
      { value: 2, text: '8:00-10:00（遅め）', type: 'wolf' },
      { value: 1, text: '不規則・まちまち', type: 'dolphin' }
    ]
  },
  {
    id: '3',
    question: '最も集中できる時間帯はいつですか？',
    options: [
      { value: 4, text: '早朝（6-9時）', type: 'lion' },
      { value: 3, text: '午前中（9-12時）', type: 'bear' },
      { value: 2, text: '夜間（20-24時）', type: 'wolf' },
      { value: 1, text: '複数の短時間（8-10時、14-16時）', type: 'dolphin' }
    ]
  },
  {
    id: '4',
    question: '朝の目覚めはどうですか？',
    options: [
      { value: 4, text: '非常にスッキリ、すぐ活動開始', type: 'lion' },
      { value: 3, text: 'スッキリ目覚める', type: 'bear' },
      { value: 2, text: 'なかなか起きられない', type: 'wolf' },
      { value: 1, text: '浅い眠り、頻繁に目覚める', type: 'dolphin' }
    ]
  },
  {
    id: '5',
    question: '夜の過ごし方として好ましいのは？',
    options: [
      { value: 1, text: '19-20時頃にはリラックスモード', type: 'lion' },
      { value: 2, text: '21-22時頃に適度にくつろぐ', type: 'bear' },
      { value: 4, text: '深夜まで活発に活動する', type: 'wolf' },
      { value: 3, text: '気分や体調による', type: 'dolphin' }
    ]
  },
  {
    id: '6',
    question: '睡眠の質について教えてください',
    options: [
      { value: 3, text: '規則正しく深く眠れる', type: 'lion' },
      { value: 4, text: '安定して良く眠れる', type: 'bear' },
      { value: 2, text: '遅寝だが深く眠れる', type: 'wolf' },
      { value: 1, text: '浅い眠り、中途覚醒が多い', type: 'dolphin' }
    ]
  },
  {
    id: '7',
    question: '週末の自然な睡眠パターンは？',
    options: [
      { value: 4, text: '平日とまったく同じ', type: 'lion' },
      { value: 3, text: '平日とほぼ同じ（±1時間）', type: 'bear' },
      { value: 2, text: '大幅にずれる（2-3時間以上）', type: 'wolf' },
      { value: 1, text: '不規則で一定しない', type: 'dolphin' }
    ]
  }
]

export default function ChronoTypePage() {
  const { chronotype, updateSettings } = useCalendarSettingsStore()
  const [selectedProfile, setSelectedProfile] = useState<string>(chronotype.type || 'bear')
  const [customSchedules, setCustomSchedules] = useState<ChronoTypeSchedule[]>([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null)

  const currentProfile = chronoTypeProfiles.find(p => p.id === selectedProfile)

  const getTypeIcon = (type: ChronoTypeSchedule['type']) => {
    const IconComponent = typeIcons[type]
    return <IconComponent className="h-4 w-4" data-slot="icon" />
  }

  const handleAnswerSelect = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    if (currentQuestion < diagnosisQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300)
    } else {
      // 診断完了 - 結果を計算
      setTimeout(() => calculateResult({ ...answers, [questionId]: value }), 300)
    }
  }

  const calculateResult = (finalAnswers: Record<string, number>) => {
    const typeScores = { lion: 0, bear: 0, wolf: 0, dolphin: 0 }
    
    diagnosisQuestions.forEach(question => {
      const answer = finalAnswers[question.id]
      if (answer) {
        const selectedOption = question.options.find(opt => opt.value === answer)
        if (selectedOption) {
          typeScores[selectedOption.type]++
        }
      }
    })

    // 最高スコアのタイプを決定
    const maxScore = Math.max(...Object.values(typeScores))
    const resultType = Object.entries(typeScores).find(([_, score]) => score === maxScore)?.[0] || 'bear'
    
    setDiagnosisResult(resultType)
    setSelectedProfile(resultType)
    updateSettings({ 
      chronotype: { 
        ...chronotype, 
        type: resultType as ChronotypeType 
      } 
    })
  }

  const startDiagnosis = () => {
    setShowDiagnosis(true)
    setCurrentQuestion(0)
    setAnswers({})
    setDiagnosisResult(null)
    
    // ページトップにスムーズスクロール
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    }, 100)
  }

  const resetDiagnosis = () => {
    setShowDiagnosis(false)
    setCurrentQuestion(0)
    setAnswers({})
    setDiagnosisResult(null)
  }

  const progress = ((currentQuestion + 1) / diagnosisQuestions.length) * 100

  return (
    <div className="space-y-6 max-w-4xl p-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Chronotype Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          あなたの体内時計に合わせて最適な作業スケジュールを設定します
        </p>
      </div>

      {/* 診断セクション */}
      {showDiagnosis ? (
        <div id="diagnosis-section" className="bg-card rounded-lg border border-border p-6">
          {diagnosisResult ? (
            /* 診断結果表示 */
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                🎉 診断完了！
              </h2>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  あなたのクロノタイプは...
                </p>
                <div className="inline-block p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    {diagnosisResult === 'lion' && <Sun className="h-8 w-8 text-yellow-500" data-slot="icon" />}
                    {diagnosisResult === 'bear' && <Clock className="h-8 w-8 text-blue-500" data-slot="icon" />}
                    {diagnosisResult === 'wolf' && <Moon className="h-8 w-8 text-purple-500" data-slot="icon" />}
                    {diagnosisResult === 'dolphin' && <GraduationCap className="h-8 w-8 text-teal-500" data-slot="icon" />}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {chronoTypeProfiles.find(p => p.id === diagnosisResult)?.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {chronoTypeProfiles.find(p => p.id === diagnosisResult)?.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetDiagnosis}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  もう一度診断
                </button>
                <button
                  onClick={() => setShowDiagnosis(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  設定に進む
                </button>
              </div>
            </div>
          ) : (
            /* 質問表示 */
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    クロノタイプ診断
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion + 1} / {diagnosisQuestions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {diagnosisQuestions[currentQuestion]?.question}
                </h3>
                <div className="space-y-3">
                  {diagnosisQuestions[currentQuestion]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(diagnosisQuestions[currentQuestion].id, option.value)}
                      className="w-full p-4 text-left border border-border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={resetDiagnosis}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                診断をキャンセル
              </button>
            </div>
          )}
        </div>
      ) : (
        /* クロノタイププロファイル選択 */
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              クロノタイプを選択
            </h2>
            <button
              onClick={startDiagnosis}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              🔍 診断で決める
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chronoTypeProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  setSelectedProfile(profile.id)
                  updateSettings({ 
                    chronotype: { 
                      ...chronotype, 
                      type: profile.id as ChronotypeType 
                    } 
                  })
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedProfile === profile.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {profile.id === 'lion' && <Sun className="h-5 w-5 text-yellow-500" data-slot="icon" />}
                  {profile.id === 'bear' && <Clock className="h-5 w-5 text-blue-500" data-slot="icon" />}
                  {profile.id === 'wolf' && <Moon className="h-5 w-5 text-purple-500" data-slot="icon" />}
                  {profile.id === 'dolphin' && <GraduationCap className="h-5 w-5 text-teal-500" data-slot="icon" />}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {profile.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <div>ピーク: {profile.peakHours}</div>
                  <div>低調: {profile.lowHours}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 選択されたプロファイルのスケジュール表示 */}
      {currentProfile && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {currentProfile.name} のスケジュール
          </h2>
          
          <div className="space-y-3">
            {currentProfile.schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`flex items-center justify-between p-3 rounded-lg ${typeColors[schedule.type]}`}
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(schedule.type)}
                  <div>
                    <div className="font-medium">{schedule.label}</div>
                    <div className="text-sm opacity-75">{schedule.description}</div>
                  </div>
                </div>
                <div className="text-sm font-mono">
                  {schedule.startTime} - {schedule.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カレンダー表示設定 */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Show in Calendar
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Display chronotype indicators in calendar views
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={chronotype.enabled}
              onChange={(e) => updateSettings({ 
                chronotype: { ...chronotype, enabled: e.target.checked } 
              })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => {
            setSelectedProfile('bear')
            updateSettings({ chronotype: { ...chronotype, type: 'bear' } })
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-card border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
        <button 
          onClick={() => {
            updateSettings({ 
              chronotype: { 
                ...chronotype, 
                type: selectedProfile as ChronotypeType 
              } 
            })
            alert('Settings saved successfully!')
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </div>

      {/* クロノタイプ説明セクション */}
      <div className="bg-card rounded-lg border border-border p-6 mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          クロノタイプとは？
        </h2>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>クロノタイプ（Chronotype）</strong>は、個人の体内時計（概日リズム）によって決まる活動パターンのことです。
              人それぞれ異なる生物学的な時間軸を持っており、これを理解して活用することで生産性と well-being を向上させることができます。
            </p>

            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">
              📊 4つのクロノタイプ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🦁 Lion (ライオン型・超朝型)</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• 人口の約 15%</li>
                  <li>• 早朝（5-7時）起床、7-11時がピーク</li>
                  <li>• 夜は21時頃には疲れる</li>
                  <li>• リーダーシップを発揮しやすい</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🐻 Bear (クマ型・標準型)</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 人口の約 55%</li>
                  <li>• 7-8時起床、9-12時と14-17時がピーク</li>
                  <li>• 太陽のサイクルに同調</li>
                  <li>• 最も一般的なタイプ</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🐺 Wolf (オオカミ型・夜型)</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• 人口の約 20%</li>
                  <li>• 17-22時がピーク、深夜も活動的</li>
                  <li>• 朝は調子が上がりにくい</li>
                  <li>• 創造性と直感力が高い</li>
                </ul>
              </div>

              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2">🐬 Dolphin (イルカ型・不規則型)</h4>
                <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
                  <li>• 人口の約 10%</li>
                  <li>• 複数の短いピーク時間</li>
                  <li>• 睡眠が浅く、中途覚醒が多い</li>
                  <li>• 高い知性と完璧主義傾向</li>
                </ul>
              </div>
            </div>

            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">
              🎯 クロノタイプを活用するメリット
            </h3>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>生産性の向上</strong>：自分のピーク時間に重要なタスクを配置</li>
              <li><strong>ストレス軽減</strong>：体内時計に逆らわない働き方でストレス減少</li>
              <li><strong>創造性の発揮</strong>：クリエイティブな時間帯を意識的に活用</li>
              <li><strong>健康の維持</strong>：自然なリズムに合わせた生活で心身の健康をサポート</li>
              <li><strong>チームワークの改善</strong>：メンバーのクロノタイプを理解した協働</li>
            </ul>

            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">
              📝 作業タイプの分類
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
              <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" data-slot="icon" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Focus</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" data-slot="icon" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Creative</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" data-slot="icon" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Rest</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" data-slot="icon" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                <span className="text-sm">💤</span>
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Sleep</span>
              </div>
            </div>

            <p className="text-sm">
              <strong>Focus</strong>：集中力を要する重要な作業<br/>
              <strong>Creative</strong>：アイデア出し、企画、デザインなどの創造的作業<br/>
              <strong>Rest</strong>：休憩、軽い作業、リラックス時間<br/>
              <strong>Admin</strong>：メール処理、事務作業、ルーチンタスク<br/>
              <strong>Sleep</strong>：睡眠時間、休息を推奨する時間帯
            </p>

            <div className="bg-muted p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>ヒント</strong>：クロノタイプは遺伝的要因が大きく、完全に変えることは困難です。
                重要なのは自分のタイプを受け入れ、それに合わせて作業スケジュールを最適化することです。
              </p>
            </div>

            {/* 診断ボタン */}
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                自分のクロノタイプが分からない方は、診断をお試しください
              </p>
              <button
                onClick={startDiagnosis}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                🔍 クロノタイプ診断を開始
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}