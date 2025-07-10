import { addMinutes, isWithinInterval, differenceInMinutes, startOfDay, endOfDay } from 'date-fns'
import type { TimeBlock, TimeSuggestion, UserPreferences } from '../types/timeBlock'

// クロノタイプ定義
export const CHRONOTYPE_PROFILES = {
  morning: {
    peakTimes: [
      { start: 8, end: 10, energy: 100 },
      { start: 10, end: 12, energy: 90 }
    ],
    lowTimes: [
      { start: 13, end: 15, energy: 40 },
      { start: 16, end: 18, energy: 60 }
    ]
  },
  evening: {
    peakTimes: [
      { start: 14, end: 16, energy: 90 },
      { start: 18, end: 20, energy: 100 }
    ],
    lowTimes: [
      { start: 8, end: 10, energy: 40 },
      { start: 11, end: 13, energy: 60 }
    ]
  },
  custom: {
    peakTimes: [],
    lowTimes: []
  }
}

// 時間スロットの可用性チェック
export function isTimeSlotAvailable(
  startTime: Date,
  duration: number,
  existingBlocks: TimeBlock[]
): boolean {
  const endTime = addMinutes(startTime, duration)
  
  return !existingBlocks.some(block => {
    const blockStart = block.startTime
    const blockEnd = block.endTime
    
    // 重複チェック
    return (
      (startTime < blockEnd && endTime > blockStart) ||
      (startTime <= blockStart && endTime >= blockEnd)
    )
  })
}

// クロノタイプのピーク時間取得
export function getChronotypePeakTimes(chronotype: string): Array<{ start: number; end: number; energy: number }> {
  const profile = CHRONOTYPE_PROFILES[chronotype as keyof typeof CHRONOTYPE_PROFILES] || CHRONOTYPE_PROFILES.morning
  return profile.peakTimes
}

// エネルギーレベルの低い時間帯を検出
export function findLowEnergyPeriods(existingBlocks: TimeBlock[]): Date[] {
  const lowEnergyTimes: Date[] = []
  const workBlocks = existingBlocks.filter(block => block.type === 'focus' || block.type === 'meeting')
  
  workBlocks.forEach(block => {
    const duration = differenceInMinutes(block.endTime, block.startTime)
    if (duration > 90) { // 90分以上の作業後
      lowEnergyTimes.push(block.endTime)
    }
  })
  
  return lowEnergyTimes
}

// 連続作業時間の検出
export function findContinuousWorkPeriods(existingBlocks: TimeBlock[]): Array<{ start: Date; end: Date; duration: number }> {
  const workBlocks = existingBlocks
    .filter(block => block.type === 'focus' || block.type === 'meeting')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  
  const continuousPeriods: Array<{ start: Date; end: Date; duration: number }> = []
  let currentPeriod: { start: Date; end: Date } | null = null
  
  workBlocks.forEach(block => {
    if (!currentPeriod) {
      currentPeriod = { start: block.startTime, end: block.endTime }
      return
    }
    
    const gap = differenceInMinutes(block.startTime, currentPeriod.end)
    
    if (gap <= 15) { // 15分以内の隙間は連続とみなす
      currentPeriod.end = block.endTime
    } else {
      // 現在の期間を保存
      const duration = differenceInMinutes(currentPeriod.end, currentPeriod.start)
      if (duration > 60) { // 1時間以上の場合のみ記録
        continuousPeriods.push({
          start: currentPeriod.start,
          end: currentPeriod.end,
          duration
        })
      }
      
      // 新しい期間を開始
      currentPeriod = { start: block.startTime, end: block.endTime }
    }
  })
  
  // 最後の期間を処理
  if (currentPeriod) {
    const duration = differenceInMinutes(currentPeriod.end, currentPeriod.start)
    if (duration > 60) {
      continuousPeriods.push({
        start: currentPeriod.start,
        end: currentPeriod.end,
        duration
      })
    }
  }
  
  return continuousPeriods
}

