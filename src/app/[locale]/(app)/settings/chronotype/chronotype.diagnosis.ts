export interface DiagnosisQuestion {
  id: string
  question: string
  options: {
    value: number
    text: string
    type: 'lion' | 'bear' | 'wolf' | 'dolphin'
  }[]
}

export const diagnosisQuestions: DiagnosisQuestion[] = [
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

export const calculateDiagnosisResult = (
  answers: Record<string, number>
): 'lion' | 'bear' | 'wolf' | 'dolphin' => {
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
