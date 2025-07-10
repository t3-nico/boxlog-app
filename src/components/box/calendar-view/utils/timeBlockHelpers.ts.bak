import { format, differenceInMinutes, addMinutes, isSameDay, startOfDay, endOfDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { TimeBlock, Task } from '../types/timeBlock'

// 時間フォーマット関数
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}時間`
  }
  
  return `${hours}時間${remainingMinutes}分`
}

export function formatTimeRange(startTime: Date, endTime: Date, timeFormat: '12h' | '24h' = '24h'): string {
  const formatString = timeFormat === '12h' ? 'h:mm a' : 'HH:mm'
  
  return `${format(startTime, formatString)} - ${format(endTime, formatString)}`
}

export function formatBlockTime(block: TimeBlock, timeFormat: '12h' | '24h' = '24h'): string {
  return formatTimeRange(block.startTime, block.endTime, timeFormat)
}

// 位置計算関数
export function calculateBlockPosition(
  block: TimeBlock,
  hourHeight: number = 60,
  dayStart: Date = startOfDay(new Date())
): { top: number; height: number } {
  const startMinutes = differenceInMinutes(block.startTime, dayStart)
  const duration = differenceInMinutes(block.endTime, block.startTime)
  
  return {
    top: (startMinutes / 60) * hourHeight,
    height: Math.max((duration / 60) * hourHeight, 30) // 最小30px
  }
}

export function snapToGrid(time: Date, gridInterval: number = 15): Date {
  const minutes = time.getMinutes()
  const snappedMinutes = Math.round(minutes / gridInterval) * gridInterval
  
  const snappedTime = new Date(time)
  snappedTime.setMinutes(snappedMinutes, 0, 0)
  
  return snappedTime
}

// ブロック分析関数
export function calculateBlockProgress(block: TimeBlock): {
  completedTasks: number
  totalTasks: number
  percentage: number
} {
  const completedTasks = block.tasks.filter(task => task.status === 'completed').length
  const totalTasks = block.tasks.length
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  return { completedTasks, totalTasks, percentage }
}

export function calculateBlockEfficiency(block: TimeBlock): {
  plannedDuration: number
  actualTaskDuration: number
  efficiency: number
} {
  const plannedDuration = differenceInMinutes(block.endTime, block.startTime)
  const actualTaskDuration = block.tasks.reduce((sum, task) => sum + (task.planned_duration || 0), 0)
  const efficiency = plannedDuration > 0 ? Math.round((actualTaskDuration / plannedDuration) * 100) : 0
  
  return { plannedDuration, actualTaskDuration, efficiency }
}

export function getBlockPriorityLevel(block: TimeBlock): 'low' | 'medium' | 'high' {
  if (block.tasks.length === 0) return 'medium'
  
  const priorities = block.tasks.map(task => task.priority || 'medium')
  const highCount = priorities.filter(p => p === 'high').length
  const mediumCount = priorities.filter(p => p === 'medium').length
  
  if (highCount > 0) return 'high'
  if (mediumCount > priorities.length / 2) return 'medium'
  return 'low'
}

// 時間衝突検出
export function detectTimeConflicts(
  blocks: TimeBlock[], 
  excludeBlockId?: string
): Array<{ block1: TimeBlock; block2: TimeBlock; overlapMinutes: number }> {
  const conflicts: Array<{ block1: TimeBlock; block2: TimeBlock; overlapMinutes: number }> = []
  const filteredBlocks = blocks.filter(block => block.id !== excludeBlockId)
  
  for (let i = 0; i < filteredBlocks.length; i++) {
    for (let j = i + 1; j < filteredBlocks.length; j++) {
      const block1 = filteredBlocks[i]
      const block2 = filteredBlocks[j]
      
      // 重複チェック
      const overlapStart = new Date(Math.max(block1.startTime.getTime(), block2.startTime.getTime()))
      const overlapEnd = new Date(Math.min(block1.endTime.getTime(), block2.endTime.getTime()))
      
      if (overlapStart < overlapEnd) {
        const overlapMinutes = differenceInMinutes(overlapEnd, overlapStart)
        conflicts.push({ block1, block2, overlapMinutes })
      }
    }
  }
  
  return conflicts
}

export function findOptimalGap(
  blocks: TimeBlock[],
  requiredDuration: number,
  startTime: Date,
  endTime: Date
): Date | null {
  const sortedBlocks = blocks
    .filter(block => 
      (block.startTime >= startTime && block.startTime <= endTime) ||
      (block.endTime >= startTime && block.endTime <= endTime) ||
      (block.startTime <= startTime && block.endTime >= endTime)
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  
  // 最初のブロック前の隙間をチェック
  if (sortedBlocks.length === 0) {
    return startTime
  }
  
  const firstBlockStart = sortedBlocks[0].startTime
  if (differenceInMinutes(firstBlockStart, startTime) >= requiredDuration) {
    return startTime
  }
  
  // ブロック間の隙間をチェック
  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const currentBlockEnd = sortedBlocks[i].endTime
    const nextBlockStart = sortedBlocks[i + 1].startTime
    
    const gapDuration = differenceInMinutes(nextBlockStart, currentBlockEnd)
    if (gapDuration >= requiredDuration) {
      return currentBlockEnd
    }
  }
  
  // 最後のブロック後の隙間をチェック
  const lastBlockEnd = sortedBlocks[sortedBlocks.length - 1].endTime
  if (differenceInMinutes(endTime, lastBlockEnd) >= requiredDuration) {
    return lastBlockEnd
  }
  
  return null
}

// ブロック分類とフィルタリング
export function groupBlocksByType(blocks: TimeBlock[]): Record<TimeBlock['type'], TimeBlock[]> {
  return blocks.reduce((groups, block) => {
    const type = block.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(block)
    return groups
  }, {} as Record<TimeBlock['type'], TimeBlock[]>)
}

export function filterBlocksByDate(blocks: TimeBlock[], date: Date): TimeBlock[] {
  return blocks.filter(block => 
    isSameDay(block.startTime, date) || 
    isSameDay(block.endTime, date) ||
    (block.startTime <= startOfDay(date) && block.endTime >= endOfDay(date))
  )
}

export function getBlocksInTimeRange(
  blocks: TimeBlock[], 
  startTime: Date, 
  endTime: Date
): TimeBlock[] {
  return blocks.filter(block =>
    (block.startTime >= startTime && block.startTime <= endTime) ||
    (block.endTime >= startTime && block.endTime <= endTime) ||
    (block.startTime <= startTime && block.endTime >= endTime)
  )
}

// ブロック操作
export function splitTimeBlock(
  block: TimeBlock, 
  splitTime: Date
): { before: TimeBlock; after: TimeBlock } | null {
  if (splitTime <= block.startTime || splitTime >= block.endTime) {
    return null
  }
  
  const beforeTasks = block.tasks.slice(0, Math.floor(block.tasks.length / 2))
  const afterTasks = block.tasks.slice(Math.floor(block.tasks.length / 2))
  
  const before: TimeBlock = {
    ...block,
    id: `${block.id}_split_1`,
    endTime: splitTime,
    tasks: beforeTasks,
    title: `${block.title} (前半)`
  }
  
  const after: TimeBlock = {
    ...block,
    id: `${block.id}_split_2`,
    startTime: splitTime,
    tasks: afterTasks,
    title: `${block.title} (後半)`
  }
  
  return { before, after }
}

export function mergeTimeBlocks(block1: TimeBlock, block2: TimeBlock): TimeBlock | null {
  // 連続している、または重複しているブロックのみマージ可能
  const gap = Math.abs(differenceInMinutes(block1.endTime, block2.startTime))
  if (gap > 15) return null // 15分以上の隙間がある場合はマージしない
  
  const startTime = block1.startTime <= block2.startTime ? block1.startTime : block2.startTime
  const endTime = block1.endTime >= block2.endTime ? block1.endTime : block2.endTime
  
  return {
    id: `merged_${Date.now()}`,
    title: `${block1.title} + ${block2.title}`,
    color: block1.color, // 最初のブロックの色を使用
    type: block1.type, // 最初のブロックのタイプを使用
    startTime,
    endTime,
    tasks: [...block1.tasks, ...block2.tasks],
    isLocked: false,
    metadata: {
      mergedFrom: [block1.id, block2.id]
    }
  }
}

// エクスポート/インポート用ユーティリティ
export function exportBlocksToJSON(blocks: TimeBlock[]): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    blocks: blocks.map(block => ({
      ...block,
      startTime: block.startTime.toISOString(),
      endTime: block.endTime.toISOString()
    }))
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function importBlocksFromJSON(jsonString: string): TimeBlock[] {
  try {
    const importData = JSON.parse(jsonString)
    
    if (!importData.blocks || !Array.isArray(importData.blocks)) {
      throw new Error('Invalid format: missing blocks array')
    }
    
    return importData.blocks.map((blockData: any) => ({
      ...blockData,
      startTime: new Date(blockData.startTime),
      endTime: new Date(blockData.endTime)
    }))
  } catch (error) {
    throw new Error(`Failed to import blocks: ${error}`)
  }
}

// ブロック統計
export function calculateDailyBlockStats(blocks: TimeBlock[], date: Date) {
  const dayBlocks = filterBlocksByDate(blocks, date)
  const grouped = groupBlocksByType(dayBlocks)
  
  const totalDuration = dayBlocks.reduce(
    (sum, block) => sum + differenceInMinutes(block.endTime, block.startTime),
    0
  )
  
  const completedTasks = dayBlocks.reduce(
    (sum, block) => sum + block.tasks.filter(task => task.status === 'completed').length,
    0
  )
  
  const totalTasks = dayBlocks.reduce(
    (sum, block) => sum + block.tasks.length,
    0
  )
  
  return {
    date,
    totalBlocks: dayBlocks.length,
    totalDuration,
    completedTasks,
    totalTasks,
    productivityRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    typeBreakdown: Object.entries(grouped).map(([type, blocks]) => ({
      type: type as TimeBlock['type'],
      count: blocks.length,
      duration: blocks.reduce(
        (sum, block) => sum + differenceInMinutes(block.endTime, block.startTime),
        0
      )
    }))
  }
}

// ブロック検証
export function validateTimeBlock(block: Partial<TimeBlock>): string[] {
  const errors: string[] = []
  
  if (!block.title || block.title.trim().length === 0) {
    errors.push('タイトルは必須です')
  }
  
  if (!block.startTime) {
    errors.push('開始時間は必須です')
  }
  
  if (!block.endTime) {
    errors.push('終了時間は必須です')
  }
  
  if (block.startTime && block.endTime) {
    if (block.startTime >= block.endTime) {
      errors.push('終了時間は開始時間より後である必要があります')
    }
    
    const duration = differenceInMinutes(block.endTime, block.startTime)
    if (duration < 5) {
      errors.push('ブロックの最小時間は5分です')
    }
    
    if (duration > 480) { // 8時間
      errors.push('ブロックの最大時間は8時間です')
    }
  }
  
  if (!block.type || !['focus', 'meeting', 'break', 'routine'].includes(block.type)) {
    errors.push('有効なブロックタイプを選択してください')
  }
  
  return errors
}

// 色管理
export function getBlockTypeColor(type: TimeBlock['type']): {
  primary: string
  secondary: string
  background: string
  border: string
} {
  const colorMap = {
    focus: {
      primary: '#8b5cf6', // purple-500
      secondary: '#a78bfa', // purple-400
      background: '#f3e8ff', // purple-50
      border: '#8b5cf6'
    },
    meeting: {
      primary: '#3b82f6', // blue-500
      secondary: '#60a5fa', // blue-400
      background: '#eff6ff', // blue-50
      border: '#3b82f6'
    },
    break: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      background: '#ecfdf5', // emerald-50
      border: '#10b981'
    },
    routine: {
      primary: '#f59e0b', // amber-500
      secondary: '#fbbf24', // amber-400
      background: '#fffbeb', // amber-50
      border: '#f59e0b'
    }
  }
  
  return colorMap[type]
}