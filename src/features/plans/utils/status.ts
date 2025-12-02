import type { Plan, PlanStatus } from '../types/plan'

/**
 * getEffectiveStatusに必要な最小プロパティ
 * InboxItemとPlan両方に対応するため、start_timeはundefinedも許容
 */
type StatusInput = {
  status: PlanStatus
  start_time?: string | null | undefined
}

/**
 * プランの実効ステータスを計算する
 *
 * DBには 'done' かどうかのみ保存。
 * 'doing' は start_time / log_id から計算で導出。
 *
 * @param plan - プランオブジェクト（statusとstart_timeが必要）
 * @returns 実効ステータス ('todo' | 'doing' | 'done')
 */
export function getEffectiveStatus(plan: StatusInput): PlanStatus {
  // 明示的にdoneならdone
  if (plan.status === 'done') {
    return 'done'
  }

  // カレンダー配置あり（start_time がある）→ doing
  if (plan.start_time) {
    return 'doing'
  }

  // TODO: Log紐づけ判定（Log機能実装後に追加）
  // if (plan.log_id) {
  //   return 'doing'
  // }

  // それ以外 → todo
  return 'todo'
}

/**
 * プランをTodoに戻せるかどうかを判定する
 *
 * Logが紐づいている場合は戻せない
 *
 * @param plan - プランオブジェクト
 * @returns Todoに戻せる場合 true
 */
export function canRevertToTodo(plan: Plan): boolean {
  // TODO: Log紐づけ判定（Log機能実装後に追加）
  // return !plan.log_id && !plan.start_time
  return !plan.start_time
}

/**
 * プランが「やり残し」かどうかを判定する
 *
 * 過去に配置されているがdoneになっていない場合
 *
 * @param plan - プランオブジェクト
 * @returns やり残しの場合 true
 */
export function isOverdue(plan: Plan): boolean {
  if (plan.status === 'done') {
    return false
  }

  if (!plan.end_time) {
    return false
  }

  return new Date(plan.end_time) < new Date()
}
