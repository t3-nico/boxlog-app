import type { CalendarPlan } from '../../../types/calendar.types';

/**
 * プラングループ - 重なり合うプランの集合
 */
export interface PlanLayoutGroup {
  id: string;
  plans: CalendarPlan[];
  startTime: Date;
  endTime: Date;
  maxColumns: number;
}

/**
 * 列割り当て情報
 */
export interface ColumnAssignment {
  planId: string;
  column: number; // 0から始まる列インデックス
  totalColumns: number; // このグループの総列数
  width: number; // パーセンテージ (0-100)
  left: number; // 左位置のパーセンテージ (0-100)
}

/**
 * レイアウト適用後のプラン
 */
export interface LayoutedPlan extends CalendarPlan {
  layout: {
    column: number;
    totalColumns: number;
    width: number; // パーセンテージ
    left: number; // パーセンテージ
    top: number; // ピクセルまたはパーセンテージ
    height: number; // ピクセルまたはパーセンテージ
    zIndex: number;
  };
}

/**
 * プラン位置情報（内部用）
 */
interface PlanPosition {
  plan: CalendarPlan;
  start: number; // 分単位
  end: number; // 分単位
  column?: number | undefined;
  columns?: number | undefined;
}

// 最大列数制限
const MAX_COLUMNS = 2;

// 最小プラン幅（パーセンテージ）
const MIN_PLAN_WIDTH = 45; // 2列の場合は各列45%程度

// プラン間マージン（パーセンテージ）
const PLAN_MARGIN = 2;

/**
 * 2つのプランが時間的に重なっているかを判定
 */
function plansOverlap(plan1: CalendarPlan, plan2: CalendarPlan): boolean {
  // startDate が null の場合は重ならないと判定
  if (!plan1.startDate || !plan2.startDate) {
    return false;
  }

  const start1 = plan1.startDate.getTime();
  const end1 = plan1.endDate?.getTime() || plan1.startDate.getTime();
  const start2 = plan2.startDate.getTime();
  const end2 = plan2.endDate?.getTime() || plan2.startDate.getTime();

  return start1 < end2 && start2 < end1;
}

/**
 * 時刻を分単位に変換（その日の0時からの経過分）
 */
function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * 重なり合うプランをグループ化
 * @param plans カレンダープランの配列
 * @returns プラングループの配列
 */
export function detectOverlappingPlans(plans: CalendarPlan[]): PlanLayoutGroup[] {
  if (plans.length === 0) return [];

  // 日付ごとにプランを分類
  const plansByDay = new Map<string, CalendarPlan[]>();

  plans.forEach((plan) => {
    // startDate が null の場合はスキップ
    if (!plan.startDate) {
      return;
    }

    const dayKey = `${plan.startDate.getFullYear()}-${plan.startDate.getMonth()}-${plan.startDate.getDate()}`;
    const dayPlans = plansByDay.get(dayKey) || [];
    dayPlans.push(plan);
    plansByDay.set(dayKey, dayPlans);
  });

  const groups: PlanLayoutGroup[] = [];

  // 各日のプランをグループ化
  plansByDay.forEach((dayPlans, dayKey) => {
    // 開始時刻でソート（startDate が null の場合は現在時刻を使用）
    const sortedPlans = [...dayPlans].sort(
      (a, b) => (a.startDate?.getTime() ?? Date.now()) - (b.startDate?.getTime() ?? Date.now()),
    );

    // 重なるプランをグループ化
    const dayGroups: CalendarPlan[][] = [];

    sortedPlans.forEach((plan) => {
      let addedToGroup = false;

      // 既存のグループに追加できるかチェック
      for (const group of dayGroups) {
        if (group.some((groupPlan) => plansOverlap(plan, groupPlan))) {
          group.push(plan);
          addedToGroup = true;
          break;
        }
      }

      // どのグループにも追加できなかった場合、新しいグループを作成
      if (!addedToGroup) {
        dayGroups.push([plan]);
      }
    });

    // 隣接するグループをマージ（より正確なグループ化）
    const mergedGroups: CalendarPlan[][] = [];

    dayGroups.forEach((group) => {
      let merged = false;

      for (let i = 0; i < mergedGroups.length; i++) {
        const mergedGroup = i < mergedGroups.length && i in mergedGroups ? mergedGroups[i] : null;
        if (!mergedGroup) continue;
        // グループ同士が重なるかチェック
        const hasOverlap = group.some((plan1) =>
          mergedGroup.some((plan2) => plansOverlap(plan1, plan2)),
        );

        if (hasOverlap) {
          // マージ
          mergedGroups[i] = [...mergedGroup, ...group];
          merged = true;
          break;
        }
      }

      if (!merged) {
        mergedGroups.push(group);
      }
    });

    // PlanLayoutGroup オブジェクトを作成
    mergedGroups.forEach((group, index) => {
      const startTime = new Date(
        Math.min(...group.map((p) => p.startDate?.getTime() ?? Date.now())),
      );
      const endTime = new Date(
        Math.max(...group.map((p) => p.endDate?.getTime() || p.startDate?.getTime() || Date.now())),
      );

      groups.push({
        id: `${dayKey}-group-${index}`,
        plans: group,
        startTime,
        endTime,
        maxColumns: 0, // 後で計算
      });
    });
  });

  return groups;
}