// エネルギーレベル計算
export function calculateEnergyLevel(time: Date, chronotype: string): number {
  const hour = time.getHours()
  const profile = CHRONOTYPE_PROFILES[chronotype as keyof typeof CHRONOTYPE_PROFILES] || CHRONOTYPE_PROFILES.morning
  
  // ピーク時間をチェック
  for (const peak of profile.peakTimes) {
    if (hour >= peak.start && hour < peak.end) {
      return peak.energy
    }
  }
  
  // 低エネルギー時間をチェック
  for (const low of profile.lowTimes) {
    if (hour >= low.start && hour < low.end) {
      return low.energy
    }
  }
  
  // デフォルトエネルギーレベル
  return 70
}

// メインの最適配置提案アルゴリズム
export function suggestOptimalBlockPlacement(
  block: TimeBlock,
  existingBlocks: TimeBlock[],
  preferences: UserPreferences,
  targetDate: Date = new Date()
): TimeSuggestion[] {
  const suggestions: TimeSuggestion[] = []
  const dayStart = startOfDay(targetDate)
  const dayEnd = endOfDay(targetDate)
  
  // 15分間隔でチェック
  const timeSlots = []
  for (let time = new Date(dayStart); time < dayEnd; time = addMinutes(time, 15)) {
    if (time.getHours() >= preferences.workingHours.start && 
        time.getHours() < preferences.workingHours.end) {
      timeSlots.push(new Date(time))
    }
  }
  
  timeSlots.forEach(timeSlot => {
    if (!isTimeSlotAvailable(timeSlot, differenceInMinutes(block.endTime, block.startTime), existingBlocks)) {
      return
    }
    
    let score = 50 // ベーススコア
    let reasons: string[] = []
    
    // 1. クロノタイプに基づく最適時間
    if (block.type === 'focus') {
      const energyLevel = calculateEnergyLevel(timeSlot, preferences.chronotype)
      score += energyLevel * 0.5
      
      if (energyLevel >= 90) {
        reasons.push('あなたの生産性ピーク時間です')
      } else if (energyLevel >= 70) {
        reasons.push('集中作業に適した時間です')
      }
    }
    
    // 2. 適切な休憩配置
    if (block.type === 'break') {
      const workSessions = findContinuousWorkPeriods(existingBlocks)
      let isAfterLongWork = false
      
      workSessions.forEach(session => {
        if (session.duration > 90) { // 90分以上の作業後
          const timeSinceWork = differenceInMinutes(timeSlot, session.end)
          if (timeSinceWork >= 0 && timeSinceWork <= 30) {
            score += 40
            isAfterLongWork = true
          }
        }
      })
      
      if (isAfterLongWork) {
        reasons.push('長時間作業の後の休憩が推奨されます')
      }
      
      // 昼食時間の考慮
      const hour = timeSlot.getHours()
      if (hour >= 12 && hour <= 13 && block.title.includes('ランチ')) {
        score += 30
        reasons.push('昼食に最適な時間です')
      }
    }
    
    // 3. ミーティングの最適配置
    if (block.type === 'meeting') {
      const hour = timeSlot.getHours()
      
      // 一般的なミーティング時間
      if ((hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 16)) {
        score += 20
        reasons.push('ミーティングに適した時間帯です')
      }
      
      // 午前の後半や午後の早い時間は避ける
      if (hour === 11 || hour === 12) {
        score -= 10
      }
    }
    
    // 4. コンテキストスイッチの最小化
    const adjacentBlocks = existingBlocks.filter(existingBlock => {
      const timeDiff = Math.abs(differenceInMinutes(timeSlot, existingBlock.endTime))
      return timeDiff <= 30
    })
    
    const sameTypeAdjacent = adjacentBlocks.find(adjacent => adjacent.type === block.type)
    if (sameTypeAdjacent) {
      score += 25
      reasons.push('同じ種類のタスクをまとめて効率化')
    }
    
    // 5. 時間帯による調整
    const hour = timeSlot.getHours()
    
    // 朝のルーティン
    if (block.type === 'routine' && block.title.includes('モーニング')) {
      if (hour >= 8 && hour <= 9) {
        score += 35
        reasons.push('朝のルーティンに最適な時間です')
      }
    }
    
    // 夕方のルーティン
    if (block.type === 'routine' && block.title.includes('イブニング')) {
      if (hour >= 17 && hour <= 18) {
        score += 35
        reasons.push('夕方のルーティンに最適な時間です')
      }
    }
    
    // 6. 既存のブロックとの適切な間隔
    const nearbyBlocks = existingBlocks.filter(existingBlock => {
      const startDiff = Math.abs(differenceInMinutes(timeSlot, existingBlock.startTime))
      const endDiff = Math.abs(differenceInMinutes(timeSlot, existingBlock.endTime))
      return Math.min(startDiff, endDiff) <= 60
    })
    
    if (nearbyBlocks.length === 0) {
      score += 10
      reasons.push('他のタスクから適度な間隔があります')
    } else if (nearbyBlocks.length > 3) {
      score -= 20 // 詰まりすぎている
    }
    
    // 7. 疲労度の考慮
    const continuousWork = findContinuousWorkPeriods(existingBlocks)
    let fatigueLevel = 0
    
    continuousWork.forEach(period => {
      if (timeSlot >= period.start && timeSlot <= period.end) {
        fatigueLevel = Math.min(period.duration / 60, 4) * 10 // 最大40点減点
      }
    })
    
    score -= fatigueLevel
    
    if (fatigueLevel > 20) {
      reasons.push('連続作業による疲労が懸念されます')
    }
    
    // スコアの正規化
    score = Math.max(0, Math.min(100, score))
    
    if (score > 30) { // 最小スコア閾値
      suggestions.push({
        time: timeSlot,
        score: Math.round(score),
        reason: reasons.length > 0 ? reasons[0] : '利用可能な時間です'
      })
    }
  })
  
  // スコア順にソートして上位10個を返す
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

// 特定の時間帯の推奨度を評価
export function evaluateTimeSlot(
  time: Date,
  blockType: TimeBlock['type'],
  existingBlocks: TimeBlock[],
  preferences: UserPreferences
): { score: number; reasons: string[] } {
  let score = 50
  const reasons: string[] = []
  
  const hour = time.getHours()
  const energyLevel = calculateEnergyLevel(time, preferences.chronotype)
  
  switch (blockType) {
    case 'focus':
      score += energyLevel * 0.4
      if (energyLevel >= 90) reasons.push('高い集中力が期待できます')
      break
      
    case 'meeting':
      if (hour >= 9 && hour <= 16) {
        score += 20
        reasons.push('ミーティングに適した時間帯です')
      }
      break
      
    case 'break':
      const workPeriods = findContinuousWorkPeriods(existingBlocks)
      const needsBreak = workPeriods.some(period => 
        Math.abs(differenceInMinutes(time, period.end)) <= 30 && period.duration > 90
      )
      if (needsBreak) {
        score += 30
        reasons.push('適切な休憩タイミングです')
      }
      break
      
    case 'routine':
      if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
        score += 25
        reasons.push('ルーティンに適した時間です')
      }
      break
  }
  
  return { score: Math.round(score), reasons }
}

