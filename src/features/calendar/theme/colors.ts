// features/calendar/theme/colors.ts
// カレンダー専用のカラー定義（Tailwindクラスベース）

// 型定義
export interface CalendarColors {
  event: {
    // ステータス別
    scheduled: ColorSet;
    backlog: ColorSet;
    waiting: ColorSet;
    blocked: ColorSet;
    completed: ColorSet;
    cancelled: ColorSet;

    // タイプ別（将来拡張用）
    task: ColorSet;
    log: ColorSet;
  };

  // UI状態
  states: {
    ghost: ColorSet; // ゴースト表示
    selected: ColorSet; // 選択時
    displayPeriod: ColorSet; // 表示期間
    conflict: ColorSet; // 衝突時
  };
}

interface ColorSet {
  background: string;
  text: string;
  hover?: string;
  active?: string;
}

// カレンダー専用カラー（既存テーマシステム準拠、M3原則）
export const calendarColors: CalendarColors = {
  event: {
    // scheduled - M3: surface-container使用、コントラスト比確保
    scheduled: {
      background: 'bg-surface-container',
      text: 'text-foreground',
      active: 'bg-surface-container-high',
    },

    // backlog - セカンダリー系（グレー）
    backlog: {
      background: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      hover: 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      active: 'bg-neutral-300 dark:bg-neutral-600',
    },

    // waiting - 警告系（黄色）
    waiting: {
      background: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-800 dark:text-amber-200',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      active: 'bg-amber-200 dark:bg-amber-800/40',
    },

    // blocked - エラー系（赤）
    blocked: {
      background: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      active: 'bg-red-200 dark:bg-red-800/40',
    },

    // completed - 成功系（緑）
    completed: {
      background: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      active: 'bg-green-200 dark:bg-green-800/40',
    },

    // cancelled - 無効系（コントラスト比改善: 4.5:1以上確保）
    cancelled: {
      background: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      hover: 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
      active: 'bg-neutral-300 dark:bg-neutral-600',
    },

    // task - M3: surface-container使用、コントラスト比確保
    task: {
      background: 'bg-surface-container',
      text: 'text-foreground',
    },

    // log - ログ系（緑ベース）
    log: {
      background: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-700 dark:text-green-300',
    },
  },

  states: {
    // ghost - ゴースト表示（M3: muted使用）
    ghost: {
      background: 'bg-muted',
      text: 'text-muted-foreground',
    },

    // selected - 選択時（M3: surface-container-high使用）
    selected: {
      background: 'bg-surface-container-high',
      text: 'inherit',
    },

    // displayPeriod - 表示期間（M3: surface-container使用）
    displayPeriod: {
      background: 'bg-surface-container',
      text: 'inherit',
    },

    // conflict - 衝突時（M3: destructive系）
    conflict: {
      background: 'bg-destructive/10',
      text: 'text-destructive',
    },
  },
} as const;