/**
 * プラングループ内での列配置を計算
 * @param group プラングループ
 * @returns 列割り当て情報の配列
 */
export function calculatePlanColumns(group: PlanLayoutGroup): ColumnAssignment[] {
  if (group.plans.length === 0) return [];

  // プランを開始時刻でソート（nullの場合は現在時刻を使用）
  const sortedPlans = [...group.plans].sort((a, b) => {
    const aTime = a.startDate?.getTime() ?? Date.now();
    const bTime = b.startDate?.getTime() ?? Date.now();
    return aTime - bTime;
  });

  // 各プランの位置情報を作成（nullの場合は現在時刻を使用）
  const positions: PlanPosition[] = sortedPlans.map((plan) => ({
    plan,
    start: timeToMinutes(plan.startDate || new Date()),
    end: timeToMinutes(plan.endDate || plan.startDate || new Date()),
    column: undefined,
    columns: undefined,
  }));

  // 使用中の列を追跡（列番号 -> 終了時刻）
  const columnsInUse: Map<number, number> = new Map();

  // 各プランに列を割り当て（最大2列まで）
  positions.forEach((pos) => {
    // 利用可能な最小の列番号を見つける（最大MAX_COLUMNS列まで）
    let column = 0;
    while (column < MAX_COLUMNS && columnsInUse.has(column)) {
      const columnEndTime = columnsInUse.get(column)!;
      if (columnEndTime <= pos.start) {
        // この列は利用可能
        break;
      }
      column++;
    }

    // 最大列数を超える場合は最後の列に配置（重ねる）
    if (column >= MAX_COLUMNS) {
      column = MAX_COLUMNS - 1;
    }

    pos.column = column;
    columnsInUse.set(column, pos.end);
  });

  // 最大列数を計算（MAX_COLUMNS以下に制限）
  const maxColumns = Math.min(Math.max(...positions.map((p) => p.column!)) + 1, MAX_COLUMNS);

  // 各プランが実際に占有できる列数を計算
  positions.forEach((pos) => {
    const { start } = pos;
    const { end } = pos;
    const myColumn = pos.column!;

    // 同じ時間帯に存在する他のプランの最大列番号を見つける
    let maxColumnInTimeRange = myColumn;

    positions.forEach((other) => {
      if (other === pos) return;

      // 時間が重なっている場合
      if (other.start < end && other.end > start) {
        if (other.column! > maxColumnInTimeRange) {
          maxColumnInTimeRange = other.column!;
        }
      }
    });

    pos.columns = maxColumnInTimeRange - myColumn + 1;
  });

  // ColumnAssignment を作成
  const assignments: ColumnAssignment[] = positions.map((pos) => {
    const column = pos.column!;
    const totalColumns = maxColumns;

    // 幅と位置を計算（マージンを考慮）

    // 2列制限での幅と位置計算
    let width: number;
    let left: number;

    if (totalColumns === 1) {
      // 1列の場合：全幅使用
      width = 100 - PLAN_MARGIN;
      left = PLAN_MARGIN / 2;
    } else {
      // 2列の場合：半分ずつ
      width = (100 - PLAN_MARGIN * 3) / 2; // 3つのマージン分を除いた半分
      left = column === 0 ? PLAN_MARGIN : 50 + PLAN_MARGIN / 2;
    }

    return {
      planId: pos.plan.id,
      column,
      totalColumns,
      width,
      left,
    };
  });

  // グループの maxColumns を更新
  group.maxColumns = maxColumns;

  return assignments;
}

/**
 * カレンダープランにレイアウト情報を適用
 * @param plans カレンダープランの配列
 * @param dayStartHour 表示開始時刻（デフォルト: 0）
 * @param dayEndHour 表示終了時刻（デフォルト: 24）
 * @param hourHeight 1時間あたりの高さ（ピクセル、デフォルト: 60）
 * @returns レイアウト適用後のプラン配列
 */
