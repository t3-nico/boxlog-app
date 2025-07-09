'use client'

import { useState } from 'react'
import { 
  AcademicCapIcon,
  LightBulbIcon,
  MoonIcon,
  SunIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ChronoTypeSchedule {
  id: string
  type: 'focus' | 'creative' | 'rest' | 'admin'
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
    id: 'lark',
    name: 'Morning Lark (朝型)',
    description: '早朝に最も集中力が高く、夜は早めに休む傾向',
    peakHours: '6:00-10:00',
    lowHours: '14:00-16:00, 20:00以降',
    schedules: [
      { id: '1', type: 'focus', label: 'Deep Work', startTime: '06:00', endTime: '09:00', description: '最も集中力の高い時間帯', icon: 'focus' },
      { id: '2', type: 'admin', label: 'Admin Tasks', startTime: '09:00', endTime: '11:00', description: 'メール処理や事務作業', icon: 'admin' },
      { id: '3', type: 'creative', label: 'Creative Work', startTime: '11:00', endTime: '13:00', description: 'アイデア出しや企画', icon: 'creative' },
      { id: '4', type: 'rest', label: 'Break Time', startTime: '14:00', endTime: '16:00', description: '休憩・軽作業', icon: 'rest' },
      { id: '5', type: 'admin', label: 'Light Tasks', startTime: '16:00', endTime: '18:00', description: '軽めのタスク', icon: 'admin' },
    ]
  },
  {
    id: 'owl',
    name: 'Night Owl (夜型)',
    description: '夜間に最も活動的で創造的になる傾向',
    peakHours: '20:00-24:00',
    lowHours: '6:00-10:00, 14:00-16:00',
    schedules: [
      { id: '1', type: 'admin', label: 'Morning Admin', startTime: '09:00', endTime: '11:00', description: '軽めの事務作業', icon: 'admin' },
      { id: '2', type: 'creative', label: 'Creative Work', startTime: '11:00', endTime: '13:00', description: 'アイデア出し', icon: 'creative' },
      { id: '3', type: 'rest', label: 'Afternoon Break', startTime: '14:00', endTime: '16:00', description: '午後の休憩', icon: 'rest' },
      { id: '4', type: 'admin', label: 'Light Work', startTime: '16:00', endTime: '18:00', description: '軽作業', icon: 'admin' },
      { id: '5', type: 'focus', label: 'Deep Work', startTime: '20:00', endTime: '23:00', description: '最も集中できる時間', icon: 'focus' },
    ]
  },
  {
    id: 'third-bird',
    name: 'Third Bird (中間型)',
    description: '朝型と夜型の中間で、柔軟な働き方が可能',
    peakHours: '10:00-12:00, 16:00-18:00',
    lowHours: '14:00-15:00',
    schedules: [
      { id: '1', type: 'admin', label: 'Morning Setup', startTime: '09:00', endTime: '10:00', description: '1日の準備', icon: 'admin' },
      { id: '2', type: 'focus', label: 'Morning Focus', startTime: '10:00', endTime: '12:00', description: '午前の集中作業', icon: 'focus' },
      { id: '3', type: 'creative', label: 'Creative Session', startTime: '13:00', endTime: '14:00', description: 'クリエイティブ作業', icon: 'creative' },
      { id: '4', type: 'rest', label: 'Afternoon Rest', startTime: '14:00', endTime: '15:00', description: '午後の休憩', icon: 'rest' },
      { id: '5', type: 'focus', label: 'Afternoon Focus', startTime: '16:00', endTime: '18:00', description: '午後の集中作業', icon: 'focus' },
    ]
  }
]

const typeColors = {
  focus: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  creative: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  rest: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  admin: 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300'
}

const typeIcons = {
  focus: AcademicCapIcon,
  creative: LightBulbIcon,
  rest: MoonIcon,
  admin: ClockIcon
}

interface DiagnosisQuestion {
  id: string
  question: string
  options: {
    value: number
    text: string
    type: 'lark' | 'owl' | 'third-bird'
  }[]
}