// 一日のエネルギー分布を計算
export function calculateDailyEnergyDistribution(
  chronotype: string,
  date: Date = new Date()
): Array<{ hour: number; energy: number }> {
  const distribution = []
  
  for (let hour = 0; hour < 24; hour++) {
    const testTime = new Date(date)
    testTime.setHours(hour, 0, 0, 0)
    
    const energy = calculateEnergyLevel(testTime, chronotype)
    distribution.push({ hour, energy })
  }
  
  return distribution
}

// 最適な休憩間隔を提案
export function suggestBreakIntervals(
  workBlocks: TimeBlock[],
  preferences: UserPreferences
): TimeSuggestion[] {
  const suggestions: TimeSuggestion[] = []
  const sortedBlocks = workBlocks
    .filter(block => block.type === 'focus' || block.type === 'meeting')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const currentBlock = sortedBlocks[i]
    const nextBlock = sortedBlocks[i + 1]
    
    const gap = differenceInMinutes(nextBlock.startTime, currentBlock.endTime)
    const currentDuration = differenceInMinutes(currentBlock.endTime, currentBlock.startTime)
    
    // 90分以上の作業後、または4時間以上の間隔がある場合
    if (currentDuration >= 90 || gap >= 240) {
      const breakTime = currentBlock.endTime
      const score = currentDuration >= 120 ? 90 : 70
      
      suggestions.push({
        time: breakTime,
        score,
        reason: currentDuration >= 90 
          ? '長時間作業の後の休憩が推奨されます'
          : '適度な休憩でリフレッシュしましょう'
      })
    }
  }
  
  return suggestions.sort((a, b) => b.score - a.score)
}