export function applyPlanLayout(
  plans: CalendarPlan[],
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  hourHeight: number = 60,
): LayoutedPlan[] {
  if (plans.length === 0) return [];

  // 重なりグループを検出
  const groups = detectOverlappingPlans(plans);

  // 各グループの列配置を計算
  const allAssignments = new Map<string, ColumnAssignment>();

  groups.forEach((group) => {
    const assignments = calculatePlanColumns(group);
    assignments.forEach((assignment) => {
      allAssignments.set(assignment.planId, assignment);
    });
  });

  // レイアウト情報を適用
  const layoutedPlans: LayoutedPlan[] = plans.map((plan) => {
    const assignment = allAssignments.get(plan.id);

    // 時間を位置に変換（startDate が null の場合は現在時刻を使用）
    const startDate = plan.startDate || new Date();
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = plan.endDate
      ? plan.endDate.getHours() * 60 + plan.endDate.getMinutes()
      : startMinutes + 60; // デフォルト1時間

    const dayStartMinutes = dayStartHour * 60;
    const dayEndMinutes = dayEndHour * 60;
    const dayDurationMinutes = dayEndMinutes - dayStartMinutes;

    // ピクセル単位での位置と高さを計算
    const minuteHeight = (hourHeight * (dayEndHour - dayStartHour)) / dayDurationMinutes;
    const top = (startMinutes - dayStartMinutes) * minuteHeight;
    const height = Math.max((endMinutes - startMinutes) * minuteHeight, 20); // 最小高さ20px

    // デフォルトレイアウト（重なりがない場合）
    let layout = {
      column: 0,
      totalColumns: 1,
      width: 95, // デフォルト幅（マージン考慮）
      left: 2.5, // センタリング
      top,
      height,
      zIndex: 1,
    };

    // 割り当てがある場合は適用
    if (assignment) {
      layout = {
        column: assignment.column,
        totalColumns: assignment.totalColumns,
        width: assignment.width,
        left: assignment.left,
        top,
        height,
        zIndex: assignment.column + 1, // 後の列ほど前面に
      };
    }

    return {
      ...plan,
      layout,
    };
  });

  return layoutedPlans;
}

/**
 * レスポンシブ対応のレイアウト計算
 * 画面幅に応じて列数を調整
 */
export function applyResponsivePlanLayout(
  plans: CalendarPlan[],
  containerWidth: number,
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  hourHeight: number = 60,
): LayoutedPlan[] {
  // 画面幅に応じて最大列数を制限
  const maxColumnsAllowed =
    containerWidth < 400 ? 2 : containerWidth < 600 ? 3 : containerWidth < 800 ? 4 : Infinity;

  const layoutedPlans = applyPlanLayout(plans, dayStartHour, dayEndHour, hourHeight);

  // 最大列数を超える場合は調整
  layoutedPlans.forEach((plan) => {
    if (plan.layout.totalColumns > maxColumnsAllowed) {
      const scaleFactor = maxColumnsAllowed / plan.layout.totalColumns;

      // 幅を調整（最小幅を保証）
      plan.layout.width = Math.max(plan.layout.width * scaleFactor, MIN_PLAN_WIDTH);

      // 位置を調整（列インデックスに基づいて再計算）
      const adjustedColumn = Math.min(plan.layout.column, maxColumnsAllowed - 1);
      const baseWidth = 100 / maxColumnsAllowed;
      plan.layout.left = adjustedColumn * baseWidth + PLAN_MARGIN / 2;

      plan.layout.totalColumns = maxColumnsAllowed;
      plan.layout.column = adjustedColumn;
    }
  });

  return layoutedPlans;
}

/**
 * デバッグ用: レイアウト情報を文字列で表示
 */
export function debugLayoutInfo(layoutedPlans: LayoutedPlan[]): string {
  return layoutedPlans
    .map((plan) => {
      const { layout } = plan;
      return `${plan.title}: Column ${layout.column}/${layout.totalColumns}, Width: ${layout.width.toFixed(1)}%, Left: ${layout.left.toFixed(1)}%, Height: ${layout.height.toFixed(0)}px`;
    })
    .join('\n');
}

// 後方互換性のためのエイリアス
/** @deprecated Use applyPlanLayout instead */
export const applyEventLayout = applyPlanLayout;
/** @deprecated Use applyResponsivePlanLayout instead */
export const applyResponsiveEventLayout = applyResponsivePlanLayout;
/** @deprecated Use detectOverlappingPlans instead */
export const detectOverlappingEvents = detectOverlappingPlans;
/** @deprecated Use calculatePlanColumns instead */
export const calculateEventColumns = calculatePlanColumns;
/** @deprecated Use LayoutedPlan instead */
export type LayoutedEvent = LayoutedPlan;