const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: '1',
    question: '理想的な就寝時間はいつですか？',
    options: [
      { value: 3, text: '21:00-22:30', type: 'lark' },
      { value: 2, text: '22:30-24:00', type: 'third-bird' },
      { value: 1, text: '24:00以降', type: 'owl' }
    ]
  },
  {
    id: '2',
    question: '理想的な起床時間はいつですか？',
    options: [
      { value: 3, text: '5:30-7:00', type: 'lark' },
      { value: 2, text: '7:00-8:30', type: 'third-bird' },
      { value: 1, text: '8:30以降', type: 'owl' }
    ]
  },
  {
    id: '3',
    question: '最も集中できる時間帯はいつですか？',
    options: [
      { value: 3, text: '朝早く（6-10時）', type: 'lark' },
      { value: 2, text: '午前中〜午後（10-16時）', type: 'third-bird' },
      { value: 1, text: '夕方〜夜（16時以降）', type: 'owl' }
    ]
  },
  {
    id: '4',
    question: '朝の目覚めはどうですか？',
    options: [
      { value: 3, text: 'スッキリ目覚める', type: 'lark' },
      { value: 2, text: '普通に目覚める', type: 'third-bird' },
      { value: 1, text: 'なかなか起きられない', type: 'owl' }
    ]
  },
  {
    id: '5',
    question: '夜の過ごし方として好ましいのは？',
    options: [
      { value: 1, text: '早めにリラックスして休む', type: 'lark' },
      { value: 2, text: '適度な活動をして休む', type: 'third-bird' },
      { value: 3, text: '活発に活動する', type: 'owl' }
    ]
  },
  {
    id: '6',
    question: '最も創造性を発揮できる時間は？',
    options: [
      { value: 3, text: '早朝〜午前中', type: 'lark' },
      { value: 2, text: '日中の任意の時間', type: 'third-bird' },
      { value: 1, text: '夕方〜深夜', type: 'owl' }
    ]
  },
  {
    id: '7',
    question: '週末の自然な睡眠パターンは？',
    options: [
      { value: 3, text: '平日とほぼ同じ', type: 'lark' },
      { value: 2, text: '1-2時間程度ずれる', type: 'third-bird' },
      { value: 1, text: '大幅にずれる（3時間以上）', type: 'owl' }
    ]
  }
]

export default function ChronoTypePage() {
  const [selectedProfile, setSelectedProfile] = useState<string>('third-bird')
  const [customSchedules, setCustomSchedules] = useState<ChronoTypeSchedule[]>([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null)

  const currentProfile = chronoTypeProfiles.find(p => p.id === selectedProfile)

  const getTypeIcon = (type: ChronoTypeSchedule['type']) => {
    const IconComponent = typeIcons[type]
    return <IconComponent className="h-4 w-4" />
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
    const typeScores = { lark: 0, owl: 0, 'third-bird': 0 }
    
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
    const resultType = Object.entries(typeScores).find(([_, score]) => score === maxScore)?.[0] || 'third-bird'
    
    setDiagnosisResult(resultType)
    setSelectedProfile(resultType)
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
        <div id="diagnosis-section" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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
                    {diagnosisResult === 'lark' && <SunIcon className="h-8 w-8 text-yellow-500" />}
                    {diagnosisResult === 'owl' && <MoonIcon className="h-8 w-8 text-purple-500" />}
                    {diagnosisResult === 'third-bird' && <ClockIcon className="h-8 w-8 text-blue-500" />}
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                      className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              クロノタイプを選択
            </h2>
            <button
              onClick={startDiagnosis}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              🔍 診断で決める
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chronoTypeProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedProfile === profile.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {profile.id === 'lark' && <SunIcon className="h-5 w-5 text-yellow-500" />}
                  {profile.id === 'owl' && <MoonIcon className="h-5 w-5 text-purple-500" />}
                  {profile.id === 'third-bird' && <ClockIcon className="h-5 w-5 text-blue-500" />}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
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

      {/* 保存ボタン */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          リセット
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          設定を保存
        </button>
      </div>

      {/* クロノタイプ説明セクション */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-8">
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
              📊 3つの主要なクロノタイプ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🌅 Morning Lark (朝型)</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• 人口の約 25%</li>
                  <li>• 早朝（6-10時）が最高パフォーマンス</li>
                  <li>• 夜は早めに疲れる傾向</li>
                  <li>• 集中力を要する作業は午前中に</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🌙 Night Owl (夜型)</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• 人口の約 25%</li>
                  <li>• 夜間（20-24時）が最高パフォーマンス</li>
                  <li>• 朝は調子が上がりにくい</li>
                  <li>• 創造的作業は夜に向いている</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">⚖️ Third Bird (中間型)</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 人口の約 50%</li>
                  <li>• 柔軟な活動パターン</li>
                  <li>• 午前と夕方にピークが2回</li>
                  <li>• 環境に適応しやすい</li>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
              <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <AcademicCapIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Focus</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                <LightBulbIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Creative</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                <MoonIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Rest</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800/30 rounded">
                <ClockIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
              </div>
            </div>

            <p className="text-sm">
              <strong>Focus</strong>：集中力を要する重要な作業<br/>
              <strong>Creative</strong>：アイデア出し、企画、デザインなどの創造的作業<br/>
              <strong>Rest</strong>：休憩、軽い作業、リラックス時間<br/>
              <strong>Admin</strong>：メール処理、事務作業、ルーチンタスク
            </p>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>ヒント</strong>：クロノタイプは遺伝的要因が大きく、完全に変えることは困難です。
                重要なのは自分のタイプを受け入れ、それに合わせて作業スケジュールを最適化することです。
              </p>
            </div>

            {/* 診断ボタン */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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