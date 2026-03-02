import type { Plan } from '@/core/types/plan';

/**
 * プランがカレンダーに配置済みかどうかを判定する
 *
 * @param plan - プランオブジェクト
 * @returns 配置済みの場合 true
 */
export function isScheduled(plan: Plan): boolean {
  return plan.start_time !== null && plan.end_time !== null;
}
