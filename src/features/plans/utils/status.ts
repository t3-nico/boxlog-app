import type { Plan, PlanStatus } from '../types/plan'

/**
 * getEffectiveStatusに必要な最小プロパティ
 * InboxItemとPlan両方に対応するため、start_timeはundefinedも許容
 * DBには旧ステータス値が残っている可能性があるため、stringも許容
 */
type StatusInput = {
  status: PlanStatus | string
  start_time?: string | null | undefined
}

/**
 * 旧ステータス値を新ステータス値にマッピング
 * DB移行完了後は削除可能
 */
function normalizeStatus(status: string): PlanStatus {
  // 新ステータス値はそのまま
  if (status === 'todo' || status === 'doing' || status === 'done') {
    return status
  }

  // 旧ステータス値のマッピング
  switch (status) {
    case 'backlog':
    case 'ready':
      return 'todo'
    case 'active':
    case 'wait':
      return 'doing'
    case 'cancel':
      return 'done' // cancelはdoneとして扱う
    default:
      // 未知のステータスはtodoとして扱う
      return 'todo'
  }
}

/**
 * プランの実効ステータスを計算する
 *
 * DBには 'done' かどうかのみ保存。
 * 'doing' は start_time / log_id から計算で導出。
 * 旧ステータス値（backlog, ready, active, wait, cancel）も正しく変換。
 *
 * @param plan - プランオブジェクト（statusとstart_timeが必要）
 * @returns 実効ステータス ('todo' | 'doing' | 'done')
 */
export function getEffectiveStatus(plan: StatusInput): PlanStatus {
  // まずステータスを正規化
  const normalizedStatus = normalizeStatus(plan.status)

  // 明示的にdoneならdone
  if (normalizedStatus === 'done') {
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

  // それ以外 → 正規化されたステータス（todoまたはdoing）
  return normalizedStatus
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
  // 実効ステータスで判定（旧ステータス値も考慮）
  if (getEffectiveStatus(plan) === 'done') {
    return false
  }

  if (!plan.end_time) {
    return false
  }

  return new Date(plan.end_time) < new Date()
}
