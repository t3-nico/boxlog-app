'use client'

import { MobileSettingsRadioGroup, MobileSettingsSection } from '@/components/common'
import { Calendar } from 'lucide-react'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * 期限フィルター選択肢
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日期限' },
  { value: 'tomorrow', label: '明日期限' },
  { value: 'this_week', label: '今週中' },
  { value: 'next_week', label: '来週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'no_due_date', label: '期限なし' },
]

/**
 * Inbox Board用フィルターコンテンツ
 *
 * TableNavigationのフィルターシートに表示する内容
 * - 期限フィルター
 * ※ステータスはカンバンのカラムで表現されるためフィルター不要
 */
export function InboxBoardFilterContent() {
  const { dueDate, setDueDate } = useInboxFilterStore()

  return (
    <MobileSettingsSection icon={<Calendar />} title="期限" showSeparator={false}>
      <MobileSettingsRadioGroup
        options={DUE_DATE_OPTIONS}
        value={dueDate}
        onValueChange={setDueDate}
        idPrefix="board-filter-due-date"
      />
    </MobileSettingsSection>
  )
}
