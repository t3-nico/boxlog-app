import { addMinutes } from 'date-fns'
import { 
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  SunIcon
} from '@heroicons/react/24/outline'
import type { TimeBlockTemplate, TimeBlock } from '../types/timeBlock'

// ID生成関数
function generateId(): string {
  return `tb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const timeBlockTemplates: TimeBlockTemplate[] = [
  {
    id: 'deep-work',
    name: 'ディープワーク',
    type: 'focus',
    duration: 90,
    color: 'purple',
    suggestedTasks: ['コーディング', 'ドキュメント作成', '設計', '分析', '執筆'],
    bestTime: { start: 9, end: 11 },
    icon: AcademicCapIcon
  },
  {
    id: 'pomodoro',
    name: 'ポモドーロ',
    type: 'focus',
    duration: 25,
    color: 'red',
    breakDuration: 5,
    cycles: 4,
    icon: ClockIcon
  },
  {
    id: 'pomodoro-extended',
    name: 'ポモドーロ（拡張）',
    type: 'focus',
    duration: 50,
    color: 'red',
    breakDuration: 10,
    cycles: 3,
    icon: ClockIcon
  },
  {
    id: 'meeting-block',
    name: 'ミーティングブロック',
    type: 'meeting',
    duration: 60,
    color: 'blue',
    preparationTime: 10,
    wrapUpTime: 10,
    suggestedTasks: ['1on1', 'チーム会議', 'プレゼン', '面談'],
    icon: UsersIcon
  },
  {
    id: 'meeting-extended',
    name: '長時間ミーティング',
    type: 'meeting',
    duration: 120,
    color: 'blue',
    preparationTime: 15,
    wrapUpTime: 15,
    suggestedTasks: ['ワークショップ', '企画会議', '研修'],
    icon: UsersIcon
  },
  {
    id: 'energy-break',
    name: 'エネルギーブレイク',
    type: 'break',
    duration: 15,
    color: 'green',
    activities: ['散歩', 'ストレッチ', '瞑想', '深呼吸'],
    icon: SparklesIcon
  },
  {
    id: 'lunch-break',
    name: 'ランチブレイク',
    type: 'break',
    duration: 60,
    color: 'green',
    activities: ['昼食', 'リラックス', '雑談', '外出'],
    bestTime: { start: 12, end: 13 },
    icon: SparklesIcon
  },
  {
    id: 'morning-routine',
    name: 'モーニングルーティン',
    type: 'routine',
    duration: 60,
    color: 'yellow',
    suggestedTasks: ['メールチェック', 'タスク整理', '1日の計画', 'ニュース確認'],
    bestTime: { start: 8, end: 9 },
    icon: SunIcon
  },
  {
    id: 'evening-routine',
    name: 'イブニングルーティン',
    type: 'routine',
    duration: 45,
    color: 'yellow',
    suggestedTasks: ['日報作成', '翌日準備', '振り返り', 'クリーンアップ'],
    bestTime: { start: 17, end: 18 },
    icon: SunIcon
  },
  {
    id: 'admin-time',
    name: '事務作業タイム',
    type: 'routine',
    duration: 30,
    color: 'gray',
    suggestedTasks: ['経費精算', '書類整理', 'システム更新', '報告書'],
    icon: SunIcon
  },
  {
    id: 'creative-session',
    name: 'クリエイティブセッション',
    type: 'focus',
    duration: 120,
    color: 'purple',
    suggestedTasks: ['ブレインストーミング', 'アイデア出し', 'プロトタイプ作成'],
    bestTime: { start: 10, end: 12 },
    icon: AcademicCapIcon
  },
  {
    id: 'review-session',
    name: 'レビューセッション',
    type: 'focus',
    duration: 45,
    color: 'purple',
    suggestedTasks: ['コードレビュー', '品質チェック', 'テスト', '検証'],
    icon: AcademicCapIcon
  }
]

// テンプレートからブロックを作成
export function createBlockFromTemplate(
  template: TimeBlockTemplate,
  startTime: Date
): TimeBlock {
  const endTime = addMinutes(startTime, template.duration)
  
  return {
    id: generateId(),
    title: template.name,
    color: template.color,
    type: template.type,
    startTime,
    endTime,
    tasks: [],
    isLocked: false,
    metadata: {
      templateId: template.id,
      cycles: template.cycles,
      breakDuration: template.breakDuration,
      preparationTime: template.preparationTime,
      wrapUpTime: template.wrapUpTime,
      activities: template.activities
    }
  }
}

// カテゴリー別テンプレート取得
export function getTemplatesByCategory(category: 'focus' | 'meeting' | 'break' | 'routine'): TimeBlockTemplate[] {
  return timeBlockTemplates.filter(template => template.type === category)
}

// 推奨時間帯のテンプレート取得
export function getTemplatesForTimeOfDay(hour: number): TimeBlockTemplate[] {
  return timeBlockTemplates.filter(template => {
    if (!template.bestTime) return false
    return hour >= template.bestTime.start && hour <= template.bestTime.end
  })
}

// 人気のテンプレート（よく使われるもの）
export function getPopularTemplates(): TimeBlockTemplate[] {
  const popularIds = ['deep-work', 'pomodoro', 'meeting-block', 'energy-break', 'morning-routine']
  return timeBlockTemplates.filter(template => popularIds.includes(template.id))
}

// テンプレートから推奨タスクを取得
export function getSuggestedTasksForTemplate(templateId: string): string[] {
  const template = timeBlockTemplates.find(t => t.id === templateId)
  return template?.suggestedTasks || []
}

// カスタムテンプレート作成
export function createCustomTemplate(
  name: string,
  type: TimeBlockTemplate['type'],
  duration: number,
  options: Partial<TimeBlockTemplate> = {}
): TimeBlockTemplate {
  return {
    id: `custom_${Date.now()}`,
    name,
    type,
    duration,
    color: options.color || 'gray',
    ...options
  }
}

// ポモドーロサイクル計算
export function calculatePomodoroSchedule(
  startTime: Date,
  cycles: number = 4,
  workDuration: number = 25,
  breakDuration: number = 5,
  longBreakDuration: number = 15
): TimeBlock[] {
  const blocks: TimeBlock[] = []
  let currentTime = new Date(startTime)
  
  for (let i = 0; i < cycles; i++) {
    // 作業セッション
    const workBlock = createBlockFromTemplate(
      timeBlockTemplates.find(t => t.id === 'pomodoro')!,
      currentTime
    )
    workBlock.title = `ポモドーロ ${i + 1}/${cycles}`
    workBlock.endTime = addMinutes(currentTime, workDuration)
    blocks.push(workBlock)
    
    currentTime = addMinutes(currentTime, workDuration)
    
    // 休憩（最後のサイクル以外）
    if (i < cycles - 1) {
      const isLongBreak = (i + 1) % 4 === 0
      const duration = isLongBreak ? longBreakDuration : breakDuration
      
      const breakBlock = createBlockFromTemplate(
        timeBlockTemplates.find(t => t.id === 'energy-break')!,
        currentTime
      )
      breakBlock.title = isLongBreak ? '長い休憩' : '短い休憩'
      breakBlock.endTime = addMinutes(currentTime, duration)
      blocks.push(breakBlock)
      
      currentTime = addMinutes(currentTime, duration)
    }
  }
  
  return blocks
}