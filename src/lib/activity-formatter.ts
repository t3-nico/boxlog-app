/**
 * Activity Formatter ファクトリ
 *
 * Plan/Record共通のアクティビティ表示フォーマット。
 * エンティティ固有のアクションタイプ → 表示情報 のマッピングを受け取り、
 * フィルタリング・フォーマット関数を返す。
 */

/** アイコン色の種別 */
export type ActivityIconColor = 'success' | 'info' | 'warning' | 'primary' | 'destructive';

/** アイコン種別 */
export type ActivityIconType = 'create' | 'status' | 'tag' | 'delete' | 'time' | 'fulfillment';

/** アクションタイプごとの表示定義 */
interface ActivityActionConfig {
  /** i18nキー（例: 'plan.activity.created'） */
  labelKey: string;
  /** アイコン種別 */
  icon: ActivityIconType;
  /** アイコン色 */
  iconColor: ActivityIconColor;
  /** detail 文字列を生成する関数（old_value, new_value から） */
  formatDetail?: (oldValue: string | null, newValue: string | null) => string | undefined;
}

/** フォーマット後の表示情報 */
export interface FormattedActivity {
  actionLabelKey: string;
  detail?: string | undefined;
  icon: ActivityIconType;
  iconColor: ActivityIconColor;
}

/** ファクトリ入力: アクティビティの最小型 */
interface ActivityLike {
  action_type: string;
  old_value?: string | null;
  new_value?: string | null;
}

/**
 * "TIMESTAMPTZ - TIMESTAMPTZ" 形式の時間範囲を "HH:MM - HH:MM" に整形
 * 例: "2026-02-10T09:00:00+09:00 - 2026-02-10T10:00:00+09:00" → "09:00 - 10:00"
 */
export function formatTimeRange(value: string): string {
  const parts = value.split(' - ');
  if (parts.length !== 2) return value;

  const formatTime = (raw: string): string => {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const start = parts[0];
  const end = parts[1];
  if (!start || !end) return value;
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/** old → new の変更詳細を生成（両方存在する場合のみ） */
function defaultTransitionDetail(
  oldValue: string | null,
  newValue: string | null,
): string | undefined {
  if (oldValue && newValue) return `${oldValue} → ${newValue}`;
  return undefined;
}

/** new_value をそのまま返す */
function newValueDetail(_oldValue: string | null, newValue: string | null): string | undefined {
  return newValue ?? undefined;
}

/** old_value をそのまま返す */
function oldValueDetail(oldValue: string | null, _newValue: string | null): string | undefined {
  return oldValue ?? undefined;
}

/** new → old（削除系） */
function removedValueDetail(oldValue: string | null, newValue: string | null): string | undefined {
  if (newValue) return newValue;
  if (oldValue) return `${oldValue} → —`;
  return undefined;
}

// -------------------------------------------------------------------------
// ファクトリ
// -------------------------------------------------------------------------

interface CreateActivityFormatterOptions<T extends string> {
  /** 表示対象のアクションタイプ */
  visibleTypes: Set<T>;
  /** アクションタイプ → 表示定義のマッピング */
  config: Partial<Record<T, ActivityActionConfig>>;
  /** デフォルトの表示定義（configに存在しないアクションタイプ用） */
  defaultConfig: ActivityActionConfig;
}

export function createActivityFormatter<T extends string>(
  options: CreateActivityFormatterOptions<T>,
) {
  const { visibleTypes, config, defaultConfig } = options;

  function isVisible(activity: { action_type: T }): boolean {
    return visibleTypes.has(activity.action_type);
  }

  function filterVisible<A extends { action_type: T }>(activities: A[]): A[] {
    return activities.filter(isVisible);
  }

  function format(activity: ActivityLike & { action_type: T }): FormattedActivity {
    const actionConfig = config[activity.action_type] ?? defaultConfig;
    const detail = actionConfig.formatDetail
      ? actionConfig.formatDetail(activity.old_value ?? null, activity.new_value ?? null)
      : undefined;

    return {
      actionLabelKey: actionConfig.labelKey,
      detail,
      icon: actionConfig.icon,
      iconColor: actionConfig.iconColor,
    };
  }

  return { isVisible, filterVisible, format };
}

// -------------------------------------------------------------------------
// 共通ヘルパー（各エンティティのconfig構築用）
// -------------------------------------------------------------------------

export const detailHelpers = {
  transition: defaultTransitionDetail,
  newValue: newValueDetail,
  oldValue: oldValueDetail,
  removed: removedValueDetail,
} as const;
