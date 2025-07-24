import { createClient } from './client'
import type { LogFormData } from '@/components/add-popup/LogCreateForm'

const supabase = createClient()

export async function createTaskRecord(formData: LogFormData) {
  try {
    // 開始・終了日時を組み合わせてタイムスタンプを作成
    const actualStart = new Date(`${formData.actualStart}T${formData.actualStartTime}`)
    const actualEnd = new Date(`${formData.actualEnd}T${formData.actualEndTime}`)
    
    // 継続時間を分で計算
    const actualDuration = Math.round((actualEnd.getTime() - actualStart.getTime()) / (1000 * 60))

    // フォームデータをSupabaseテーブル形式に変換
    const recordData = {
      title: formData.title,
      actual_start: actualStart.toISOString(),
      actual_end: actualEnd.toISOString(),
      actual_duration: actualDuration,
      satisfaction: formData.satisfaction,
      focus_level: formData.focusLevel,
      energy_level: formData.energyLevel,
      interruptions: formData.interruptions,
      memo: formData.memo || null,
    }

    const { data, error } = await supabase
      .from('task_records')
      .insert(recordData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create task record:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating task record:', error)
    throw error
  }
}

export async function getTaskRecords(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('task_records')
      .select('*')
      .order('actual_start', { ascending: false })

    if (startDate) {
      query = query.gte('actual_start', `${startDate}T00:00:00`)
    }
    if (endDate) {
      query = query.lte('actual_start', `${endDate}T23:59:59`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch task records:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching task records:', error)
    throw error
  }
}