import type { Plan, PlanStatus } from '../types/plan';

/**
 * 旧ステータス値を新ステータス値にマッピング
 *
 * DBに旧ステータス値（todo, doing, backlog, ready, active, wait, cancel）が
 * 残っている可能性があるため、全て 'open' または 'done' に変換する。
 *
 * @param status - DBから取得したステータス値
 * @returns 正規化されたステータス ('open' | 'done')
 */
export function normalizeStatus(status: string): PlanStatus {
  // 新ステータス値はそのまま
  if (status === 'open' || status === 'done') {
    return status;
  }

  // 旧ステータス値のマッピング
  switch (status) {
    // 完了系 → done
    case 'done':
    case 'cancel':
      return 'done';

    // 未完了系 → open
    case 'todo':
    case 'doing':
    case 'backlog':
    case 'ready':
    case 'active':
    case 'wait':
    default:
      return 'open';
  }
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
  // 正規化したステータスで判定（旧ステータス値も考慮）
  if (normalizeStatus(plan.status) === 'done') {
    return false;
  }

  if (!plan.end_time) {
    return false;
  }

  return new Date(plan.end_time) < new Date();
}

/**
 * プランがカレンダーに配置済みかどうかを判定する
 *
 * @param plan - プランオブジェクト
 * @returns 配置済みの場合 true
 */
export function isScheduled(plan: Plan): boolean {
  return plan.start_time !== null && plan.end_time !== null;
}
